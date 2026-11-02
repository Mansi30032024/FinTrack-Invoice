const express = require("express");
const router = express.Router();
const Invoice = require("./../models/invoice");
const { jwtAuthMiddleware } = require("./../jwt");

const multer = require("multer");
const { GoogleGenAI } = require("@google/genai");

// Memory storage for image processing
const upload = multer({ storage: multer.memoryStorage() });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// POST /invoice/extract
// Extract data from receipt image using Gemini
router.post(
  "/extract",
  jwtAuthMiddleware,
  upload.single("receipt"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Please upload a receipt image" });
      }

      // Prompt enforcing strict JSON output
      const prompt = `Analyze this receipt/invoice image. Extract the line items, taxes, and client/company name. 
    Return strictly a raw JSON object (without markdown blocks or backticks) matching this exact schema:
    {
      "extractedClientName": "Company or Person Name",
      "taxPercent": 18,
      "items": [
        { "itemName": "Product/Service Name", "quantity": 1, "price": 100 }
      ]
    }
    If a value is not found, use default 0 or empty string. Quantity defaults to 1.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          prompt,
          {
            inlineData: {
              data: req.file.buffer.toString("base64"),
              mimeType: req.file.mimetype,
            },
          },
        ],
      });

      // Clean potential markdown formatting from AI response
      const jsonString = response.text
        .replace(/```json/gi, "")
        .replace(/```/gi, "")
        .trim();
      const extractedData = JSON.parse(jsonString);

      // Smart Client Matching (Bonus Feature)
      const Client = require("./../models/client");
      const existingClient = await Client.findOne({
        clientName: {
          $regex: new RegExp(extractedData.extractedClientName, "i"),
        },
        createdBy: req.user._id,
      });

      if (existingClient) {
        extractedData.matchedClientId = existingClient._id;
      }

      res.status(200).json(extractedData);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Failed to parse receipt" });
    }
  },
);

// POST /invoice
// Create a new invoice with items and automatic total calculation
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    const data = req.body;
    data.createdBy = req.user._id;

    const newInvoice = new Invoice(data);
    const response = await newInvoice.save();

    console.log("Invoice created successfully");
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /invoice
// Get all invoices with client details
router.get("/", jwtAuthMiddleware, async (req, res) => {
  try {
    const invoices = await Invoice.find({ createdBy: req.user._id })
      .populate("client")
      .sort({ createdAt: -1 });

    console.log("Invoices data fetched");
    res.status(200).json(invoices);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /invoice/summary/count
// Get invoice dashboard summary
router.get("/summary/count", jwtAuthMiddleware, async (req, res) => {
  try {
    const invoices = await Invoice.find({ createdBy: req.user._id });

    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(
      (invoice) => invoice.status === "paid",
    ).length;
    const pendingInvoices = invoices.filter(
      (invoice) => invoice.status !== "paid",
    ).length;
    const totalRevenue = invoices.reduce(
      (sum, invoice) => sum + invoice.totalAmount,
      0,
    );

    res.status(200).json({
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      totalRevenue,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /invoice/:invoiceID
// Get one invoice by id
router.get("/:invoiceID", jwtAuthMiddleware, async (req, res) => {
  try {
    const invoiceID = req.params.invoiceID;
    const invoice = await Invoice.findOne({
      _id: invoiceID,
      createdBy: req.user._id,
    }).populate("client");

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    res.status(200).json(invoice);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT /invoice/:invoiceID
// Update invoice details
router.put("/:invoiceID", jwtAuthMiddleware, async (req, res) => {
  try {
    const invoiceID = req.params.invoiceID;

    const invoice = await Invoice.findOne({
      _id: invoiceID,
      createdBy: req.user._id,
    });

    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    Object.assign(invoice, req.body);
    const response = await invoice.save();

    console.log("Invoice updated");
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT /invoice/status/:invoiceID
// Update invoice status like draft, sent or paid
router.put("/status/:invoiceID", jwtAuthMiddleware, async (req, res) => {
  try {
    const invoiceID = req.params.invoiceID;
    const { status } = req.body;

    const response = await Invoice.findOneAndUpdate(
      { _id: invoiceID, createdBy: req.user._id },
      { status },
      { new: true, runValidators: true },
    );

    if (!response) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    console.log("Invoice status updated");
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// DELETE /invoice/:invoiceID
// Delete an invoice
router.delete("/:invoiceID", jwtAuthMiddleware, async (req, res) => {
  try {
    const invoiceID = req.params.invoiceID;
    const response = await Invoice.findOneAndDelete({
      _id: invoiceID,
      createdBy: req.user._id,
    });

    if (!response) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    console.log("Invoice deleted");
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
