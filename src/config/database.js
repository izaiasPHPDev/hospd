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
  queueLimit: 0,
  connectTimeout: 10000
});

// Teste inicial de conexão sem dar crash no servidor
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexão com o banco de dados MySQL estabelecida!');
    connection.release();
  } catch (err) {
    console.error('⚠️ Erro ao conectar no MySQL:', err.message);
  }
})();

module.exports = pool;
