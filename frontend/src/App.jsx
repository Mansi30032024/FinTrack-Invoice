import { useState } from 'react'
import './App.css'
import AuthPage from './components/AuthPage'
import Dashboard from './components/Dashboard'

function App() {
  const savedToken = localStorage.getItem('invoiceToken') || ''
  const savedUser = JSON.parse(localStorage.getItem('invoiceUser') || 'null')

  const [token, setToken] = useState(savedToken)
  const [user, setUser] = useState(savedUser)

  const handleLogin = (newToken, userData) => {
    localStorage.setItem('invoiceToken', newToken)
    localStorage.setItem('invoiceUser', JSON.stringify(userData))

    setToken(newToken)
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('invoiceToken')
    localStorage.removeItem('invoiceUser')

    setToken('')
    setUser(null)
  }

  if (!token) {
    return <AuthPage onLogin={handleLogin} />
  }

  return <Dashboard token={token} user={user} onLogout={handleLogout} />
}

export default App
