// ==========================================
// Menu Page
// ==========================================
import { useState, useEffect } from 'react';
import API_BASE from '../api';

function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Form state
  const [form, setForm] = useState({ Name: '', Price: '', Category: '' });

  // Predefined categories
  const categories = ['Pizza', 'Main Course', 'Appetizer', 'Side', 'Beverage', 'Dessert', 'Seasonal'];

  // Fetch all menu items
  const fetchMenu = () => {
    setLoading(true);
    fetch(`${API_BASE}/menu`)
      .then((res) => res.json())
      .then((data) => {
        setMenuItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add menu item
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/menu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message);
        setForm({ Name: '', Price: '', Category: '' });
        fetchMenu();
        setTimeout(() => setMessage(''), 3000);
      })
      .catch((err) => console.error('Error:', err));
  };

  // Delete menu item
  const handleDelete = (id, name) => {
    if (!window.confirm(`Delete "${name}" from menu?`)) return;
    fetch(`${API_BASE}/menu/${id}`, { method: 'DELETE' })
      .then((res) => res.json())
      .then(() => {
        setMessage('Menu item deleted!');
        fetchMenu();
        setTimeout(() => setMessage(''), 3000);
      })
      .catch((err) => console.error('Error:', err));
  };

  // Group menu items by category
  const grouped = menuItems.reduce((acc, item) => {
    const cat = item.Category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h2>Menu</h2>
        <p>Manage food and beverage items</p>
      </div>

      {/* Message */}
      {message && <div className="alert alert-success">✅ {message}</div>}

      {/* Add Menu Item Form */}
      <div className="card mb-24">
        <h3 className="section-title">➕ Add Menu Item</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Item Name</label>
              <input
                type="text"
                name="Name"
                value={form.Name}
                onChange={handleChange}
                placeholder="e.g. Caesar Salad"
                required
              />
            </div>
            <div className="form-group">
              <label>Price ($)</label>
              <input
                type="number"
                name="Price"
                value={form.Price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select name="Category" value={form.Category} onChange={handleChange} required>
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'end' }}>
              <button type="submit" className="btn btn-primary">Add to Menu</button>
            </div>
          </div>
        </form>
      </div>

      {/* Menu Items Table */}
      <div className="card">
        <h3 className="section-title">🍽️ Current Menu</h3>
        {loading ? (
          <div className="loading"><div className="spinner"></div>Loading...</div>
        ) : menuItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <p>No menu items yet</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map((item) => (
                <tr key={item.ItemID}>
                  <td>{item.ItemID}</td>
                  <td>{item.Name}</td>
                  <td><span className="badge reserved">{item.Category}</span></td>
                  <td>${Number(item.Price).toFixed(2)}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(item.ItemID, item.Name)}
                    >
                      Delete
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

export default MenuPage;
