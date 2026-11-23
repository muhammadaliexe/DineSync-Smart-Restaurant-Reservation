// ==========================================
// Reservation Routes
// ==========================================
const express = require('express');
const router = express.Router();
const { sql, getPool } = require('../db');

// GET /api/reservations - Get all reservations
router.get('/', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query('SELECT * FROM vw_ReservationDetails ORDER BY ReservationDate, StartTime');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching reservations:', err);
        res.status(500).json({ error: 'Failed to fetch reservations' });
    }
});

// POST /api/reservations - Create a new reservation
router.post('/', async (req, res) => {
    try {
        const { CustomerID, TableID, ReservationDate, StartTime, EndTime } = req.body;
        const pool = await getPool();

        const result = await pool.request()
            .input('CustomerID', sql.Int, CustomerID)
            .input('TableID', sql.Int, TableID)
            .input('ReservationDate', sql.Date, ReservationDate)
            .input('StartTime', sql.Time, StartTime)
            .input('EndTime', sql.Time, EndTime)
            .execute('sp_CreateReservation');

        res.status(201).json({
            message: 'Reservation created!',
            status: 'Pending',
            ResID: result.recordset[0].ResID
        });
    } catch (err) {
        if (err.number === 51000) {
            return res.status(409).json({ error: err.message });
        }
        console.error('Error creating reservation:', err);
        res.status(500).json({ error: 'Failed to create reservation' });
    }
});

// PUT /api/reservations/:id/status - Update reservation status
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { ReservationStatus } = req.body;
        const pool = await getPool();

        await pool.request()
            .input('ResID', sql.Int, id)
            .input('NewStatus', sql.VarChar, ReservationStatus)
            .execute('sp_UpdateReservationStatus');

        res.json({ message: 'Reservation status updated!' });
    } catch (err) {
        console.error('Error updating reservation:', err);
        res.status(500).json({ error: 'Failed to update reservation' });
    }
});

// GET /api/reservations/:id/bill - Calculate total bill for a reservation
router.get('/:id/bill', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query(`
                SELECT r.ResID, 
                       SUM(m.Price * od.Quantity) AS FoodTotal,
                       tz.SurchargeAmount,
                       SUM(m.Price * od.Quantity) + tz.SurchargeAmount AS GrandTotal
                FROM Reservation r
                JOIN RestaurantTable rt ON r.TableID = rt.TableID
                JOIN TableZone tz ON rt.ZoneID = tz.ZoneID
                LEFT JOIN OrderDetail od ON r.ResID = od.ResID
                LEFT JOIN Menu m ON od.ItemID = m.ItemID
                WHERE r.ResID = @id
                GROUP BY r.ResID, tz.SurchargeAmount
            `);
        res.json(result.recordset[0] || { message: 'No bill found' });
    } catch (err) {
        console.error('Error calculating bill:', err);
        res.status(500).json({ error: 'Failed to calculate bill' });
    }
});

module.exports = router;
