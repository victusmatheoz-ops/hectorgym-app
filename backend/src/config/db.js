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

// Verifica la conexión y aplica migraciones al iniciar
pool.getConnection()
  .then(async conn => {
    console.log('✅ Conexión a MySQL establecida');
    // Migración: asegurar que imagen_url soporte base64 (LONGTEXT)
    try {
      await conn.query('ALTER TABLE maquinas MODIFY COLUMN imagen_url LONGTEXT');
      await conn.query('ALTER TABLE ejercicios MODIFY COLUMN imagen_url LONGTEXT');
      console.log('✅ Migración imagen_url aplicada');
    } catch (e) {
      // Ignorar si ya está en el tipo correcto
    }
    conn.release();
  })
  .catch(err => {
    console.error('❌ Error al conectar a MySQL:', err.message);
  });

module.exports = pool;
