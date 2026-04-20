require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

// Rutas
const authRoutes       = require('./routes/auth');
const usuariosRoutes   = require('./routes/usuarios');
const pagosRoutes      = require('./routes/pagos');
const membresiasRoutes = require('./routes/membresias');
const rutinasRoutes    = require('./routes/rutinas');
const ejerciciosRoutes = require('./routes/ejercicios');
const maquinasRoutes   = require('./routes/maquinas');

const app = express();
app.set('trust proxy', 1); // Railway usa reverse proxy
const frontendRoot = path.resolve(__dirname, '../..');
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// ──────────────────────────────────────────
//  Rate limiting
// ──────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,                   // máximo 10 intentos de login por IP
  message: { error: 'Demasiados intentos de inicio de sesión. Intenta en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100,                  // máximo 100 requests por IP por minuto
  message: { error: 'Demasiadas solicitudes. Intenta más tarde.' },
  standardHeaders: true,
  legacyHeaders: false
});

// ──────────────────────────────────────────
//  Middlewares globales
// ──────────────────────────────────────────
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origen no permitido por CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos del prototipo web
app.use(express.static(frontendRoot));
app.use('/css', express.static(path.join(frontendRoot, 'css')));
app.use('/js', express.static(path.join(frontendRoot, 'js')));

// ──────────────────────────────────────────
//  Rutas de la API
// ──────────────────────────────────────────
app.use('/api/auth/login', loginLimiter);
app.use('/api',            apiLimiter);
app.use('/api/auth',       authRoutes);
app.use('/api/usuarios',   usuariosRoutes);
app.use('/api/pagos',      pagosRoutes);
app.use('/api/membresias', membresiasRoutes);
app.use('/api/rutinas',    rutinasRoutes);
app.use('/api/ejercicios', ejerciciosRoutes);
app.use('/api/maquinas',   maquinasRoutes);

// Ruta de salud (para verificar que el servidor está vivo)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'HECTORGYM API corriendo', timestamp: new Date() });
});

// Páginas del prototipo servidas desde el mismo backend
app.get(['/', '/index.html'], (req, res) => {
  res.sendFile(path.join(frontendRoot, 'index.html'));
});

app.get('/clientes.html', (req, res) => {
  res.sendFile(path.join(frontendRoot, 'clientes.html'));
});

app.get('/membresias.html', (req, res) => {
  res.sendFile(path.join(frontendRoot, 'membresias.html'));
});

app.get('/pagos.html', (req, res) => {
  res.sendFile(path.join(frontendRoot, 'pagos.html'));
});

app.get('/rutinas.html', (req, res) => {
  res.sendFile(path.join(frontendRoot, 'rutinas.html'));
});

app.get('/maquinas.html', (req, res) => {
  res.sendFile(path.join(frontendRoot, 'maquinas.html'));
});

app.get('/portal.html', (req, res) => {
  res.sendFile(path.join(frontendRoot, 'portal.html'));
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo centralizado de errores
app.use(errorHandler);

// ──────────────────────────────────────────
//  Iniciar servidor
// ──────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ HECTORGYM API corriendo en http://localhost:${PORT}`);
});
