// ==========================================
// Express Server - Entry Point
// ==========================================
const express = require('express');
const cors = require('cors');
const { getPool } = require('./db');
const { runMigrations } = require('./runMigrations');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());              // Allow React frontend to call our API
app.use(express.json());      // Parse JSON request bodies

// Import Routes
const customerRoutes = require('./routes/customers');
const zoneRoutes = require('./routes/zones');
const tableRoutes = require('./routes/tables');
const reservationRoutes = require('./routes/reservations');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const analyticsRoutes = require('./routes/analytics');

// Use Routes
app.use('/api/customers', customerRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'DineSync API is running!' });
});

// Run database migrations then start server
async function startServer() {
    try {
        const pool = await getPool();
        await runMigrations(pool);
        console.log('Database migrations complete.');
    } catch (err) {
        console.error('Migration warning:', err.message);
    }

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

startServer();
