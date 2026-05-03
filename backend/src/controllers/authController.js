const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const db = require('../config/db');

// ──────────────────────────────────────────
//  POST /api/auth/login
// ──────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { correo, password } = req.body;

    const [rows] = await db.query(
      'SELECT id, nombre, apellido, correo, password_hash, rol FROM usuarios WHERE correo = ? AND activo = 1',
      [correo]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const usuario = rows[0];
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Generar token JWT con id, correo y rol
    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      usuario: {
        id:       usuario.id,
        nombre:   usuario.nombre,
        apellido: usuario.apellido,
        correo:   usuario.correo,
        rol:      usuario.rol
      }
    });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────
//  POST /api/auth/register
// ──────────────────────────────────────────
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nombre, apellido, correo, password, telefono, peso, estatura, objetivo, rol = 'usuario' } = req.body;

    // Hash de contraseña con coste 10 (equilibrio seguridad/velocidad)
    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO usuarios (nombre, apellido, correo, password_hash, telefono, peso, estatura, objetivo, rol) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nombre, apellido, correo, password_hash, telefono, peso || null, estatura || null, objetivo || null, rol]
    );

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      id: result.insertId
    });
  } catch (err) {
    next(err);
  }
};
