// ==========================================
// Dashboard Page
// ==========================================
import { useState, useEffect } from 'react';
import API_BASE from '../api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard stats on page load
  useEffect(() => {
    fetch(`${API_BASE}/analytics/summary`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Welcome to DineSync — your restaurant management overview</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card purple">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats?.totalCustomers || 0}</div>
          <div className="stat-label">Total Customers</div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">📅</div>
          <div className="stat-value">{stats?.totalReservations || 0}</div>
          <div className="stat-label">Total Reservations</div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{stats?.pendingReservations || 0}</div>
          <div className="stat-label">Pending</div>
        </div>

        <div className="stat-card blue">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats?.confirmedReservations || 0}</div>
          <div className="stat-label">Confirmed</div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">🍽️</div>
          <div className="stat-value">{stats?.totalMenuItems || 0}</div>
          <div className="stat-label">Menu Items</div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">🪑</div>
          <div className="stat-value">{stats?.totalTables || 0}</div>
          <div className="stat-label">Tables</div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
