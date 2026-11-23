// ==========================================
// Analytics Routes
// ==========================================
const express = require('express');
const router = express.Router();
const { getPool } = require('../db');

// GET /api/analytics/top-customers - Customers with most reservations
router.get('/top-customers', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query(`
            SELECT c.CustomerID, c.Name, c.Phone, COUNT(r.ResID) AS TotalReservations
            FROM Customer c
            JOIN Reservation r ON c.CustomerID = r.CustomerID
            GROUP BY c.CustomerID, c.Name, c.Phone
            HAVING COUNT(r.ResID) >= 1
            ORDER BY TotalReservations DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching top customers:', err);
        res.status(500).json({ error: 'Failed to fetch top customers' });
    }
});

// GET /api/analytics/best-sellers - Most ordered menu items
router.get('/best-sellers', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query(`
            SELECT m.Name, m.Category, SUM(od.Quantity) AS TotalOrdered
            FROM Menu m
            JOIN OrderDetail od ON m.ItemID = od.ItemID
            GROUP BY m.Name, m.Category
            ORDER BY TotalOrdered DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching best sellers:', err);
        res.status(500).json({ error: 'Failed to fetch best sellers' });
    }
});

// GET /api/analytics/high-demand-zones - Busiest zones
router.get('/high-demand-zones', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query(`
            SELECT tz.ZoneName, tz.SurchargeAmount, COUNT(r.ResID) AS TotalReservations
            FROM TableZone tz
            LEFT JOIN RestaurantTable rt ON tz.ZoneID = rt.ZoneID
            LEFT JOIN Reservation r ON rt.TableID = r.TableID
            GROUP BY tz.ZoneName, tz.SurchargeAmount
            ORDER BY TotalReservations DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching zone demand:', err);
        res.status(500).json({ error: 'Failed to fetch zone demand' });
    }
});

// GET /api/analytics/above-avg-items - Items priced above average
router.get('/above-avg-items', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query(`
            SELECT Name, Price, Category 
            FROM Menu 
            WHERE Price > (SELECT AVG(Price) FROM Menu)
            ORDER BY Price DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching above-avg items:', err);
        res.status(500).json({ error: 'Failed to fetch above-avg items' });
    }
});

// GET /api/analytics/summary - Dashboard summary stats
router.get('/summary', async (req, res) => {
    try {
        const pool = await getPool();
        const customers = await pool.request().query('SELECT COUNT(*) AS count FROM Customer');
        const reservations = await pool.request().query('SELECT COUNT(*) AS count FROM Reservation');
        const menuItems = await pool.request().query('SELECT COUNT(*) AS count FROM Menu');
        const tables = await pool.request().query('SELECT COUNT(*) AS count FROM RestaurantTable');
        const pending = await pool.request().query("SELECT COUNT(*) AS count FROM Reservation WHERE ReservationStatus = 'Pending'");
        const confirmed = await pool.request().query("SELECT COUNT(*) AS count FROM Reservation WHERE ReservationStatus = 'Confirmed'");

        res.json({
            totalCustomers: customers.recordset[0].count,
            totalReservations: reservations.recordset[0].count,
            totalMenuItems: menuItems.recordset[0].count,
            totalTables: tables.recordset[0].count,
            pendingReservations: pending.recordset[0].count,
            confirmedReservations: confirmed.recordset[0].count
        });
    } catch (err) {
        console.error('Error fetching summary:', err);
        res.status(500).json({ error: 'Failed to fetch summary' });
    }
});

module.exports = router;
