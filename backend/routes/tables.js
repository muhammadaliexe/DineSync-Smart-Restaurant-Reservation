// ==========================================
// Table Routes
// ==========================================
const express = require('express');
const router = express.Router();
const { sql, getPool } = require('../db');

// GET /api/tables - Get all tables with zone info
router.get('/', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query('SELECT * FROM vw_TableDetails ORDER BY TableID ASC');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching tables:', err);
        res.status(500).json({ error: 'Failed to fetch tables' });
    }
});

// GET /api/tables/available - Get available tables only
router.get('/available', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query(`
            SELECT * FROM vw_TableDetails 
            WHERE Status = 'Available'
            ORDER BY TableID ASC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching available tables:', err);
        res.status(500).json({ error: 'Failed to fetch available tables' });
    }
});

// GET /api/tables/largest - Get table with largest capacity
router.get('/largest', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query(`
            SELECT TableID, ZoneID, Capacity, Status
            FROM RestaurantTable
            WHERE Capacity = (SELECT MAX(Capacity) FROM RestaurantTable)
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching largest table:', err);
        res.status(500).json({ error: 'Failed to fetch largest table' });
    }
});

// POST /api/tables - Add a new table
router.post('/', async (req, res) => {
    try {
        const { ZoneID, Capacity, Status } = req.body;
        const pool = await getPool();
        const result = await pool.request()
            .input('zoneId', sql.Int, ZoneID)
            .input('capacity', sql.Int, Capacity)
            .input('status', sql.VarChar, Status || 'Available')
            .query('INSERT INTO RestaurantTable (ZoneID, Capacity, Status) VALUES (@zoneId, @capacity, @status); SELECT SCOPE_IDENTITY() AS TableID;');
        res.status(201).json({ message: 'Table added!', TableID: result.recordset[0].TableID });
    } catch (err) {
        console.error('Error adding table:', err);
        res.status(500).json({ error: 'Failed to add table' });
    }
});

// PUT /api/tables/:id/status - Update table status (Available, Maintenance, Reserved)
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { Status } = req.body;
        const pool = await getPool();
        await pool.request()
            .input('id', sql.Int, id)
            .input('status', sql.VarChar, Status)
            .query('UPDATE RestaurantTable SET Status = @status WHERE TableID = @id');
        res.json({ message: `Table status updated to ${Status}!` });
    } catch (err) {
        console.error('Error updating table status:', err);
        res.status(500).json({ error: 'Failed to update table status' });
    }
});

module.exports = router;
