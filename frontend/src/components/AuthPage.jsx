import { useState } from 'react'
import { loginUser, signupUser } from '../services/api'

const blankForm = {
  name: '',
  email: '',
  password: ''
}

function AuthPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState(blankForm)
  const [message, setMessage] = useState('')

  const title = isLogin ? 'Login to your workspace' : 'Create your account'
  const buttonText = isLogin ? 'Login' : 'Signup'

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    try {
      const response = isLogin
        ? await loginUser({ email: formData.email, password: formData.password })
        : await signupUser(formData)

      onLogin(response.data.token, response.data.user)
    } catch (err) {
      setMessage(err.response?.data?.error || 'Server not responding')
    }
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setMessage('')
  }

  return (
    <main className="auth-page">
      <section className="auth-intro">
        <p className="eyebrow">Invoice Manager</p>
        <h1>Track clients, create invoices, and monitor payments in one clean dashboard.</h1>
        <div className="auth-points">
          <span>JWT Auth</span>
          <span>Client CRM</span>
          <span>Invoice Analytics</span>
        </div>
      </section>

      <section className="auth-card">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Welcome</p>
            <h2>{title}</h2>
          </div>
          <button type="button" onClick={switchMode}>
            {isLogin ? 'Signup' : 'Login'}
          </button>
        </div>

        {message && <p className="message error-message">{message}</p>}

        <form className="form" onSubmit={handleSubmit}>
          {!isLogin && (
            <label>
              Name
              <input name="name" value={formData.name} onChange={handleChange} required />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>

          <button className="primary-btn" type="submit">
            {buttonText}
          </button>
        </form>
      </section>
    </main>
  )
}

export default AuthPage
