// ==========================================
// Order Routes (Pre-Order Module)
// ==========================================
const express = require('express');
const router = express.Router();
const { sql, getPool } = require('../db');

// GET /api/orders/:resId - Get orders for a reservation
router.get('/:resId', async (req, res) => {
    try {
        const { resId } = req.params;
        const pool = await getPool();
        const result = await pool.request()
            .input('resId', sql.Int, resId)
            .query(`
                SELECT od.OrderID, od.Quantity, m.Name, m.Price, m.Category,
                       (m.Price * od.Quantity) AS Subtotal
                FROM OrderDetail od
                JOIN Menu m ON od.ItemID = m.ItemID
                WHERE od.ResID = @resId
            `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// POST /api/orders - Add a pre-order item
router.post('/', async (req, res) => {
    try {
        const { ResID, ItemID, Quantity } = req.body;
        const pool = await getPool();

        const result = await pool.request()
            .input('ResID', sql.Int, ResID)
            .input('ItemID', sql.Int, ItemID)
            .input('Quantity', sql.Int, Quantity)
            .execute('sp_AddPreOrder');

        res.status(201).json({ message: 'Pre-order added!', OrderID: result.recordset[0].OrderID });
    } catch (err) {
        console.error('Error adding order:', err);
        res.status(500).json({ error: 'Failed to add order' });
    }
});

module.exports = router;
