export const emptyClient = {
  clientName: '',
  email: '',
  phone: '',
  address: '',
  companyName: ''
}

export const emptyInvoice = {
  invoiceNumber: '',
  client: '',
  taxPercent: 18,
  discount: 0,
  status: 'draft',
  dueDate: '',
  items: [{ itemName: '', quantity: 1, price: 0 }]
}

export const emptySummary = {
  totalInvoices: 0,
  paidInvoices: 0,
  pendingInvoices: 0,
  totalRevenue: 0
}
