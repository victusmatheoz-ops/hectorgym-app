const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar el token JWT en el header Authorization.
 * Uso: router.get('/ruta', verifyToken, controlador)
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, correo, rol }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

/**
 * Middleware para verificar que el usuario autenticado tiene rol 'admin'.
 * Siempre debe usarse DESPUÉS de verifyToken.
 */
function requireAdmin(req, res, next) {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado: se requiere rol administrador' });
  }
  next();
}

module.exports = { verifyToken, requireAdmin };
