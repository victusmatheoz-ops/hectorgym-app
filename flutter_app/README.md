# HECTORGYM App Flutter

Base inicial de la app móvil para clientes del gimnasio, conectada al mismo backend del panel admin.

## Ejecutar

```bash
cd flutter_app
flutter pub get
flutter run --dart-define=API_BASE_URL=https://tu-dominio.com/api
```

## Desarrollo local

Emulador Android:

```bash
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000/api
```

Dispositivo físico en la misma red:

```bash
flutter run --dart-define=API_BASE_URL=http://TU_IP_LOCAL:3000/api
```

## Estado actual

- Login de cliente
- Persistencia de sesión
- Consulta de membresía
- Consulta de rutina
- Consulta de pagos
- Admin sigue usando el panel web