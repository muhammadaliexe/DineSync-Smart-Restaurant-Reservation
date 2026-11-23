// ==========================================
// Customer Routes
// ==========================================
const express = require('express');
const router = express.Router();
const { sql, getPool } = require('../db');

// GET /api/customers - Get all customers
router.get('/', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query('SELECT * FROM Customer ORDER BY Name ASC');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching customers:', err);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

// GET /api/customers/search?phone=xxx - Search by phone
router.get('/search', async (req, res) => {
    try {
        const { phone } = req.query;
        const pool = await getPool();
        const result = await pool.request()
            .input('phone', sql.VarChar, `%${phone}%`)
            .query('SELECT CustomerID, Name, Phone FROM Customer WHERE Phone LIKE @phone ORDER BY Name ASC');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error searching customers:', err);
        res.status(500).json({ error: 'Failed to search customers' });
    }
});

// POST /api/customers - Add a new customer
router.post('/', async (req, res) => {
    try {
        const { Name, Phone, Email } = req.body;
        const pool = await getPool();
        const result = await pool.request()
            .input('name', sql.VarChar, Name)
            .input('phone', sql.VarChar, Phone)
            .input('email', sql.VarChar, Email)
            .query('INSERT INTO Customer (Name, Phone, Email) VALUES (@name, @phone, @email); SELECT SCOPE_IDENTITY() AS CustomerID;');
        res.status(201).json({ message: 'Customer added!', CustomerID: result.recordset[0].CustomerID });
    } catch (err) {
        console.error('Error adding customer:', err);
        res.status(500).json({ error: 'Failed to add customer' });
    }
});
// DELETE /api/customers/:id - Delete a customer
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getPool();
        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM Customer WHERE CustomerID = @id');
        res.json({ message: 'Customer deleted!' });
    } catch (err) {
        console.error('Error deleting customer:', err);
        res.status(500).json({ error: 'Failed to delete customer' });
    }
});

module.exports = router;
