const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin } = require('../middleware/auth');
const maquinasController = require('../controllers/maquinasController');

router.get('/', verifyToken, maquinasController.listar);
router.post('/', verifyToken, requireAdmin, maquinasController.crear);
router.put('/:id', verifyToken, requireAdmin, maquinasController.actualizar);
router.delete('/:id', verifyToken, requireAdmin, maquinasController.eliminar);

module.exports = router;