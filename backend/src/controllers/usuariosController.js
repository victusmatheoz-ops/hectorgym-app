const db = require('../config/db');
const bcrypt = require('bcryptjs');

// ──────────────────────────────────────────
//  GET /api/usuarios
// ──────────────────────────────────────────
exports.listar = async (req, res, next) => {
  try {
    // Incluimos el estado de membresía desde la vista
    const [rows] = await db.query(`
      SELECT
        u.id, u.nombre, u.apellido, u.correo, u.telefono,
        u.peso, u.estatura, u.objetivo, u.activo, u.fecha_registro,
        v.estado       AS estado_membresia,
        v.fecha_fin,
        v.dias_restantes
      FROM usuarios u
      LEFT JOIN v_membresias_estado v
        ON v.usuario_id = u.id
        AND v.estado COLLATE utf8mb4_unicode_ci <> 'vencida' COLLATE utf8mb4_unicode_ci
      WHERE u.rol COLLATE utf8mb4_unicode_ci = 'usuario' COLLATE utf8mb4_unicode_ci
        AND u.activo = 1
      ORDER BY u.fecha_registro DESC
    `);

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────
//  GET /api/usuarios/:id
// ──────────────────────────────────────────
exports.obtener = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Un usuario solo puede ver su propio perfil; el admin ve cualquiera
    if (req.user.rol !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const [rows] = await db.query(
      `SELECT id, nombre, apellido, correo, telefono,
              peso, estatura, objetivo, activo, fecha_registro
       FROM usuarios WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────
//  POST /api/usuarios
// ──────────────────────────────────────────
exports.crear = async (req, res, next) => {
  try {
    const { nombre, apellido, correo, password, telefono, peso, estatura, objetivo } = req.body;

    if (!nombre || !apellido || !correo || !password) {
      return res.status(400).json({ error: 'nombre, apellido, correo y password son requeridos' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO usuarios (nombre, apellido, correo, password_hash, telefono, peso, estatura, objetivo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, correo, password_hash, telefono || null, peso || null, estatura || null, objetivo || null]
    );

    res.status(201).json({ message: 'Usuario creado', id: result.insertId });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────
//  PUT /api/usuarios/:id
// ──────────────────────────────────────────
exports.actualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, telefono, peso, estatura, objetivo } = req.body;

    await db.query(
      `UPDATE usuarios
       SET nombre = COALESCE(?, nombre),
           apellido = COALESCE(?, apellido),
           telefono = COALESCE(?, telefono),
           peso = COALESCE(?, peso),
           estatura = COALESCE(?, estatura),
           objetivo = COALESCE(?, objetivo)
       WHERE id = ?`,
      [nombre, apellido, telefono, peso, estatura, objetivo, id]
    );

    res.json({ message: 'Usuario actualizado' });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────
//  DELETE /api/usuarios/:id  (desactivar, no borrar)
// ──────────────────────────────────────────
exports.desactivar = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('UPDATE usuarios SET activo = 0 WHERE id = ?', [id]);
    res.json({ message: 'Usuario desactivado' });
  } catch (err) {
    next(err);
  }
};
