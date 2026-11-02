import { useMemo, useState, useRef } from "react";

import { extractReceiptData } from "../services/api";

function InvoiceForm({
  selectedClientName,
  invoiceData,
  setInvoiceData,
  onSubmit,
}) {
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);
  const invoiceTotal = useMemo(() => {
    const subTotal = invoiceData.items.reduce((sum, item) => {
      return sum + Number(item.quantity || 0) * Number(item.price || 0);
    }, 0);

    const taxAmount = (subTotal * Number(invoiceData.taxPercent || 0)) / 100;
    const totalAmount =
      subTotal + taxAmount - Number(invoiceData.discount || 0);

    return { subTotal, taxAmount, totalAmount };
  }, [invoiceData]);

  // AI Extract Handler
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsScanning(true);
    const formData = new FormData();
    formData.append("receipt", file);

    try {
      const token = localStorage.getItem("invoiceToken");
      const response = await extractReceiptData(formData, token);
      const aiData = response.data;

      // Auto-fill state with AI data
      setInvoiceData((prev) => ({
        ...prev,
        items: aiData.items.length > 0 ? aiData.items : prev.items,
        taxPercent: aiData.taxPercent || prev.taxPercent,
        client: aiData.matchedClientId || prev.client, // Auto-select client if matched
      }));

      alert(
        aiData.matchedClientId
          ? "Receipt scanned and client matched!"
          : "Receipt scanned! Please assign a client.",
      );
    } catch (error) {
      alert(error.response?.data?.error || "Failed to scan receipt");
    } finally {
      setIsScanning(false);
      event.target.value = null; // reset input
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInvoiceData({ ...invoiceData, [name]: value });
  };

  const handleItemChange = (index, event) => {
    const { name, value } = event.target;
    const items = [...invoiceData.items];
    items[index] = { ...items[index], [name]: value };
    setInvoiceData({ ...invoiceData, items });
  };

  const addItem = () => {
    const newItem = { itemName: "", quantity: 1, price: 0 };
    setInvoiceData({ ...invoiceData, items: [...invoiceData.items, newItem] });
  };

  const removeItem = (index) => {
    if (invoiceData.items.length === 1) return;

    const items = invoiceData.items.filter(
      (item, itemIndex) => itemIndex !== index,
    );
    setInvoiceData({ ...invoiceData, items });
  };

  return (
    <section className="panel">
      <div
        className="panel-heading"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <h2>Create Invoice</h2>

        {/* Magic Scan Button */}
        <div>
          <input
            type="file"
            accept="image/*,application/pdf"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            disabled={isScanning}
            style={{
              background: "#e8f5f1",
              color: "#087f72",
              borderColor: "#087f72",
            }}
          >
            {isScanning ? "Scanning with AI..." : "✨ Scan Receipt"}
          </button>
        </div>
      </div>

      <form className="form invoice-form" onSubmit={onSubmit}>
        <label>
          Invoice Number
          <input
            name="invoiceNumber"
            value={invoiceData.invoiceNumber}
            onChange={handleChange}
            placeholder="INV-001"
            required
          />
        </label>

        <div className="client-note">
          <span>Client</span>
          <strong>{selectedClientName || "Add a client first"}</strong>
        </div>

        <label>
          Tax %
          <input
            type="number"
            name="taxPercent"
            value={invoiceData.taxPercent}
            onChange={handleChange}
          />
        </label>

        <label>
          Discount
          <input
            type="number"
            name="discount"
            value={invoiceData.discount}
            onChange={handleChange}
          />
        </label>

        <label>
          Due Date
          <input
            type="date"
            name="dueDate"
            value={invoiceData.dueDate}
            onChange={handleChange}
          />
        </label>

        <label>
          Status
          <select
            name="status"
            value={invoiceData.status}
            onChange={handleChange}
          >
            <option value="draft">draft</option>
            <option value="sent">sent</option>
            <option value="paid">paid</option>
          </select>
        </label>

        <div className="items-box">
          <div className="items-head">
            <h3>Items</h3>
            <button type="button" onClick={addItem}>
              Add Item
            </button>
          </div>

          {invoiceData.items.map((item, index) => (
            <div className="item-row" key={index}>
              <input
                name="itemName"
                value={item.itemName}
                onChange={(event) => handleItemChange(index, event)}
                placeholder="Website Design"
                required
              />
              <input
                type="number"
                name="quantity"
                value={item.quantity}
                onChange={(event) => handleItemChange(index, event)}
                min="1"
                required
              />
              <input
                type="number"
                name="price"
                value={item.price}
                onChange={(event) => handleItemChange(index, event)}
                min="0"
                required
              />
              <span>
                Rs {Number(item.quantity || 0) * Number(item.price || 0)}
              </span>
              <button type="button" onClick={() => removeItem(index)}>
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="total-box">
          <span>Subtotal: Rs {invoiceTotal.subTotal}</span>
          <span>Tax: Rs {invoiceTotal.taxAmount}</span>
          <strong>Total: Rs {invoiceTotal.totalAmount}</strong>
        </div>

        <button className="primary-btn" type="submit">
          Create Invoice
        </button>
      </form>
    </section>
  );
}

export default InvoiceForm;
