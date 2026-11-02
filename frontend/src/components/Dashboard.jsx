import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  addClient,
  addInvoice,
  changeInvoiceStatus,
  getClients,
  getInvoices,
  getInvoiceSummary,
  removeInvoice,
} from "../services/api";
import { emptyClient, emptyInvoice, emptySummary } from "../data/formDefaults";
import ClientForm from "./ClientForm";
import InvoiceForm from "./InvoiceForm";
import InvoiceTable from "./InvoiceTable";
import StatsGrid from "./StatsGrid";
import Topbar from "./Topbar";

function Dashboard({ token, user, onLogout }) {
  const [message, setMessage] = useState("");
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState(emptySummary);
  const [clientData, setClientData] = useState(emptyClient);
  const [invoiceData, setInvoiceData] = useState(emptyInvoice);

  const fetchDashboardData = useCallback(() => {
    return Promise.all([
      getClients(token),
      getInvoices(token),
      getInvoiceSummary(token),
    ]);
  }, [token]);

  const saveDashboardData = useCallback(
    ([clientsResponse, invoicesResponse, summaryResponse]) => {
      setClients(clientsResponse.data);
      setInvoices(invoicesResponse.data);
      setSummary(summaryResponse.data);
    },
    [],
  );

  useEffect(() => {
    let pageIsOpen = true;

    fetchDashboardData()
      .then((responses) => {
        if (pageIsOpen) saveDashboardData(responses);
      })
      .catch((err) => {
        if (pageIsOpen)
          setMessage(
            err.response?.data?.error || "Unable to load dashboard data",
          );
      });

    return () => {
      pageIsOpen = false;
    };
  }, [fetchDashboardData, saveDashboardData]);

  const loadDashboardData = async () => {
    try {
      const responses = await fetchDashboardData();
      saveDashboardData(responses);
    } catch (err) {
      setMessage(err.response?.data?.error || "Unable to load dashboard data");
    }
  };

  const handleClientSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await addClient(clientData, token);
      setClientData(emptyClient);
      setInvoiceData({ ...invoiceData, client: response.data._id });
      setMessage("Client added successfully");
      loadDashboardData();
    } catch (err) {
      setMessage(err.response?.data?.error || "Server not responding");
    }
  };

  const handleInvoiceSubmit = async (event) => {
    event.preventDefault();
    const selectedClient =
      clients.find((client) => client._id === invoiceData.client) || clients[0];
    if (!selectedClient) {
      setMessage("Please add a client first");
      return;
    }

    try {
      if (invoiceData._id) {
        // Edit mode: Update existing invoice (Replace API_URL with your actual backend URL variable)
        await axios.put(
          `${import.meta.env.VITE_API_URL}/invoice/${invoiceData._id}`,
          { ...invoiceData, client: selectedClient._id },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setMessage("Invoice updated successfully");
      } else {
        // Create mode
        await addInvoice({ ...invoiceData, client: selectedClient._id }, token);
        setMessage("Invoice created successfully");
      }

      setInvoiceData(emptyInvoice);
      loadDashboardData();
    } catch (err) {
      setMessage(err.response?.data?.error || "Server not responding");
    }
  };

  const updateStatus = async (invoiceID, status) => {
    try {
      await changeInvoiceStatus(invoiceID, status, token);
      setMessage("Invoice status updated");
      loadDashboardData();
    } catch (err) {
      setMessage(err.response?.data?.error || "Server not responding");
    }
  };

  const deleteInvoice = async (invoiceID) => {
    try {
      await removeInvoice(invoiceID, token);
      setMessage("Invoice deleted successfully");
      loadDashboardData();
    } catch (err) {
      setMessage(err.response?.data?.error || "Server not responding");
    }
  };

  const printInvoice = (invoice) => {
    const clientName = invoice.client?.clientName || "Client";
    const itemsHtml = invoice.items
      .map(
        (item) =>
          `<tr><td>${item.itemName}</td><td>${item.quantity}</td><td>Rs ${item.price}</td><td>Rs ${item.quantity * item.price}</td></tr>`,
      )
      .join("");

    const html = `
    <html>
      <head>
        <title>Invoice - ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
          .header { border-bottom: 2px solid #087f72; padding-bottom: 20px; margin-bottom: 30px; }
          h1 { color: #087f72; margin: 0; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f4f7f6; color: #333; }
          .totals { text-align: right; font-size: 16px; line-height: 1.6; }
          .grand-total { font-size: 20px; font-weight: bold; color: #087f72; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INVOICE</h1>
          <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}<br>
          <strong>Status:</strong> ${invoice.status.toUpperCase()}</p>
        </div>
        <div style="margin-bottom: 30px;">
          <strong>Bill To:</strong><br>
          ${clientName}<br>
          ${invoice.client?.email || ""}<br>
          ${invoice.client?.address || ""}
        </div>
        <table>
          <thead><tr><th>Description</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div class="totals">
          <div>Subtotal: Rs ${invoice.subTotal}</div>
          <div>Tax (${invoice.taxPercent}%): Rs ${invoice.taxAmount}</div>
          <div>Discount: Rs ${invoice.discount}</div>
          <div class="grand-total">Total Due: Rs ${invoice.totalAmount}</div>
        </div>
      </body>
    </html>
  `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300); // Trigger print dialog (users can click "Save as PDF")
  };

  const handleEditInvoice = (invoice) => {
    setInvoiceData({
      ...invoice,
      client: invoice.client?._id || "",
      dueDate: invoice.dueDate ? invoice.dueDate.split("T")[0] : "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" }); // Form scroll
  };
  return (
    <main className="invoice-app">
      <Topbar user={user} onLogout={onLogout} />
      <StatsGrid summary={summary} />

      {message && <p className="message">{message}</p>}

      <section className="main-grid">
        <ClientForm
          clientData={clientData}
          setClientData={setClientData}
          onSubmit={handleClientSubmit}
        />

        <InvoiceForm
          selectedClientName={
            clients.find((client) => client._id === invoiceData.client)
              ?.clientName || clients[0]?.clientName
          }
          invoiceData={invoiceData}
          setInvoiceData={setInvoiceData}
          onSubmit={handleInvoiceSubmit}
        />
      </section>

      <InvoiceTable
        invoices={invoices}
        clientsCount={clients.length}
        onStatusChange={updateStatus}
        onPrint={printInvoice}
        onDelete={deleteInvoice}
        onEdit={handleEditInvoice}
      />
    </main>
  );
}

export default Dashboard;
