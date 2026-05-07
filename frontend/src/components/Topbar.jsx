function Topbar({ user, onLogout }) {
  return (
    <section className="topbar">
      <div>
        <p className="eyebrow">Business Billing</p>
        <h1>Invoice Dashboard</h1>
      </div>

      <div className="login-state">
        <span>{user?.name || user?.email || 'User connected'}</span>
        <button onClick={onLogout}>Logout</button>
      </div>
    </section>
  )
}

export default Topbar
