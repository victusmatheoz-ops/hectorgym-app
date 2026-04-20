# HECTORGYM — Guía de inicio rápido

## 1. Requisitos previos
- Node.js 18+
- MySQL 8+
- npm

## 2. Configurar la base de datos
```sql
-- Ejecutar en MySQL Workbench o terminal MySQL
SOURCE backend/database/schema.sql;
```

## 3. Configurar variables de entorno
```bash
cd backend
copy .env.example .env
# Edita .env con tu usuario y contraseña de MySQL
```

Variables importantes para internet:
- `PORT`: puerto del backend
- `ALLOWED_ORIGINS`: dominios permitidos por CORS separados por comas
- `JWT_SECRET`: cambia esta clave antes de publicar

## 4. Instalar dependencias e iniciar
```bash
cd backend
npm install
npm run dev
```
El servidor correrá en **http://localhost:3000**

## 5. Verificar que funciona
```
GET http://localhost:3000/api/health
```

## 6. Credenciales iniciales de administrador
- **Correo:** admin@hectorgym.com
- **Password:** Admin123

## 7. Publicar en internet
- Sube `backend/` a un servidor Node.js o plataforma como Render, Railway o VPS.
- Crea una base MySQL pública o administrada.
- Configura `ALLOWED_ORIGINS` con tu dominio web y el dominio de la app si aplica.
- Como el frontend web se sirve desde el mismo backend, al desplegar el servidor tendrás también el panel web disponible en ese dominio.
- Para Flutter usa la URL pública del backend con `--dart-define=API_BASE_URL=https://tu-dominio.com/api`.

### Opción Docker
```bash
cd backend
docker build -t hectorgym-api .
docker run --env-file .env -p 3000:3000 hectorgym-api
```

### Checklist mínimo de salida a internet
- Backend desplegado con HTTPS.
- Base de datos MySQL accesible desde el servidor.
- `JWT_SECRET` fuerte en producción.
- `ALLOWED_ORIGINS` con tu dominio final.
- Flutter apuntando al dominio público con `--dart-define=API_BASE_URL=...`.
- Probar login admin en web y login cliente en app.

---

## Tabla de endpoints

| Método | Endpoint                        | Descripción                        | Rol requerido |
|--------|---------------------------------|------------------------------------|---------------|
| POST   | /api/auth/login                 | Iniciar sesión                     | Público       |
| POST   | /api/auth/register              | Registrar usuario                  | Público       |
| GET    | /api/usuarios                   | Listar clientes                    | Admin         |
| GET    | /api/usuarios/:id               | Ver perfil                         | Propio/Admin  |
| POST   | /api/usuarios                   | Crear cliente                      | Admin         |
| PUT    | /api/usuarios/:id               | Editar cliente                     | Admin         |
| DELETE | /api/usuarios/:id               | Desactivar cliente                 | Admin         |
| GET    | /api/membresias                 | Listar membresías con estado       | Admin         |
| GET    | /api/membresias/tipos           | Catálogo de tipos                  | Autenticado   |
| GET    | /api/membresias/usuario/:id     | Membresía de un usuario            | Propio/Admin  |
| POST   | /api/membresias                 | Crear membresía                    | Admin         |
| PUT    | /api/membresias/:id             | Editar membresía                   | Admin         |
| GET    | /api/pagos                      | Historial completo                 | Admin         |
| GET    | /api/pagos/usuario/:id          | Pagos de un usuario                | Propio/Admin  |
| POST   | /api/pagos                      | Registrar pago                     | Admin         |
| GET    | /api/rutinas                    | Listar rutinas                     | Admin         |
| GET    | /api/rutinas/:id                | Detalle con ejercicios             | Autenticado   |
| GET    | /api/rutinas/usuario/:id        | Rutina activa del usuario          | Propio/Admin  |
| POST   | /api/rutinas                    | Crear rutina                       | Admin         |
| POST   | /api/rutinas/:id/asignar        | Asignar rutina a usuario           | Admin         |
| PUT    | /api/rutinas/:id                | Editar rutina                      | Admin         |
| DELETE | /api/rutinas/:id                | Eliminar rutina                    | Admin         |
| GET    | /api/ejercicios                 | Catálogo de ejercicios             | Autenticado   |
| GET    | /api/ejercicios/:id             | Detalle con máquinas               | Autenticado   |
| POST   | /api/ejercicios                 | Crear ejercicio                    | Admin         |
| PUT    | /api/ejercicios/:id             | Editar ejercicio                   | Admin         |
