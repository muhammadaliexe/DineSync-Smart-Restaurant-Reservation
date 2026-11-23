// ==========================================
// Database Connection Configuration
// ==========================================
const sql = require('mssql/msnodesqlv8');

// Using Windows Authentication via ODBC driver (connection string)
const config = {
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=localhost;Database=DineSyncDB;Trusted_Connection=yes;'
};

// Create a connection pool
let pool;

async function getPool() {
    if (!pool) {
        try {
            pool = await sql.connect(config);
            console.log('Connected to SQL Server!');
        } catch (err) {
            console.error('Database connection failed!');
            console.error('Error:', err.message);
            console.error('');
            console.error('TROUBLESHOOTING:');
            console.error('1. Make sure SQL Server is running');
            console.error('2. Make sure the DineSyncDB database exists (run db_setup.sql)');
            throw err;
        }
    }
    return pool;
}

module.exports = { sql, getPool };
