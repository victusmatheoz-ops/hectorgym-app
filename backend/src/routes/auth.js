const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');

// POST /api/auth/login
router.post(
  '/login',
  [
    body('correo').isEmail().withMessage('Correo inválido'),
    body('password').notEmpty().withMessage('La contraseña es requerida')
  ],
  authController.login
);

// POST /api/auth/register  (solo admin puede crear usuarios desde la web)
router.post(
  '/register',
  [
    body('nombre').notEmpty().withMessage('El nombre es requerido'),
    body('apellido').notEmpty().withMessage('El apellido es requerido'),
    body('correo').isEmail().withMessage('Correo inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener mínimo 6 caracteres'),
    body('telefono').notEmpty().withMessage('El teléfono es requerido'),
    body('peso').optional().isFloat({ min: 20, max: 300 }).withMessage('Peso inválido'),
    body('estatura').optional().isFloat({ min: 1.0, max: 2.5 }).withMessage('Estatura inválida')
  ],
  authController.register
);

module.exports = router;
