const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const usuariosController = require('../controllers/usuariosController');

// GET  /api/usuarios          -> lista todos (admin)
// GET  /api/usuarios/:id      -> detalle de un usuario
// POST /api/usuarios          -> crear usuario (admin)
// PUT  /api/usuarios/:id      -> editar usuario (admin)
// DELETE /api/usuarios/:id    -> desactivar usuario (admin)

router.get('/',    verifyToken, requireAdmin, usuariosController.listar);
router.get('/:id', verifyToken,              usuariosController.obtener);
router.post('/',   verifyToken, requireAdmin, usuariosController.crear);
router.put('/:id', verifyToken, requireAdmin, usuariosController.actualizar);
router.delete('/:id', verifyToken, requireAdmin, usuariosController.desactivar);

module.exports = router;
