const db = require('../config/db');

// ──────────────────────────────────────────
//  GET /api/ejercicios
// ──────────────────────────────────────────
exports.listar = async (req, res, next) => {
  try {
    const { grupo } = req.query; // filtro opcional: /api/ejercicios?grupo=Pecho

    let query = 'SELECT * FROM ejercicios';
    const params = [];

    if (grupo) {
      query += ' WHERE grupo_muscular = ?';
      params.push(grupo);
    }

    query += ' ORDER BY nombre';

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────
//  GET /api/ejercicios/:id  (con máquinas asociadas)
// ──────────────────────────────────────────
exports.obtener = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [ejercicios] = await db.query('SELECT * FROM ejercicios WHERE id = ?', [id]);
    if (ejercicios.length === 0) return res.status(404).json({ error: 'Ejercicio no encontrado' });

    const [maquinas] = await db.query(`
      SELECT m.id, m.nombre, m.descripcion, m.imagen_url
      FROM maquinas m
      JOIN ejercicio_maquina em ON em.maquina_id = m.id
      WHERE em.ejercicio_id = ?
    `, [id]);

    res.json({ ...ejercicios[0], maquinas });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────
//  POST /api/ejercicios
// ──────────────────────────────────────────
exports.crear = async (req, res, next) => {
  try {
    const { nombre, descripcion, grupo_muscular, imagen_url, video_url, maquinas } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre del ejercicio es requerido' });
    }

    const [result] = await db.query(
      `INSERT INTO ejercicios (nombre, descripcion, grupo_muscular, imagen_url, video_url)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, descripcion || null, grupo_muscular || null, imagen_url || null, video_url || null]
    );

    const ejercicioId = result.insertId;

    // Asociar máquinas si se proporcionaron
    if (maquinas && maquinas.length > 0) {
      const valores = maquinas.map(mId => [ejercicioId, mId]);
      await db.query('INSERT INTO ejercicio_maquina (ejercicio_id, maquina_id) VALUES ?', [valores]);
    }

    res.status(201).json({ message: 'Ejercicio creado', id: ejercicioId });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────
//  PUT /api/ejercicios/:id
// ──────────────────────────────────────────
exports.actualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, grupo_muscular, imagen_url, video_url } = req.body;

    await db.query(
      `UPDATE ejercicios
       SET nombre         = COALESCE(?, nombre),
           descripcion    = COALESCE(?, descripcion),
           grupo_muscular = COALESCE(?, grupo_muscular),
           imagen_url     = COALESCE(?, imagen_url),
           video_url      = COALESCE(?, video_url)
       WHERE id = ?`,
      [nombre, descripcion, grupo_muscular, imagen_url, video_url, id]
    );

    res.json({ message: 'Ejercicio actualizado' });
  } catch (err) {
    next(err);
  }
};
