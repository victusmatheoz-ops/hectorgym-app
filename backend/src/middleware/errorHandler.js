/**
 * Manejador centralizado de errores.
 * Captura cualquier error que se pase con next(error) en los controladores.
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', err.message);

  // Error de duplicado en MySQL (correo ya registrado, etc.)
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Ya existe un registro con ese dato (duplicado)' });
  }

  // Error de llave foránea
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ error: 'El ID referenciado no existe' });
  }

  // Error genérico
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor'
  });
}

module.exports = errorHandler;
