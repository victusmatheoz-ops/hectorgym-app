const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const ejerciciosController = require('../controllers/ejerciciosController');

// GET  /api/ejercicios     -> catálogo completo
// GET  /api/ejercicios/:id -> detalle con máquinas asociadas
// POST /api/ejercicios     -> crear ejercicio (admin)
// PUT  /api/ejercicios/:id -> editar ejercicio (admin)

router.get('/',     verifyToken,              ejerciciosController.listar);
router.get('/:id',  verifyToken,              ejerciciosController.obtener);
router.post('/',    verifyToken, requireAdmin, ejerciciosController.crear);
router.put('/:id',  verifyToken, requireAdmin, ejerciciosController.actualizar);

module.exports = router;
