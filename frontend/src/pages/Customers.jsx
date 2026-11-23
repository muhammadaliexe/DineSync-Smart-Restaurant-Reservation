// ==========================================
// Customers Page
// ==========================================
import { useState, useEffect } from 'react';
import API_BASE from '../api';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchPhone, setSearchPhone] = useState('');

  // Form state for adding a new customer
  const [form, setForm] = useState({ Name: '', Phone: '', Email: '' });

  // Fetch all customers
  const fetchCustomers = () => {
    setLoading(true);
    fetch(`${API_BASE}/customers`)
      .then((res) => res.json())
      .then((data) => {
        setCustomers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add a new customer
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message);
        setForm({ Name: '', Phone: '', Email: '' });
        fetchCustomers(); // Refresh list
        setTimeout(() => setMessage(''), 3000);
      })
      .catch((err) => console.error('Error:', err));
  };

  // Search customers by phone
  const handleSearch = () => {
    if (!searchPhone.trim()) {
      fetchCustomers();
      return;
    }
    fetch(`${API_BASE}/customers/search?phone=${searchPhone}`)
      .then((res) => res.json())
      .then((data) => setCustomers(data))
      .catch((err) => console.error('Error:', err));
  };

  // Delete a customer
  const handleDelete = (id) => {
    if (!window.confirm(`Delete customer #${id}? This cannot be undone.`)) return;
    fetch(`${API_BASE}/customers/${id}`, { method: 'DELETE' })
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message);
        fetchCustomers(); // Refresh list
        setTimeout(() => setMessage(''), 3000);
      })
      .catch((err) => console.error('Error deleting customer:', err));
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h2>Customers</h2>
        <p>Manage your restaurant customers</p>
      </div>

      {/* Success Message */}
      {message && <div className="alert alert-success">✅ {message}</div>}

      <div className="grid-2">
        {/* Add Customer Form */}
        <div className="card">
          <h3 className="section-title">➕ Add New Customer</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="Name"
                value={form.Name}
                onChange={handleChange}
                placeholder="Enter customer name"
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                name="Phone"
                value={form.Phone}
                onChange={handleChange}
                placeholder="03001234567"
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="Email"
                value={form.Email}
                onChange={handleChange}
                placeholder="customer@email.com"
              />
            </div>
            <button type="submit" className="btn btn-primary">Add Customer</button>
          </form>
        </div>

        {/* Search */}
        <div className="card">
          <h3 className="section-title">🔍 Search by Phone</h3>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              placeholder="Enter phone number to search"
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary" onClick={handleSearch}>Search</button>
            <button className="btn btn-outline" onClick={() => { setSearchPhone(''); fetchCustomers(); }}>
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="card" style={{ marginTop: '24px' }}>
        <h3 className="section-title">📋 All Customers</h3>
        {loading ? (
          <div className="loading"><div className="spinner"></div>Loading...</div>
        ) : customers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <p>No customers found</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.CustomerID}>
                  <td>{c.CustomerID}</td>
                  <td>{c.Name}</td>
                  <td>{c.Phone}</td>
                  <td>{c.Email}</td>
                  <td>
                    <button className="btn btn-outline btn-sm" onClick={() => handleDelete(c.CustomerID)}>
                      🗑️ Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Customers;
