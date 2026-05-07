import { useCallback, useEffect, useState } from 'react'
import {
  addClient,
  addInvoice,
  changeInvoiceStatus,
  getClients,
  getInvoices,
  getInvoiceSummary,
  removeInvoice
} from '../services/api'
import { emptyClient, emptyInvoice, emptySummary } from '../data/formDefaults'
import ClientForm from './ClientForm'
import InvoiceForm from './InvoiceForm'
import InvoiceTable from './InvoiceTable'
import StatsGrid from './StatsGrid'
import Topbar from './Topbar'

function Dashboard({ token, user, onLogout }) {
  const [message, setMessage] = useState('')
  const [clients, setClients] = useState([])
  const [invoices, setInvoices] = useState([])
  const [summary, setSummary] = useState(emptySummary)
  const [clientData, setClientData] = useState(emptyClient)
  const [invoiceData, setInvoiceData] = useState(emptyInvoice)

  const fetchDashboardData = useCallback(() => {
    return Promise.all([getClients(token), getInvoices(token), getInvoiceSummary(token)])
  }, [token])

  const saveDashboardData = useCallback(([clientsResponse, invoicesResponse, summaryResponse]) => {
    setClients(clientsResponse.data)
    setInvoices(invoicesResponse.data)
    setSummary(summaryResponse.data)
  }, [])

  useEffect(() => {
    let pageIsOpen = true

    fetchDashboardData()
      .then((responses) => {
        if (pageIsOpen) saveDashboardData(responses)
      })
      .catch((err) => {
        if (pageIsOpen) setMessage(err.response?.data?.error || 'Unable to load dashboard data')
      })

    return () => {
      pageIsOpen = false
    }
  }, [fetchDashboardData, saveDashboardData])

  const loadDashboardData = async () => {
    try {
      const responses = await fetchDashboardData()
      saveDashboardData(responses)
    } catch (err) {
      setMessage(err.response?.data?.error || 'Unable to load dashboard data')
    }
  }

  const handleClientSubmit = async (event) => {
    event.preventDefault()

    try {
      const response = await addClient(clientData, token)
      setClientData(emptyClient)
      setInvoiceData({ ...invoiceData, client: response.data._id })
      setMessage('Client added successfully')
      loadDashboardData()
    } catch (err) {
      setMessage(err.response?.data?.error || 'Server not responding')
    }
  }

  const handleInvoiceSubmit = async (event) => {
    event.preventDefault()
    const selectedClient = clients.find((client) => client._id === invoiceData.client) || clients[0]

    if (!selectedClient) {
      setMessage('Please add a client first')
      return
    }

    try {
      await addInvoice({ ...invoiceData, client: selectedClient._id }, token)
      setInvoiceData(emptyInvoice)
      setMessage('Invoice created successfully')
      loadDashboardData()
    } catch (err) {
      setMessage(err.response?.data?.error || 'Server not responding')
    }
  }

  const updateStatus = async (invoiceID, status) => {
    try {
      await changeInvoiceStatus(invoiceID, status, token)
      setMessage('Invoice status updated')
      loadDashboardData()
    } catch (err) {
      setMessage(err.response?.data?.error || 'Server not responding')
    }
  }

  const deleteInvoice = async (invoiceID) => {
    try {
      await removeInvoice(invoiceID, token)
      setMessage('Invoice deleted successfully')
      loadDashboardData()
    } catch (err) {
      setMessage(err.response?.data?.error || 'Server not responding')
    }
  }

  const printInvoice = (invoice) => {
    const clientName = invoice.client?.clientName || 'Client'
    const text = `Invoice: ${invoice.invoiceNumber}\nClient: ${clientName}\nTotal: Rs ${invoice.totalAmount}`
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`<pre>${text}</pre>`)
    printWindow.print()
  }

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
            clients.find((client) => client._id === invoiceData.client)?.clientName ||
            clients[0]?.clientName
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
      />
    </main>
  )
}

export default Dashboard
