// ==========================================
// Orders (Pre-Order) Page
// ==========================================
import { useState, useEffect } from 'react';
import API_BASE from '../api';

function Orders() {
  const [reservations, setReservations] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [bill, setBill] = useState(null);
  const [selectedRes, setSelectedRes] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Form state
  const [form, setForm] = useState({ ResID: '', ItemID: '', Quantity: 1 });

  // Fetch reservations and menu on load
  useEffect(() => {
    fetch(`${API_BASE}/reservations`)
      .then((res) => res.json())
      .then((data) => setReservations(data))
      .catch((err) => console.error(err));

    fetch(`${API_BASE}/menu`)
      .then((res) => res.json())
      .then((data) => setMenuItems(data))
      .catch((err) => console.error(err));
  }, []);

  // Fetch orders for selected reservation
  const fetchOrders = (resId) => {
    if (!resId) return;
    setLoading(true);
    fetch(`${API_BASE}/orders/${resId}`)
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    // Also fetch the bill
    fetch(`${API_BASE}/reservations/${resId}/bill`)
      .then((res) => res.json())
      .then((data) => setBill(data))
      .catch((err) => console.error(err));
  };

  // When selecting a reservation
  const handleSelectReservation = (resId) => {
    setSelectedRes(resId);
    setForm({ ...form, ResID: resId });
    if (resId) {
      fetchOrders(resId);
    } else {
      setOrders([]);
      setBill(null);
    }
  };

  // Handle form changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add pre-order
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message);
        setForm({ ...form, ItemID: '', Quantity: 1 });
        fetchOrders(selectedRes);
        setTimeout(() => setMessage(''), 3000);
      })
      .catch((err) => console.error('Error:', err));
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h2>Pre-Orders</h2>
        <p>Add food items to reservations before arrival</p>
      </div>

      {/* Message */}
      {message && <div className="alert alert-success">✅ {message}</div>}

      <div className="grid-2">
        {/* Add Pre-Order Form */}
        <div className="card">
          <h3 className="section-title">🛒 Add Pre-Order</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Select Reservation</label>
              <select
                name="ResID"
                value={form.ResID}
                onChange={(e) => {
                  handleChange(e);
                  handleSelectReservation(e.target.value);
                }}
                required
              >
                <option value="">Choose a reservation</option>
                {reservations
                  .filter((r) => r.ReservationStatus !== 'Denied' && r.ReservationStatus !== 'Cancelled')
                  .map((r) => (
                    <option key={r.ResID} value={r.ResID}>
                      #{r.ResID} - {r.CustomerName} ({new Date(r.ReservationDate).toLocaleDateString()})
                    </option>
                  ))}
              </select>
            </div>
            <div className="form-group">
              <label>Menu Item</label>
              <select name="ItemID" value={form.ItemID} onChange={handleChange} required>
                <option value="">Choose an item</option>
                {menuItems.map((item) => (
                  <option key={item.ItemID} value={item.ItemID}>
                    {item.Name} - ${Number(item.Price).toFixed(2)} ({item.Category})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                name="Quantity"
                value={form.Quantity}
                onChange={handleChange}
                min="1"
                max="20"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">Add to Pre-Order</button>
          </form>
        </div>

        {/* Bill Summary */}
        <div className="card">
          <h3 className="section-title">💰 Bill Summary</h3>
          {!selectedRes ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>Select a reservation to view the bill</p>
            </div>
          ) : bill && bill.ResID ? (
            <div className="bill-card">
              <div className="bill-row">
                <span>Reservation #</span>
                <span>{bill.ResID}</span>
              </div>
              <div className="bill-row">
                <span>Food Total</span>
                <span>${Number(bill.FoodTotal || 0).toFixed(2)}</span>
              </div>
              <div className="bill-row">
                <span>Zone Surcharge</span>
                <span>${Number(bill.SurchargeAmount || 0).toFixed(2)}</span>
              </div>
              <div className="bill-row total">
                <span>Grand Total</span>
                <span>${Number(bill.GrandTotal || 0).toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🛒</div>
              <p>No orders yet for this reservation</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Items Table */}
      {selectedRes && (
        <div className="card" style={{ marginTop: '24px' }}>
          <h3 className="section-title">📦 Order Items for Reservation #{selectedRes}</h3>
          {loading ? (
            <div className="loading"><div className="spinner"></div>Loading...</div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🍽️</div>
              <p>No items ordered yet</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.OrderID}>
                    <td>{o.OrderID}</td>
                    <td>{o.Name}</td>
                    <td><span className="badge reserved">{o.Category}</span></td>
                    <td>${Number(o.Price).toFixed(2)}</td>
                    <td>{o.Quantity}</td>
                    <td>${Number(o.Subtotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default Orders;
