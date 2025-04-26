const ibmdb = require('ibm_db');

// DB2 connection configuration
const dbConfig = {
    database: 'STUDENTS',
    hostname: 'localhost',
    port: 25000,
    protocol: 'TCPIP',
    uid: 'akshay',
    pwd: '12345'
};

// Create connection string
const connStr = `DATABASE=${dbConfig.database};HOSTNAME=${dbConfig.hostname};UID=${dbConfig.uid};PWD=${dbConfig.pwd};PORT=${dbConfig.port};PROTOCOL=${dbConfig.protocol}`;

// Connection pool
let pool = null;

// Initialize connection pool
function initializePool() {
    if (!pool) {
        pool = new ibmdb.Pool();
        pool.setMaxPoolSize(10);
    }
    return pool;
}

// Get connection from pool
async function getConnection() {
    try {
        const pool = initializePool();
        return await pool.open(connStr);
    } catch (err) {
        console.error('Error getting connection from pool:', err);
        throw err;
    }
}

// Execute query with parameters
async function executeQuery(sql, params = []) {
    let conn;
    try {
        conn = await getConnection();
        const stmt = await conn.prepare(sql);
        const result = await stmt.execute(params);
        await stmt.close();
        return result;
    } catch (err) {
        console.error('Error executing query:', err);
        throw err;
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
}

// Execute query without parameters
async function executeQueryWithoutParams(sql) {
    let conn;
    try {
        conn = await getConnection();
        const result = await conn.query(sql);
        return result;
    } catch (err) {
        console.error('Error executing query:', err);
        throw err;
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
}

module.exports = {
    executeQuery,
    executeQueryWithoutParams,
    getConnection
}; 