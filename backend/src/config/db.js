const mysql = require('mysql2/promise');

// Pool de conexiones: reutiliza conexiones en lugar de abrir una nueva por cada request
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'hectorgym',
  charset:  'utf8mb4_unicode_ci',
  waitForConnections: true,
  connectionLimit:    10,    // máximo de conexiones simultáneas
  queueLimit:         0
});

if (pool.pool) {
  pool.pool.on('connection', (connection) => {
    connection.query("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
  });
}

// Verifica la conexión al iniciar
pool.getConnection()
  .then(conn => {
    console.log('✅ Conexión a MySQL establecida');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Error al conectar a MySQL:', err.message);
  });

module.exports = pool;
