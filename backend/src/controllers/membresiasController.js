const db = require('../config/db');

// ──────────────────────────────────────────
//  GET /api/membresias/tipos
// ──────────────────────────────────────────
exports.listarTipos = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM membresias_tipos ORDER BY duracion_dias');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────
//  GET /api/membresias  (con estado calculado)
// ──────────────────────────────────────────
exports.listar = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT
        m.id,
        m.usuario_id,
        m.tipo_id,
        u.nombre,
        u.apellido,
        u.correo,
        t.nombre AS tipo,
        t.precio,
        m.fecha_inicio,
        m.fecha_fin,
        DATEDIFF(m.fecha_fin, CURRENT_DATE) AS dias_restantes,
        CASE
          WHEN CURRENT_DATE > m.fecha_fin THEN 'vencida'
          WHEN DATEDIFF(m.fecha_fin, CURRENT_DATE) BETWEEN 0 AND 7 THEN 'proxima_a_vencer'
          ELSE 'activa'
        END AS estado
      FROM membresias m
      JOIN usuarios u ON u.id = m.usuario_id
      JOIN membresias_tipos t ON t.id = m.tipo_id
      ORDER BY dias_restantes ASC
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────
//  GET /api/membresias/usuario/:id
// ──────────────────────────────────────────
exports.obtenerPorUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.rol !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const [rows] = await db.query(
      'SELECT * FROM v_membresias_estado WHERE usuario_id = ? ORDER BY fecha_fin DESC LIMIT 1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(200).json(null);
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────
//  POST /api/membresias
// ──────────────────────────────────────────
exports.crear = async (req, res, next) => {
  try {
    const { usuario_id, tipo_id, fecha_inicio } = req.body;

    if (!usuario_id || !tipo_id || !fecha_inicio) {
      return res.status(400).json({ error: 'usuario_id, tipo_id y fecha_inicio son requeridos' });
    }

    // Calcula la fecha_fin automáticamente según la duración del tipo
    const [tipos] = await db.query('SELECT duracion_dias FROM membresias_tipos WHERE id = ?', [tipo_id]);
    if (tipos.length === 0) return res.status(400).json({ error: 'Tipo de membresía no encontrado' });

    const fechaFin = new Date(fecha_inicio);
    fechaFin.setDate(fechaFin.getDate() + tipos[0].duracion_dias);
    const fecha_fin = fechaFin.toISOString().split('T')[0];

    const [result] = await db.query(
      'INSERT INTO membresias (usuario_id, tipo_id, fecha_inicio, fecha_fin, estado) VALUES (?, ?, ?, ?, ?)',
      [usuario_id, tipo_id, fecha_inicio, fecha_fin, 'activa']
    );

    res.status(201).json({ message: 'Membresía creada', id: result.insertId, fecha_fin });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────
//  PUT /api/membresias/:id
// ──────────────────────────────────────────
exports.actualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { tipo_id, fecha_inicio, fecha_fin, estado } = req.body;

    let nextFechaFin = fecha_fin || null;

    if (tipo_id && fecha_inicio && !fecha_fin) {
      const [tipos] = await db.query('SELECT duracion_dias FROM membresias_tipos WHERE id = ?', [tipo_id]);
      if (tipos.length === 0) return res.status(400).json({ error: 'Tipo de membresía no encontrado' });

      const calculatedEndDate = new Date(fecha_inicio);
      calculatedEndDate.setDate(calculatedEndDate.getDate() + tipos[0].duracion_dias);
      nextFechaFin = calculatedEndDate.toISOString().split('T')[0];
    }

    await db.query(
      `UPDATE membresias
       SET tipo_id      = COALESCE(?, tipo_id),
           fecha_inicio = COALESCE(?, fecha_inicio),
           fecha_fin    = COALESCE(?, fecha_fin),
           estado       = COALESCE(?, estado)
       WHERE id = ?`,
      [tipo_id, fecha_inicio, nextFechaFin, estado, id]
    );

    res.json({ message: 'Membresía actualizada' });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────
//  DELETE /api/membresias/:id
// ──────────────────────────────────────────
exports.eliminar = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM membresias WHERE id = ?', [id]);
    res.json({ message: 'Membresía eliminada' });
  } catch (err) {
    next(err);
  }
};
