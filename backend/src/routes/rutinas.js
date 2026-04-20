const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const rutinasController = require('../controllers/rutinasController');

// GET  /api/rutinas             -> todas las rutinas (admin)
// GET  /api/rutinas/:id         -> detalle con ejercicios
// GET  /api/rutinas/usuario/:id -> rutina activa del usuario
// POST /api/rutinas             -> crear rutina (admin)
// POST /api/rutinas/:id/asignar -> asignar rutina a usuario (admin)
// POST /api/rutinas/:id/desasignar -> quitar usuario de rutina (admin)
// PUT  /api/rutinas/:id         -> editar rutina (admin)
// DELETE /api/rutinas/:id       -> eliminar rutina (admin)

router.get('/',                    verifyToken, requireAdmin, rutinasController.listar);
router.get('/usuario/:id',         verifyToken,              rutinasController.obtenerPorUsuario);
router.get('/:id',                 verifyToken,              rutinasController.obtener);
router.post('/',                   verifyToken, requireAdmin, rutinasController.crear);
router.post('/:id/asignar',        verifyToken, requireAdmin, rutinasController.asignar);
router.post('/:id/desasignar',     verifyToken, requireAdmin, rutinasController.desasignar);
router.put('/:id',                 verifyToken, requireAdmin, rutinasController.actualizar);
router.delete('/:id',              verifyToken, requireAdmin, rutinasController.eliminar);

module.exports = router;
