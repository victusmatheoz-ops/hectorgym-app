const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const pagosController = require('../controllers/pagosController');

// GET  /api/pagos             -> historial completo (admin)
// GET  /api/pagos/usuario/:id -> pagos de un usuario específico
// POST /api/pagos             -> registrar pago (admin)
// PUT  /api/pagos/:id         -> editar pago (admin)
// DELETE /api/pagos/:id       -> eliminar pago (admin)

router.get('/',              verifyToken, requireAdmin, pagosController.listar);
router.get('/usuario/:id',   verifyToken,              pagosController.listarPorUsuario);
router.post('/',             verifyToken, requireAdmin, pagosController.registrar);
router.put('/:id',           verifyToken, requireAdmin, pagosController.actualizar);
router.delete('/:id',        verifyToken, requireAdmin, pagosController.eliminar);

module.exports = router;
