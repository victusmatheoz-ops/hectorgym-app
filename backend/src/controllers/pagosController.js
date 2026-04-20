const db = require('../config/db');

// ──────────────────────────────────────────
//  GET /api/pagos
// ──────────────────────────────────────────
exports.listar = async (req, res, next) => {
  try {
    const [rows] = await db.query(`
      SELECT
        p.id, p.usuario_id, p.membresia_id, p.monto, p.fecha, p.metodo_pago, p.descripcion, p.created_at,
        u.nombre, u.apellido, u.correo,
        t.nombre AS tipo_membresia
      FROM pagos p
      JOIN usuarios u ON u.id = p.usuario_id
      LEFT JOIN membresias    m ON m.id = p.membresia_id
      LEFT JOIN membresias_tipos t ON t.id = m.tipo_id
      ORDER BY p.fecha DESC
    `);

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────
//  GET /api/pagos/usuario/:id
// ──────────────────────────────────────────
exports.listarPorUsuario = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Un usuario solo ve sus propios pagos
    if (req.user.rol !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const [rows] = await db.query(`
      SELECT
        p.id, p.usuario_id, p.membresia_id, p.monto, p.fecha, p.metodo_pago, p.descripcion,
        t.nombre AS tipo_membresia
      FROM pagos p
      LEFT JOIN membresias     m ON m.id = p.membresia_id
      LEFT JOIN membresias_tipos t ON t.id = m.tipo_id
      WHERE p.usuario_id = ?
      ORDER BY p.fecha DESC
    `, [id]);

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────
//  POST /api/pagos
// ──────────────────────────────────────────
exports.registrar = async (req, res, next) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const { usuario_id, monto, fecha, meses = 1, metodo_pago, descripcion } = req.body;

    if (!usuario_id || !monto || !fecha) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({ error: 'usuario_id, monto y fecha son requeridos' });
    }

    const diasPorMes = 30;
    const diasTotal = parseInt(meses, 10) * diasPorMes;

    // Buscar membresía activa actual del usuario
    const [membActiva] = await conn.query(
      `SELECT id, fecha_fin FROM membresias
       WHERE usuario_id = ? AND estado = 'activa'
       ORDER BY fecha_fin DESC LIMIT 1`,
      [usuario_id]
    );

    let membresiaId;

    if (membActiva.length > 0) {
      // Extender membresía existente
      const nuevaFechaFin = new Date(membActiva[0].fecha_fin);
      nuevaFechaFin.setDate(nuevaFechaFin.getDate() + diasTotal);
      const fechaFinStr = nuevaFechaFin.toISOString().split('T')[0];

      await conn.query(
        `UPDATE membresias SET fecha_fin = ?, estado = 'activa' WHERE id = ?`,
        [fechaFinStr, membActiva[0].id]
      );
      membresiaId = membActiva[0].id;
    } else {
      // Crear nueva membresía desde hoy
      const inicio = new Date(fecha);
      const fin = new Date(fecha);
      fin.setDate(fin.getDate() + diasTotal);
      const fechaInicioStr = inicio.toISOString().split('T')[0];
      const fechaFinStr = fin.toISOString().split('T')[0];

      const [resMem] = await conn.query(
        `INSERT INTO membresias (usuario_id, tipo_id, fecha_inicio, fecha_fin, estado)
         VALUES (?, 1, ?, ?, 'activa')`,
        [usuario_id, fechaInicioStr, fechaFinStr]
      );
      membresiaId = resMem.insertId;
    }

    // Registrar el pago
    const [result] = await conn.query(
      `INSERT INTO pagos (usuario_id, membresia_id, monto, fecha, meses, metodo_pago, descripcion)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        usuario_id,
        membresiaId,
        monto,
        fecha,
        parseInt(meses, 10),
        metodo_pago || 'efectivo',
        descripcion || null
      ]
    );

    await conn.commit();
    conn.release();

    res.status(201).json({
      message: `Pago registrado y membresía ${membActiva.length > 0 ? 'extendida' : 'creada'} por ${meses} mes(es)`,
      id: result.insertId,
      membresia_id: membresiaId
    });
  } catch (err) {
    await conn.rollback();
    conn.release();
    next(err);
  }
};

// ──────────────────────────────────────────
//  PUT /api/pagos/:id
// ──────────────────────────────────────────
exports.actualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { monto, fecha, metodo_pago, descripcion, membresia_id } = req.body;

    await db.query(
      `UPDATE pagos
       SET monto       = COALESCE(?, monto),
           fecha       = COALESCE(?, fecha),
           metodo_pago = COALESCE(?, metodo_pago),
           descripcion = COALESCE(?, descripcion),
           membresia_id = ?
       WHERE id = ?`,
      [monto, fecha, metodo_pago, descripcion, membresia_id || null, id]
    );

    res.json({ message: 'Pago actualizado' });
  } catch (err) {
    next(err);
  }
};

// ──────────────────────────────────────────
//  DELETE /api/pagos/:id
// ──────────────────────────────────────────
exports.eliminar = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM pagos WHERE id = ?', [id]);
    res.json({ message: 'Pago eliminado' });
  } catch (err) {
    next(err);
  }
};
