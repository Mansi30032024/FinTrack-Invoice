function StatsGrid({ summary }) {
  return (
    <section className="stats-grid">
      <div className="stat-card">
        <span>Total Invoices</span>
        <strong>{summary.totalInvoices}</strong>
      </div>
      <div className="stat-card paid">
        <span>Paid</span>
        <strong>{summary.paidInvoices}</strong>
      </div>
      <div className="stat-card pending">
        <span>Pending</span>
        <strong>{summary.pendingInvoices}</strong>
      </div>
      <div className="stat-card revenue">
        <span>Revenue</span>
        <strong>Rs {summary.totalRevenue}</strong>
      </div>
    </section>
  )
}

export default StatsGrid
