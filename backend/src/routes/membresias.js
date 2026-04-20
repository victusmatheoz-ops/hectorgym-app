const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const membresiasController = require('../controllers/membresiasController');

// GET  /api/membresias              -> todas las membresías con estado (admin)
// GET  /api/membresias/tipos        -> catálogo de tipos de membresía
// GET  /api/membresias/usuario/:id  -> membresía activa del usuario
// POST /api/membresias              -> crear membresía (admin)
// PUT  /api/membresias/:id          -> editar membresía (admin)
// DELETE /api/membresias/:id        -> eliminar membresía (admin)

router.get('/tipos',          verifyToken,              membresiasController.listarTipos);
router.get('/',               verifyToken, requireAdmin, membresiasController.listar);
router.get('/usuario/:id',    verifyToken,              membresiasController.obtenerPorUsuario);
router.post('/',              verifyToken, requireAdmin, membresiasController.crear);
router.put('/:id',            verifyToken, requireAdmin, membresiasController.actualizar);
router.delete('/:id',         verifyToken, requireAdmin, membresiasController.eliminar);

module.exports = router;
