-- ============================================================
--  DATOS DE PRUEBA para el prototipo HECTORGYM
--  Ejecutar DESPUÉS de schema.sql
-- ============================================================

USE hectorgym;

-- ──────────────────────────────────────────
--  CLIENTES DE PRUEBA (password: Password123)
--  Hash bcrypt del texto: Password123
-- ──────────────────────────────────────────
INSERT INTO usuarios (nombre, apellido, correo, password_hash, telefono, peso, estatura, objetivo, rol) VALUES
  ('Juan',    'García',    'juan@test.com',    '$2a$10$SOCA5k0rFKOLE36vGObVRuO4wmtUjPysxdNdV.0SN57yUvDw.dO62', '555-1001', 78.0, 1.75, 'Pérdida de peso',   'usuario'),
  ('María',   'López',     'maria@test.com',   '$2a$10$SOCA5k0rFKOLE36vGObVRuO4wmtUjPysxdNdV.0SN57yUvDw.dO62', '555-1002', 62.5, 1.65, 'Tonificación',      'usuario'),
  ('Carlos',  'Martínez',  'carlos@test.com',  '$2a$10$SOCA5k0rFKOLE36vGObVRuO4wmtUjPysxdNdV.0SN57yUvDw.dO62', '555-1003', 90.0, 1.80, 'Ganancia de masa',  'usuario'),
  ('Ana',     'Rodríguez', 'ana@test.com',     '$2a$10$SOCA5k0rFKOLE36vGObVRuO4wmtUjPysxdNdV.0SN57yUvDw.dO62', '555-1004', 55.0, 1.60, 'Resistencia',       'usuario'),
  ('Pedro',   'Sánchez',   'pedro@test.com',   '$2a$10$SOCA5k0rFKOLE36vGObVRuO4wmtUjPysxdNdV.0SN57yUvDw.dO62', '555-1005', 85.0, 1.78, 'Pérdida de peso',   'usuario');

-- ──────────────────────────────────────────
--  MÁQUINAS
-- ──────────────────────────────────────────
INSERT INTO maquinas (nombre, descripcion) VALUES
  ('Caminadora',          'Cinta para cardio de baja y alta intensidad'),
  ('Bicicleta estática',  'Cardio sin impacto articular'),
  ('Press de banca',      'Banco plano con barra para pecho'),
  ('Máquina de poleas',   'Poleas ajustables para múltiples ejercicios'),
  ('Smith Machine',       'Barra guiada para sentadillas y press'),
  ('Remo sentado',        'Máquina de cables para espalda'),
  ('Leg Press',           'Prensa para cuádriceps y glúteos'),
  ('Multipower',          'Máquina multiusos para press y jalones');

-- ──────────────────────────────────────────
--  EJERCICIOS
-- ──────────────────────────────────────────
INSERT INTO ejercicios (nombre, descripcion, grupo_muscular) VALUES
  ('Press de banca',       'Ejercicio compuesto para pecho, hombros y tríceps',  'Pecho'),
  ('Sentadilla',           'Ejercicio rey para piernas y glúteos',                'Piernas'),
  ('Peso muerto',          'Ejercicio compuesto para espalda baja y isquios',    'Espalda'),
  ('Dominadas',            'Jalón con el peso corporal para espalda y bíceps',   'Espalda'),
  ('Press militar',        'Press sobre la cabeza para hombros',                 'Hombros'),
  ('Curl bíceps',          'Flexión de codo para bíceps',                        'Bíceps'),
  ('Extensión tríceps',    'Extensión de codo en polea alta',                    'Tríceps'),
  ('Cardio caminadora',    '30 min en caminadora a ritmo moderado',              'Cardio'),
  ('Plancha abdominal',    'Isométrico para core y estabilidad',                 'Core'),
  ('Remo con cable',       'Jalón horizontal para espalda media',                'Espalda');

-- Asociar ejercicios con máquinas
INSERT INTO ejercicio_maquina (ejercicio_id, maquina_id) VALUES
  (1, 3),   -- Press de banca → Press de banca
  (1, 5),   -- Press de banca → Smith Machine
  (2, 5),   -- Sentadilla → Smith Machine
  (2, 7),   -- Sentadilla → Leg Press
  (3, 5),   -- Peso muerto → Smith Machine
  (6, 4),   -- Curl bíceps → Poleas
  (7, 4),   -- Extensión tríceps → Poleas
  (8, 1),   -- Cardio → Caminadora
  (10, 6);  -- Remo → Remo sentado

-- ──────────────────────────────────────────
--  RUTINAS
-- ──────────────────────────────────────────
INSERT INTO rutinas (nombre, descripcion, objetivo, nivel, creado_por) VALUES
  ('Full Body Principiante', 'Rutina completa para quienes inician en el gym', 'Tonificación',     'principiante', 1),
  ('Pérdida de Peso',        'Combinación de cardio y pesas para quemar grasa', 'Pérdida de peso', 'intermedio',   1),
  ('Hipertrofia Avanzada',   'Rutina de volumen para ganar masa muscular',     'Ganancia de masa', 'avanzado',     1);

-- Ejercicios de "Full Body Principiante"
INSERT INTO rutina_ejercicios (rutina_id, ejercicio_id, series, repeticiones, descanso_seg, orden) VALUES
  (1, 8, 1, '20 min', 0,  1),   -- Cardio caminadora
  (1, 1, 3, '12',     60, 2),   -- Press de banca
  (1, 2, 3, '15',     60, 3),   -- Sentadilla
  (1, 9, 3, '30 seg', 45, 4),   -- Plancha
  (1, 6, 3, '12',     60, 5);   -- Curl bíceps

-- Ejercicios de "Pérdida de Peso"
INSERT INTO rutina_ejercicios (rutina_id, ejercicio_id, series, repeticiones, descanso_seg, orden) VALUES
  (2, 8, 1, '30 min', 0,  1),   -- Cardio
  (2, 2, 4, '15',     45, 2),   -- Sentadilla
  (2, 9, 4, '45 seg', 30, 3),   -- Plancha
  (2, 5, 3, '12',     45, 4),   -- Press militar
  (2, 8, 1, '10 min', 0,  5);   -- Cardio final

-- Ejercicios de "Hipertrofia Avanzada"
INSERT INTO rutina_ejercicios (rutina_id, ejercicio_id, series, repeticiones, descanso_seg, orden) VALUES
  (3, 1, 5, '6-8',  120, 1),    -- Press de banca
  (3, 3, 4, '5',    120, 2),    -- Peso muerto
  (3, 2, 4, '8',    120, 3),    -- Sentadilla
  (3, 5, 4, '8-10',  90, 4),   -- Press militar
  (3, 10,4, '12',    90, 5);   -- Remo

-- ──────────────────────────────────────────
--  MEMBRESÍAS
--  (id del admin=1, clientes son id 2 al 6)
-- ──────────────────────────────────────────
INSERT INTO membresias (usuario_id, tipo_id, fecha_inicio, fecha_fin, estado) VALUES
  (2, 1, '2026-03-11', '2026-04-10', 'proxima_a_vencer'),  -- Juan: vence HOY
  (3, 1, '2026-02-01', '2026-03-03', 'vencida'),            -- María: vencida
  (4, 1, '2026-01-01', '2026-01-31', 'vencida'),            -- Carlos: vencida
  (5, 1, '2026-03-01', '2026-03-31', 'vencida'),           -- Ana: vencida
  (6, 1, '2026-04-05', '2026-05-05', 'activa');             -- Pedro: activa

-- ──────────────────────────────────────────
--  PAGOS
-- ──────────────────────────────────────────
INSERT INTO pagos (usuario_id, membresia_id, monto, fecha, metodo_pago, descripcion) VALUES
  (2, 1, 60000.00, '2026-03-11', 'efectivo',     'Membresía general'),
  (3, 2, 60000.00, '2026-02-01', 'tarjeta',      'Membresía general'),
  (4, 3, 60000.00, '2026-01-01', 'transferencia','Membresía general'),
  (5, 4, 60000.00, '2026-03-01', 'efectivo',     'Membresía general'),
  (6, 5, 60000.00, '2026-04-05', 'efectivo',     'Membresía general');

-- ──────────────────────────────────────────
--  ASIGNAR RUTINAS A USUARIOS
-- ──────────────────────────────────────────
INSERT INTO usuario_rutinas (usuario_id, rutina_id, fecha_asignacion, activa) VALUES
  (2, 2, '2026-03-11', 1),   -- Juan → Pérdida de Peso
  (3, 1, '2026-02-01', 1),   -- María → Full Body
  (4, 3, '2026-01-01', 1),   -- Carlos → Hipertrofia
  (6, 1, '2026-04-05', 1);   -- Pedro → Full Body

-- ──────────────────────────────────────────
--  VERIFICAR datos insertados
-- ──────────────────────────────────────────
SELECT 'Usuarios' AS tabla, COUNT(*) AS total FROM usuarios
UNION ALL
SELECT 'Membresías',  COUNT(*) FROM membresias
UNION ALL
SELECT 'Pagos',       COUNT(*) FROM pagos
UNION ALL
SELECT 'Rutinas',     COUNT(*) FROM rutinas
UNION ALL
SELECT 'Ejercicios',  COUNT(*) FROM ejercicios
UNION ALL
SELECT 'Máquinas',    COUNT(*) FROM maquinas;
