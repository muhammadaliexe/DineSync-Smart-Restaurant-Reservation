// ==========================================
// Analytics Page
// ==========================================
import { useState, useEffect } from 'react';
import API_BASE from '../api';

function Analytics() {
  const [topCustomers, setTopCustomers] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [zones, setZones] = useState([]);
  const [aboveAvg, setAboveAvg] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch all analytics data
    Promise.all([
      fetch(`${API_BASE}/analytics/top-customers`).then((r) => r.json()),
      fetch(`${API_BASE}/analytics/best-sellers`).then((r) => r.json()),
      fetch(`${API_BASE}/analytics/high-demand-zones`).then((r) => r.json()),
      fetch(`${API_BASE}/analytics/above-avg-items`).then((r) => r.json()),
    ])
      .then(([customers, sellers, zoneData, avgItems]) => {
        setTopCustomers(customers);
        setBestSellers(sellers);
        setZones(zoneData);
        setAboveAvg(avgItems);
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
        Loading analytics...
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <h2>Analytics</h2>
        <p>Restaurant insights and performance reports</p>
      </div>

      <div className="analytics-grid">
        {/* Top Customers */}
        <div className="analytics-card">
          <h3>👥 Top Customers</h3>
          {topCustomers.length === 0 ? (
            <p className="text-muted">No data available</p>
          ) : (
            <ul className="rank-list">
              {topCustomers.map((c, i) => (
                <li key={c.CustomerID}>
                  <span>
                    <span className="rank-number">{i + 1}</span>
                    {c.Name}
                  </span>
                  <span className="rank-value">{c.TotalReservations} reservations</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Best Sellers */}
        <div className="analytics-card">
          <h3>🔥 Best Selling Items</h3>
          {bestSellers.length === 0 ? (
            <p className="text-muted">No data available</p>
          ) : (
            <ul className="rank-list">
              {bestSellers.map((item, i) => (
                <li key={item.Name}>
                  <span>
                    <span className="rank-number">{i + 1}</span>
                    {item.Name}
                    <span className="text-muted" style={{ marginLeft: '8px', fontSize: '12px' }}>
                      {item.Category}
                    </span>
                  </span>
                  <span className="rank-value">{item.TotalOrdered} ordered</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* High Demand Zones */}
        <div className="analytics-card">
          <h3>📍 High Demand Zones</h3>
          {zones.length === 0 ? (
            <p className="text-muted">No data available</p>
          ) : (
            <ul className="rank-list">
              {zones.map((z, i) => (
                <li key={z.ZoneName}>
                  <span>
                    <span className="rank-number">{i + 1}</span>
                    {z.ZoneName}
                    <span className="text-muted" style={{ marginLeft: '8px', fontSize: '12px' }}>
                      +${Number(z.SurchargeAmount).toFixed(2)}
                    </span>
                  </span>
                  <span className="rank-value">{z.TotalReservations} bookings</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Above Average Items */}
        <div className="analytics-card">
          <h3>💎 Premium Items (Above Avg Price)</h3>
          {aboveAvg.length === 0 ? (
            <p className="text-muted">No data available</p>
          ) : (
            <ul className="rank-list">
              {aboveAvg.map((item) => (
                <li key={item.Name}>
                  <span>
                    {item.Name}
                    <span className="text-muted" style={{ marginLeft: '8px', fontSize: '12px' }}>
                      {item.Category}
                    </span>
                  </span>
                  <span className="rank-value">${Number(item.Price).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Analytics;
