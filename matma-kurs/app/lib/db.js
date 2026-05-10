import mysql from 'mysql2/promise';

let pool;

if (!global.pool) {
    global.pool = mysql.createPool({
        uri: process.env.DB_URI,
        waitForConnections: true,
        connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
    });
}
pool = global.pool;

export default pool;