import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

export const authHeader = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`
  }
})

export const signupUser = (userData) => {
  return axios.post(`${API_URL}/user/signup`, userData)
}

export const loginUser = (loginData) => {
  return axios.post(`${API_URL}/user/login`, loginData)
}

export const getClients = (token) => {
  return axios.get(`${API_URL}/client`, authHeader(token))
}

export const addClient = (clientData, token) => {
  return axios.post(`${API_URL}/client`, clientData, authHeader(token))
}

export const getInvoices = (token) => {
  return axios.get(`${API_URL}/invoice`, authHeader(token))
}

export const getInvoiceSummary = (token) => {
  return axios.get(`${API_URL}/invoice/summary/count`, authHeader(token))
}

export const addInvoice = (invoiceData, token) => {
  return axios.post(`${API_URL}/invoice`, invoiceData, authHeader(token))
}

export const changeInvoiceStatus = (invoiceID, status, token) => {
  return axios.put(`${API_URL}/invoice/status/${invoiceID}`, { status }, authHeader(token))
}

export const removeInvoice = (invoiceID, token) => {
  return axios.delete(`${API_URL}/invoice/${invoiceID}`, authHeader(token))
}
