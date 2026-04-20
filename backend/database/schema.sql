-- ============================================================
--  HECTORGYM - Esquema de base de datos
--  Ejecuta este script una sola vez para crear todas las tablas
-- ============================================================

CREATE DATABASE IF NOT EXISTS hectorgym
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hectorgym;

-- ──────────────────────────────────────────
--  USUARIOS
--  Contiene tanto administradores como clientes
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(100)  NOT NULL,
  apellido      VARCHAR(100)  NOT NULL,
  correo        VARCHAR(150)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  telefono      VARCHAR(20),
  peso          DECIMAL(5,2),       -- kg
  estatura      DECIMAL(4,2),       -- metros
  objetivo      VARCHAR(100),       -- ej: "Pérdida de peso", "Ganar masa"
  rol           ENUM('admin','usuario') NOT NULL DEFAULT 'usuario',
  activo        TINYINT(1)    NOT NULL DEFAULT 1,
  fecha_registro TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_correo CHECK (correo LIKE '%@%.%')
);

-- ──────────────────────────────────────────
--  TIPOS DE MEMBRESÍA
--  Catálogo de planes disponibles (mensual, trimestral, etc.)
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS membresias_tipos (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  precio        DECIMAL(10,2) NOT NULL,
  duracion_dias INT          NOT NULL,   -- cuántos días dura la membresía
  descripcion   TEXT
);

-- Tipo de membresía único
INSERT INTO membresias_tipos (nombre, precio, duracion_dias, descripcion) VALUES
  ('Membresía general', 60000.00, 30, 'Plan único con acceso completo por 30 días');

-- ──────────────────────────────────────────
--  MEMBRESÍAS
--  Registro de la membresía activa/histórica de cada usuario
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS membresias (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id    INT          NOT NULL,
  tipo_id       INT          NOT NULL,
  fecha_inicio  DATE         NOT NULL,
  fecha_fin     DATE         NOT NULL,
  -- el estado se calcula con la vista v_membresias_estado, pero se guarda para consultas rápidas
  estado        ENUM('activa','vencida','proxima_a_vencer') NOT NULL DEFAULT 'activa',
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (tipo_id)    REFERENCES membresias_tipos(id)
);

-- ──────────────────────────────────────────
--  PAGOS
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pagos (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id    INT           NOT NULL,
  membresia_id  INT,                      -- NULL si es un pago sin membresía asociada
  monto         DECIMAL(10,2) NOT NULL,
  fecha         DATE          NOT NULL,
  meses         INT           NOT NULL DEFAULT 1,   -- cuántos meses paga el cliente
  metodo_pago   ENUM('efectivo','tarjeta','transferencia','nequi','daviplata') NOT NULL DEFAULT 'efectivo',
  descripcion   VARCHAR(255),
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id)   REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (membresia_id) REFERENCES membresias(id) ON DELETE SET NULL
);

-- ──────────────────────────────────────────
--  MÁQUINAS
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS maquinas (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(150) NOT NULL,
  descripcion   TEXT,
  imagen_url    VARCHAR(255),
  activa        TINYINT(1)   NOT NULL DEFAULT 1
);

-- ──────────────────────────────────────────
--  EJERCICIOS
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ejercicios (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(150)  NOT NULL,
  descripcion     TEXT,
  grupo_muscular  VARCHAR(100),    -- ej: "Pecho", "Piernas", "Espalda"
  imagen_url      VARCHAR(255),
  video_url       VARCHAR(255)
);

-- Relación muchos a muchos: un ejercicio puede usarse en varias máquinas
CREATE TABLE IF NOT EXISTS ejercicio_maquina (
  ejercicio_id  INT NOT NULL,
  maquina_id    INT NOT NULL,
  PRIMARY KEY (ejercicio_id, maquina_id),
  FOREIGN KEY (ejercicio_id) REFERENCES ejercicios(id) ON DELETE CASCADE,
  FOREIGN KEY (maquina_id)   REFERENCES maquinas(id)   ON DELETE CASCADE
);

-- ──────────────────────────────────────────
--  RUTINAS
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rutinas (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(150)  NOT NULL,
  descripcion   TEXT,
  objetivo      VARCHAR(100),    -- "Pérdida de peso", "Volumen", etc.
  nivel         ENUM('principiante','intermedio','avanzado') NOT NULL DEFAULT 'principiante',
  creado_por    INT,             -- FK al usuario admin que la creó
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Ejercicios dentro de una rutina con sus parámetros
CREATE TABLE IF NOT EXISTS rutina_ejercicios (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  rutina_id     INT          NOT NULL,
  ejercicio_id  INT          NOT NULL,
  series        INT          NOT NULL DEFAULT 3,
  repeticiones  VARCHAR(20)  NOT NULL DEFAULT '10',  -- puede ser "10-12" o "hasta el fallo"
  descanso_seg  INT          NOT NULL DEFAULT 60,    -- descanso en segundos
  orden         INT          NOT NULL DEFAULT 1,     -- posición en la rutina
  FOREIGN KEY (rutina_id)    REFERENCES rutinas(id)   ON DELETE CASCADE,
  FOREIGN KEY (ejercicio_id) REFERENCES ejercicios(id) ON DELETE CASCADE
);

-- Rutinas asignadas a usuarios
CREATE TABLE IF NOT EXISTS usuario_rutinas (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id       INT       NOT NULL,
  rutina_id        INT       NOT NULL,
  fecha_asignacion DATE      NOT NULL DEFAULT (CURRENT_DATE),
  activa           TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (rutina_id)  REFERENCES rutinas(id)  ON DELETE CASCADE
);

-- ──────────────────────────────────────────
--  VISTA: estado de membresía en tiempo real
-- ──────────────────────────────────────────
CREATE OR REPLACE VIEW v_membresias_estado AS
SELECT
  m.id,
  m.usuario_id,
  u.nombre,
  u.apellido,
  u.correo,
  t.nombre          AS tipo,
  m.fecha_inicio,
  m.fecha_fin,
  DATEDIFF(m.fecha_fin, CURRENT_DATE) AS dias_restantes,
  CASE
    WHEN CURRENT_DATE > m.fecha_fin                            THEN CAST('vencida' AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_unicode_ci
    WHEN DATEDIFF(m.fecha_fin, CURRENT_DATE) BETWEEN 0 AND 7  THEN CAST('proxima_a_vencer' AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_unicode_ci
    ELSE CAST('activa' AS CHAR CHARACTER SET utf8mb4) COLLATE utf8mb4_unicode_ci
  END AS estado
FROM membresias m
JOIN usuarios         u ON u.id = m.usuario_id
JOIN membresias_tipos t ON t.id = m.tipo_id;

-- ──────────────────────────────────────────
--  USUARIO ADMINISTRADOR INICIAL
--  Password: Admin123  (bcrypt hash)
-- ──────────────────────────────────────────
INSERT INTO usuarios (nombre, apellido, correo, password_hash, rol) VALUES
  ('Hector', 'Admin', 'admin@hectorgym.com',
  '$2a$10$7tuI1fEeCApWuBsoX38tOOubgyTOrSw/BRNH2JB0y07ox1yz5pJVm',
   'admin');
