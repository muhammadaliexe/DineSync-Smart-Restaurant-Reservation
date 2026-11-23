// ==========================================
// Reservations Page
// ==========================================
import { useState, useEffect } from 'react';
import API_BASE from '../api';

function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  // Form state
  const [form, setForm] = useState({
    CustomerID: '',
    TableID: '',
    ReservationDate: '',
    StartTime: '',
    EndTime: '',
  });

  // Fetch all data
  const fetchReservations = () => {
    fetch(`${API_BASE}/reservations`)
      .then((res) => res.json())
      .then((data) => {
        setReservations(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReservations();

    // Fetch customers for dropdown
    fetch(`${API_BASE}/customers`)
      .then((res) => res.json())
      .then((data) => setCustomers(data))
      .catch((err) => console.error(err));

    // Fetch available tables for dropdown
    fetch(`${API_BASE}/tables/available`)
      .then((res) => res.json())
      .then((data) => setTables(data))
      .catch((err) => console.error(err));
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Create reservation
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_BASE}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.status === 409) {
          // Conflict - double booking blocked
          setMessageType('error');
          setMessage(data.message);
        } else {
          setMessageType('success');
          setMessage(data.message);
        }
        setForm({ CustomerID: '', TableID: '', ReservationDate: '', StartTime: '', EndTime: '' });
        fetchReservations();
        setTimeout(() => setMessage(''), 4000);
      })
      .catch((err) => console.error('Error:', err));
  };

  // Update reservation status
  const updateStatus = (id, newStatus) => {
    fetch(`${API_BASE}/reservations/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ReservationStatus: newStatus }),
    })
      .then((res) => res.json())
      .then(() => fetchReservations())
      .catch((err) => console.error('Error:', err));
  };

  // Get badge class
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'pending';
      case 'confirmed': return 'confirmed';
      case 'denied': return 'denied';
      case 'cancelled': return 'cancelled';
      case 'fulfilled': return 'fulfilled';
      default: return '';
    }
  };

  // Format time for display
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    // Handle both "HH:MM:SS" and "HH:MM" formats
    const parts = timeStr.split(':');
    const hours = parseInt(parts[0]);
    const mins = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${mins} ${ampm}`;
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h2>Reservations</h2>
        <p>Create and manage table reservations</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`alert ${messageType === 'error' ? 'alert-error' : 'alert-success'}`}>
          {messageType === 'error' ? '❌' : '✅'} {message}
        </div>
      )}

      {/* Create Reservation Form */}
      <div className="card mb-24">
        <h3 className="section-title">📅 New Reservation</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Customer</label>
              <select name="CustomerID" value={form.CustomerID} onChange={handleChange} required>
                <option value="">Select a customer</option>
                {customers.map((c) => (
                  <option key={c.CustomerID} value={c.CustomerID}>
                    {c.Name} ({c.Phone})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Table</label>
              <select name="TableID" value={form.TableID} onChange={handleChange} required>
                <option value="">Select a table</option>
                {tables.map((t) => (
                  <option key={t.TableID} value={t.TableID}>
                    Table {t.TableID} - {t.ZoneName} ({t.Capacity} seats)
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input type="date" name="ReservationDate" value={form.ReservationDate} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Start Time</label>
              <input type="time" name="StartTime" value={form.StartTime} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>End Time</label>
              <input type="time" name="EndTime" value={form.EndTime} onChange={handleChange} required />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'end' }}>
              <button type="submit" className="btn btn-primary">Create Reservation</button>
            </div>
          </div>
        </form>
      </div>

      {/* Reservations Table */}
      <div className="card">
        <h3 className="section-title">📋 All Reservations</h3>
        {loading ? (
          <div className="loading"><div className="spinner"></div>Loading...</div>
        ) : reservations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <p>No reservations yet</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Table</th>
                  <th>Zone</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Pre-Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.ResID}>
                    <td>{r.ResID}</td>
                    <td>{r.CustomerName}</td>
                    <td>Table {r.TableID}</td>
                    <td>{r.ZoneName}</td>
                    <td>{new Date(r.ReservationDate).toLocaleDateString()}</td>
                    <td>{formatTime(r.StartTime)} - {formatTime(r.EndTime)}</td>
                    <td>
                      <span className={`badge ${getStatusClass(r.ReservationStatus)}`}>
                        {r.ReservationStatus}
                      </span>
                    </td>
                    <td>{r.PreOrderState}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {r.ReservationStatus === 'Pending' && (
                          <>
                            <button className="btn btn-success btn-sm" onClick={() => updateStatus(r.ResID, 'Confirmed')}>
                              Confirm
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => updateStatus(r.ResID, 'Denied')}>
                              Deny
                            </button>
                          </>
                        )}
                        {(r.ReservationStatus === 'Pending' || r.ReservationStatus === 'Confirmed') && (
                          <button className="btn btn-warning btn-sm" onClick={() => updateStatus(r.ResID, 'Cancelled')}>
                            Cancel
                          </button>
                        )}
                        {r.ReservationStatus === 'Confirmed' && (
                          <button className="btn btn-info btn-sm" onClick={() => updateStatus(r.ResID, 'Fulfilled')}>
                            ✅ Fulfilled
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reservations;
