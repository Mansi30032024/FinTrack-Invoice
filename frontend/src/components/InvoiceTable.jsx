function InvoiceTable({ invoices, clientsCount, onStatusChange, onPrint, onDelete }) {
  return (
    <section className="table-section">
      <div className="panel-heading">
        <h2>Invoices</h2>
        <span>{clientsCount} clients saved</span>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Client</th>
              <th>Status</th>
              <th>Subtotal</th>
              <th>Tax</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice._id}>
                <td>{invoice.invoiceNumber}</td>
                <td>{invoice.client?.clientName}</td>
                <td>
                  <select
                    className={`status ${invoice.status}`}
                    value={invoice.status}
                    onChange={(event) => onStatusChange(invoice._id, event.target.value)}
                  >
                    <option value="draft">draft</option>
                    <option value="sent">sent</option>
                    <option value="paid">paid</option>
                  </select>
                </td>
                <td>Rs {invoice.subTotal}</td>
                <td>Rs {invoice.taxAmount}</td>
                <td>Rs {invoice.totalAmount}</td>
                <td className="actions">
                  <button onClick={() => onPrint(invoice)}>Print</button>
                  <button onClick={() => onDelete(invoice._id)}>Delete</button>
                </td>
              </tr>
            ))}

            {invoices.length === 0 && (
              <tr>
                <td colSpan="7" className="empty">
                  No invoices created yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default InvoiceTable
