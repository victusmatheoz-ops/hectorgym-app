const db = require('../config/db');

// ──────────────────────────────────────────
//  GET /api/rutinas
// ──────────────────────────────────────────
exports.listar = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT
        r.*,
        u.nombre AS creado_por_nombre,
        COUNT(DISTINCT ur.usuario_id) AS total_usuarios,
        GROUP_CONCAT(DISTINCT CONCAT(uu.nombre, ' ', uu.apellido) ORDER BY uu.nombre SEPARATOR ', ') AS usuarios_asignados,
        GROUP_CONCAT(DISTINCT ur.usuario_id ORDER BY ur.usuario_id SEPARATOR ',') AS usuarios_asignados_ids
      FROM rutinas r
      LEFT JOIN usuarios u ON u.id = r.creado_por
      LEFT JOIN usuario_rutinas ur ON ur.rutina_id = r.id AND ur.activa = 1
      LEFT JOIN usuarios uu ON uu.id = ur.usuario_id
      GROUP BY r.id, r.nombre, r.descripcion, r.objetivo, r.nivel, r.creado_por, r.created_at, u.nombre
      ORDER BY r.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────
//  GET /api/rutinas/:id  (con lista de ejercicios)
// ──────────────────────────────────────────
exports.obtener = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rutinas] = await db.query('SELECT * FROM rutinas WHERE id = ?', [id]);
    if (rutinas.length === 0) return res.status(404).json({ error: 'Rutina no encontrada' });

    // Obtener los ejercicios de la rutina con sus datos
    const [ejercicios] = await db.query(`
      SELECT
        re.orden, re.series, re.repeticiones, re.descanso_seg,
        e.id AS ejercicio_id, e.nombre, e.descripcion,
        e.grupo_muscular, e.imagen_url, e.video_url
      FROM rutina_ejercicios re
      JOIN ejercicios e ON e.id = re.ejercicio_id
      WHERE re.rutina_id = ?
      ORDER BY re.orden
    `, [id]);

    res.json({ ...rutinas[0], ejercicios });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────
//  GET /api/rutinas/usuario/:id
// ──────────────────────────────────────────
exports.obtenerPorUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.rol !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    // Obtener la rutina activa asignada
    const [asignaciones] = await db.query(
      `SELECT ur.rutina_id, ur.fecha_asignacion
       FROM usuario_rutinas ur
       WHERE ur.usuario_id = ? AND ur.activa = 1
       LIMIT 1`,
      [id]
    );

    if (asignaciones.length === 0) {
      return res.status(404).json({ error: 'Sin rutina asignada' });
    }

    // Reutilizamos la lógica de obtener con ejercicios
    req.params.id = asignaciones[0].rutina_id;
    return exports.obtener(req, res, next);
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────
//  POST /api/rutinas
// ──────────────────────────────────────────
exports.crear = async (req, res, next) => {
  try {
    const { nombre, descripcion, objetivo, nivel, ejercicios } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre de la rutina es requerido' });
    }

    const [result] = await db.query(
      `INSERT INTO rutinas (nombre, descripcion, objetivo, nivel, creado_por)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, descripcion || null, objetivo || null, nivel || 'principiante', req.user.id]
    );

    const rutinaId = result.insertId;

    // Insertar ejercicios si se proporcionaron
    if (ejercicios && ejercicios.length > 0) {
      const valores = ejercicios.map((e, idx) => [
        rutinaId,
        e.ejercicio_id,
        e.series       || 3,
        e.repeticiones || '10',
        e.descanso_seg || 60,
        e.orden        || idx + 1
      ]);

      await db.query(
        `INSERT INTO rutina_ejercicios
         (rutina_id, ejercicio_id, series, repeticiones, descanso_seg, orden)
         VALUES ?`,
        [valores]
      );
    }

    res.status(201).json({ message: 'Rutina creada', id: rutinaId });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────
//  POST /api/rutinas/:id/asignar
// ──────────────────────────────────────────
exports.asignar = async (req, res, next) => {
  try {
    const { id } = req.params;   // rutina_id
    const { usuario_id } = req.body;

    if (!usuario_id) {
      return res.status(400).json({ error: 'usuario_id es requerido' });
    }

    // Desactivar rutinas previas del usuario
    await db.query(
      'UPDATE usuario_rutinas SET activa = 0 WHERE usuario_id = ?',
      [usuario_id]
    );

    // Asignar la nueva rutina
    await db.query(
      'INSERT INTO usuario_rutinas (usuario_id, rutina_id, fecha_asignacion, activa) VALUES (?, ?, CURRENT_DATE, 1)',
      [usuario_id, id]
    );

    res.json({ message: 'Rutina asignada correctamente' });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────
//  POST /api/rutinas/:id/desasignar
// ──────────────────────────────────────────
exports.desasignar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { usuario_id } = req.body;

    if (!usuario_id) {
      return res.status(400).json({ error: 'usuario_id es requerido' });
    }

    const [result] = await db.query(
      'UPDATE usuario_rutinas SET activa = 0 WHERE usuario_id = ? AND rutina_id = ? AND activa = 1',
      [usuario_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'El usuario no tiene esta rutina asignada' });
    }

    res.json({ message: 'Usuario desasignado de la rutina correctamente' });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────
//  PUT /api/rutinas/:id
// ──────────────────────────────────────────
exports.actualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, objetivo, nivel } = req.body;

    await db.query(
      `UPDATE rutinas
       SET nombre      = COALESCE(?, nombre),
           descripcion = COALESCE(?, descripcion),
           objetivo    = COALESCE(?, objetivo),
           nivel       = COALESCE(?, nivel)
       WHERE id = ?`,
      [nombre, descripcion, objetivo, nivel, id]
    );

    res.json({ message: 'Rutina actualizada' });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────
//  DELETE /api/rutinas/:id
// ──────────────────────────────────────────
exports.eliminar = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM rutinas WHERE id = ?', [id]);
    res.json({ message: 'Rutina eliminada' });
  } catch (err) {
    next(err);
  }
};
