const db = require('../config/db');

exports.listar = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT
        m.id,
        m.nombre,
        m.descripcion,
        m.imagen_url,
        m.activa,
        COUNT(em.ejercicio_id) AS total_ejercicios,
        GROUP_CONCAT(DISTINCT e.nombre ORDER BY e.nombre SEPARATOR ', ') AS ejercicios,
        GROUP_CONCAT(DISTINCT e.grupo_muscular ORDER BY e.grupo_muscular SEPARATOR ', ') AS grupos_musculares
      FROM maquinas m
      LEFT JOIN ejercicio_maquina em ON em.maquina_id = m.id
      LEFT JOIN ejercicios e ON e.id = em.ejercicio_id
      GROUP BY m.id, m.nombre, m.descripcion, m.imagen_url, m.activa
      ORDER BY m.nombre
    `);

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.crear = async (req, res, next) => {
  try {
    const { nombre, descripcion, activa = 1, imagen_url } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre de la máquina es requerido' });
    }

    const [result] = await db.query(
      'INSERT INTO maquinas (nombre, descripcion, activa, imagen_url) VALUES (?, ?, ?, ?)',
      [nombre, descripcion || null, activa ? 1 : 0, imagen_url || null]
    );

    res.status(201).json({ message: 'Máquina creada', id: result.insertId });
  } catch (err) {
    next(err);
  }
};

exports.actualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, activa, imagen_url } = req.body;

    await db.query(
      `UPDATE maquinas
       SET nombre      = COALESCE(?, nombre),
           descripcion = COALESCE(?, descripcion),
           activa      = COALESCE(?, activa),
           imagen_url  = CASE WHEN ? IS NOT NULL THEN ? ELSE imagen_url END
       WHERE id = ?`,
      [nombre, descripcion, typeof activa === 'undefined' ? null : (activa ? 1 : 0),
       typeof imagen_url === 'undefined' ? null : imagen_url,
       typeof imagen_url === 'undefined' ? null : imagen_url,
       id]
    );

    res.json({ message: 'Máquina actualizada' });
  } catch (err) {
    next(err);
  }
};

exports.eliminar = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM maquinas WHERE id = ?', [id]);
    res.json({ message: 'Máquina eliminada' });
  } catch (err) {
    next(err);
  }
};