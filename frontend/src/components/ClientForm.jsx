function ClientForm({ clientData, setClientData, onSubmit }) {
  const handleChange = (event) => {
    const { name, value } = event.target
    setClientData({ ...clientData, [name]: value })
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Add Client</h2>
      </div>

      <form className="form client-form" onSubmit={onSubmit}>
        <label>
          Client Name
          <input name="clientName" value={clientData.clientName} onChange={handleChange} required />
        </label>

        <label>
          Company
          <input name="companyName" value={clientData.companyName} onChange={handleChange} />
        </label>

        <label>
          Email
          <input type="email" name="email" value={clientData.email} onChange={handleChange} required />
        </label>

        <label>
          Phone
          <input name="phone" value={clientData.phone} onChange={handleChange} />
        </label>

        <label className="wide">
          Address
          <input name="address" value={clientData.address} onChange={handleChange} required />
        </label>

        <button className="primary-btn" type="submit">
          Add Client
        </button>
      </form>
    </section>
  )
}

export default ClientForm
