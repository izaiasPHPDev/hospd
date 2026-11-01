const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'sistemahospd_db',
    user: process.env.DB_USER || 'mysql',
    password: process.env.DB_PASSWORD || 'q18r0543ex5nwk9bw9qi',
    database: process.env.DB_NAME || 'sistemahospd',
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
