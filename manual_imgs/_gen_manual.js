const fs = require('fs');
const path = require('path');

const imgs = JSON.parse(fs.readFileSync(path.join(__dirname, '_b64.json'), 'utf8'));

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Manual de Usuario — HECTORGYM</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800&display=swap');
  :root{--red:#e53935;--bg:#080808;--bg2:#0f0f0f;--bg3:#141414;--border:rgba(255,255,255,0.08);--text:rgba(255,255,255,0.85);--muted:rgba(255,255,255,0.4)}
  *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{background:var(--bg);color:var(--text);font-family:'Inter',sans-serif;font-size:15px;line-height:1.7}
  .cover{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:60px 32px;background:radial-gradient(ellipse 800px 500px at 50% 40%,rgba(229,57,53,0.1) 0%,transparent 70%);border-bottom:1px solid var(--border)}
  .cover-logo{width:72px;height:72px;background:var(--red);border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:2rem;margin:0 auto 24px;color:#fff}
  .cover h1{font-family:'Bebas Neue',sans-serif;font-size:5rem;letter-spacing:6px;color:#fff;line-height:0.9}
  .cover h1 span{color:var(--red)}
  .cover .subtitle{margin-top:12px;font-size:0.85rem;font-weight:600;letter-spacing:3px;color:var(--red);text-transform:uppercase}
  .cover .desc{margin-top:20px;max-width:560px;color:var(--muted);font-size:0.95rem}
  .cover .meta{margin-top:32px;display:flex;gap:32px;justify-content:center;flex-wrap:wrap}
  .cover .meta-item .val{font-family:'Bebas Neue',sans-serif;font-size:1.8rem;color:#fff}
  .cover .meta-item .lbl{font-size:0.7rem;font-weight:600;letter-spacing:2px;color:var(--muted);text-transform:uppercase}
  .toc{max-width:900px;margin:60px auto;padding:0 32px}
  .toc h2{font-family:'Bebas Neue',sans-serif;font-size:2rem;letter-spacing:3px;color:#fff;margin-bottom:24px;padding-bottom:12px;border-bottom:1px solid var(--border)}
  .toc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}
  .toc-item{background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:14px 16px;display:flex;align-items:center;gap:12px;text-decoration:none;color:var(--text);transition:all 0.2s}
  .toc-item:hover{border-color:rgba(229,57,53,0.4);background:rgba(229,57,53,0.04);color:#fff}
  .toc-num{font-family:'Bebas Neue',sans-serif;font-size:1.4rem;color:var(--red);min-width:28px}
  .toc-label{font-size:0.82rem;font-weight:600}
  .section{max-width:900px;margin:0 auto;padding:60px 32px}
  .section-header{display:flex;align-items:flex-start;gap:16px;margin-bottom:40px}
  .section-num{font-family:'Bebas Neue',sans-serif;font-size:4rem;color:var(--red);line-height:0.9;min-width:60px}
  .section-title{font-family:'Bebas Neue',sans-serif;font-size:2.4rem;letter-spacing:3px;color:#fff;line-height:0.95}
  .section-desc{margin-top:6px;font-size:0.85rem;color:var(--muted);font-weight:500;letter-spacing:0.5px}
  .divider{border:none;border-top:1px solid var(--border);max-width:900px;margin:0 auto}
  .screen-block{background:var(--bg2);border:1px solid var(--border);border-radius:14px;overflow:hidden;margin-bottom:32px}
  .screen-label{padding:12px 20px;font-size:0.7rem;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--muted);border-bottom:1px solid var(--border)}
  .screen-img{width:100%;display:block;border-bottom:1px solid var(--border)}
  .screen-caption{padding:16px 20px;font-size:0.82rem;color:var(--muted);line-height:1.6}
  .steps{counter-reset:step;list-style:none;margin:24px 0 32px}
  .steps li{counter-increment:step;display:flex;gap:14px;margin-bottom:12px;padding:16px 20px;background:var(--bg3);border:1px solid var(--border);border-radius:10px}
  .steps li::before{content:counter(step);font-family:'Bebas Neue',sans-serif;font-size:1.4rem;color:var(--red);min-width:24px;line-height:1}
  .step-text{font-size:0.88rem}
  .step-text strong{color:#fff;display:block;margin-bottom:2px;font-size:0.92rem}
  .tip{background:rgba(229,57,53,0.06);border:1px solid rgba(229,57,53,0.2);border-left:3px solid var(--red);border-radius:8px;padding:14px 18px;margin:20px 0;font-size:0.85rem}
  .tip strong{color:var(--red)}
  .tip-blue{background:rgba(30,136,229,0.06);border-color:rgba(30,136,229,0.2);border-left-color:#1e88e5}
  .tip-blue strong{color:#64b5f6}
  .tip-green{background:rgba(76,175,80,0.06);border-color:rgba(76,175,80,0.2);border-left-color:#43a047}
  .tip-green strong{color:#81c784}
  .badge{display:inline-block;font-size:0.68rem;font-weight:700;letter-spacing:0.5px;padding:3px 10px;border-radius:20px;text-transform:uppercase;vertical-align:middle}
  .badge-red{background:rgba(229,57,53,0.12);color:#ef9a9a;border:1px solid rgba(229,57,53,0.3)}
  .badge-green{background:rgba(76,175,80,0.12);color:#81c784;border:1px solid rgba(76,175,80,0.3)}
  .badge-blue{background:rgba(30,136,229,0.12);color:#64b5f6;border:1px solid rgba(30,136,229,0.3)}
  .badge-yellow{background:rgba(255,193,7,0.12);color:#ffd54f;border:1px solid rgba(255,193,7,0.3)}
  .ref-table{width:100%;border-collapse:collapse;margin:20px 0}
  .ref-table th,.ref-table td{padding:10px 14px;text-align:left;border-bottom:1px solid var(--border);font-size:0.85rem}
  .ref-table th{font-size:0.7rem;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);background:rgba(255,255,255,0.02)}
  .module-intro{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:24px 0 32px}
  .module-card{background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:20px}
  .module-card h4{font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:2px;color:#fff;margin-bottom:8px}
  .module-card p{font-size:0.82rem;color:var(--muted);line-height:1.6}
  .sub-heading{font-family:'Bebas Neue',sans-serif;letter-spacing:2px;color:#fff;margin:28px 0 14px;font-size:1.1rem}
  .manual-footer{border-top:1px solid var(--border);padding:40px 32px;text-align:center;color:var(--muted);font-size:0.8rem}
  .manual-footer strong{color:var(--red)}
  @media(max-width:640px){
    .cover h1{font-size:3rem}
    .module-intro{grid-template-columns:1fr}
    .section{padding:40px 16px}
    .toc{padding:0 16px}
  }
</style>
</head>
<body>

<!-- PORTADA -->
<div class="cover">
  <div class="cover-logo">&#127947;</div>
  <h1>HECTOR<span>GYM</span></h1>
  <div class="subtitle">Manual completo del sistema</div>
  <p class="desc">Guía visual paso a paso para administradores del software de gestión de gimnasio HECTORGYM. Cubre todas las secciones del panel de administración y el portal de clientes.</p>
  <div class="meta">
    <div class="meta-item"><div class="val">9</div><div class="lbl">Módulos</div></div>
    <div class="meta-item"><div class="val">v1.0</div><div class="lbl">Versión</div></div>
    <div class="meta-item"><div class="val">2026</div><div class="lbl">Año</div></div>
  </div>
</div>

<!-- ÍNDICE -->
<div class="toc">
  <h2>Contenido</h2>
  <div class="toc-grid">
    <a href="#s1" class="toc-item"><span class="toc-num">01</span><span class="toc-label">Página principal del gimnasio</span></a>
    <a href="#s2" class="toc-item"><span class="toc-num">02</span><span class="toc-label">Inicio de sesión</span></a>
    <a href="#s3" class="toc-item"><span class="toc-num">03</span><span class="toc-label">Dashboard de administración</span></a>
    <a href="#s4" class="toc-item"><span class="toc-num">04</span><span class="toc-label">Gestión de clientes</span></a>
    <a href="#s5" class="toc-item"><span class="toc-num">05</span><span class="toc-label">Membresías</span></a>
    <a href="#s6" class="toc-item"><span class="toc-num">06</span><span class="toc-label">Pagos</span></a>
    <a href="#s7" class="toc-item"><span class="toc-num">07</span><span class="toc-label">Rutinas de entrenamiento</span></a>
    <a href="#s8" class="toc-item"><span class="toc-num">08</span><span class="toc-label">Catálogo de máquinas</span></a>
    <a href="#s9" class="toc-item"><span class="toc-num">09</span><span class="toc-label">Portal del cliente</span></a>
  </div>
</div>

<hr class="divider">

<!-- 01 — LANDING -->
<div class="section" id="s1">
  <div class="section-header">
    <div class="section-num">01</div>
    <div>
      <div class="section-title">Página principal<br>del gimnasio</div>
      <div class="section-desc">Lo que ven tus clientes al visitar el sitio</div>
    </div>
  </div>
  <div class="screen-block">
    <div class="screen-label">▶ Página de presentación — landing.html</div>
    <img class="screen-img" src="${imgs['01_landing']}" alt="Landing page HECTORGYM">
    <div class="screen-caption">La página de inicio es la carta de presentación del gimnasio. Contiene información pública: horarios, servicios, membresías y galería de fotos. Cualquier visitante puede verla sin necesidad de iniciar sesión.</div>
  </div>
  <div class="module-intro">
    <div class="module-card">
      <h4>Secciones incluidas</h4>
      <p>Hero con partículas · Estadísticas · Nosotros · Servicios · Horarios · Galería · Membresías · Testimonios · App móvil · Mapa de ubicación</p>
    </div>
    <div class="module-card">
      <h4>Botón "Ingresar"</h4>
      <p>En la barra superior hay un botón rojo "Ingresar" que lleva al formulario de login, tanto para administradores como para clientes del gimnasio.</p>
    </div>
  </div>
  <div class="tip tip-blue"><strong>Nota:</strong> Esta página es accesible sin cuenta. Sus clientes del gimnasio pueden consultarla en cualquier momento desde el celular o computador.</div>
</div>

<hr class="divider">

<!-- 02 — LOGIN -->
<div class="section" id="s2">
  <div class="section-header">
    <div class="section-num">02</div>
    <div>
      <div class="section-title">Inicio de sesión</div>
      <div class="section-desc">Acceso para administradores y clientes</div>
    </div>
  </div>
  <div class="screen-block">
    <div class="screen-label">▶ Formulario de acceso — login.html</div>
    <img class="screen-img" src="${imgs['02_login']}" alt="Login HECTORGYM">
    <div class="screen-caption">El formulario de login es compartido para administradores y clientes. El sistema detecta automáticamente el tipo de usuario y redirige al destino correcto: panel de admin o portal del cliente.</div>
  </div>
  <ol class="steps">
    <li><div class="step-text"><strong>Ingresar correo electrónico</strong>Escriba el correo con el que fue registrado en el sistema.</div></li>
    <li><div class="step-text"><strong>Ingresar contraseña</strong>Use el ícono del ojo para mostrar u ocultar la contraseña.</div></li>
    <li><div class="step-text"><strong>Hacer clic en "Ingresar"</strong>Si las credenciales son correctas, el sistema redirige automáticamente: <span class="badge badge-red">Admin</span> va al dashboard, <span class="badge badge-blue">Cliente</span> va a su portal.</div></li>
  </ol>
  <table class="ref-table">
    <thead><tr><th>Rol</th><th>Credenciales</th><th>Destino</th></tr></thead>
    <tbody>
      <tr><td><span class="badge badge-red">Administrador</span></td><td>admin@hectorgym.com / Admin123</td><td>Panel de administración (index.html)</td></tr>
      <tr><td><span class="badge badge-blue">Cliente</span></td><td>Correo registrado en clientes</td><td>Portal del cliente (portal.html)</td></tr>
    </tbody>
  </table>
  <div class="tip"><strong>Importante:</strong> Cambie la contraseña del administrador después de la instalación para garantizar la seguridad del sistema.</div>
</div>

<hr class="divider">

<!-- 03 — DASHBOARD -->
<div class="section" id="s3">
  <div class="section-header">
    <div class="section-num">03</div>
    <div>
      <div class="section-title">Dashboard de<br>administración</div>
      <div class="section-desc">Vista general del estado del gimnasio en tiempo real</div>
    </div>
  </div>
  <div class="screen-block">
    <div class="screen-label">▶ Panel principal — index.html</div>
    <img class="screen-img" src="${imgs['03_dashboard']}" alt="Dashboard admin">
    <div class="screen-caption">La pantalla principal muestra un resumen del estado del gimnasio. Las tarjetas de estadísticas se actualizan en tiempo real. Desde el acceso rápido se pueden ejecutar las acciones más frecuentes sin navegar por los módulos.</div>
  </div>
  <div class="module-intro">
    <div class="module-card">
      <h4>Tarjetas de estadísticas</h4>
      <p><strong style="color:#fff">Total Clientes</strong> — clientes registrados en el sistema.<br><strong style="color:#fff">Membresías Activas</strong> — membresías vigentes.<br><strong style="color:#fff">Rutinas Activas</strong> — planes de entrenamiento creados.<br><strong style="color:#fff">Pagos Hoy</strong> — pagos registrados en el día.</p>
    </div>
    <div class="module-card">
      <h4>Acceso Rápido</h4>
      <p>Cuatro botones directos para las acciones más comunes: <strong style="color:#fff">Nuevo Cliente, Nueva Membresía, Registrar Pago</strong> y <strong style="color:#fff">Asignar Rutina</strong>.</p>
    </div>
  </div>
  <div class="tip tip-green"><strong>Consejo:</strong> Revise el dashboard cada mañana. Si "Membresías Activas" baja, es señal de que hay clientes con plan vencido que necesitan renovación.</div>
</div>

<hr class="divider">

<!-- 04 — CLIENTES -->
<div class="section" id="s4">
  <div class="section-header">
    <div class="section-num">04</div>
    <div>
      <div class="section-title">Gestión de clientes</div>
      <div class="section-desc">Registro y administración de todos los miembros del gimnasio</div>
    </div>
  </div>
  <div class="screen-block">
    <div class="screen-label">▶ Módulo de clientes — clientes.html</div>
    <img class="screen-img" src="${imgs['04_clientes']}" alt="Módulo clientes">
    <div class="screen-caption">Lista completa de todos los clientes con búsqueda por nombre o correo, filtro por estado de membresía, y acciones individuales por cada registro.</div>
  </div>
  <p class="sub-heading">Registrar nuevo cliente</p>
  <ol class="steps">
    <li><div class="step-text"><strong>Clic en "Nuevo Cliente"</strong>Botón rojo en la esquina superior derecha.</div></li>
    <li><div class="step-text"><strong>Completar el formulario</strong>Nombre, apellido, correo (será su usuario de acceso), teléfono, documento de identidad y fecha de nacimiento.</div></li>
    <li><div class="step-text"><strong>Datos físicos (opcional)</strong>Peso, altura y objetivo de entrenamiento. Se usan para personalizar rutinas.</div></li>
    <li><div class="step-text"><strong>Guardar</strong>El cliente queda registrado y puede iniciar sesión inmediatamente con su correo y la contraseña asignada.</div></li>
  </ol>
  <table class="ref-table">
    <thead><tr><th>Botón</th><th>Acción</th><th>Descripción</th></tr></thead>
    <tbody>
      <tr><td>👁</td><td>Ver perfil</td><td>Muestra historial completo, membresía activa y rutina asignada</td></tr>
      <tr><td>✏</td><td>Editar</td><td>Modifica cualquier dato del cliente</td></tr>
      <tr><td>🗑</td><td>Eliminar</td><td>Elimina al cliente y todos sus datos (irreversible)</td></tr>
    </tbody>
  </table>
  <div class="tip"><strong>Atención:</strong> Al eliminar un cliente se borran también sus membresías, pagos y asignaciones de rutinas. Esta acción no se puede deshacer.</div>
</div>

<hr class="divider">

<!-- 05 — MEMBRESÍAS -->
<div class="section" id="s5">
  <div class="section-header">
    <div class="section-num">05</div>
    <div>
      <div class="section-title">Membresías</div>
      <div class="section-desc">Control de vigencia y planes de los clientes</div>
    </div>
  </div>
  <div class="screen-block">
    <div class="screen-label">▶ Módulo de membresías — membresias.html</div>
    <img class="screen-img" src="${imgs['05_membresias']}" alt="Módulo membresías">
    <div class="screen-caption">Tabla con todas las membresías registradas. Muestra el cliente, tipo de plan, fechas de inicio y vencimiento, días restantes y estado actual con código de color.</div>
  </div>
  <div class="module-intro">
    <div class="module-card">
      <h4>Estados de membresía</h4>
      <p><span class="badge badge-green">Activa</span>&nbsp; Vigente, sin problemas.<br><br><span class="badge badge-yellow">Próxima a vencer</span>&nbsp; Vence en menos de 5 días.<br><br><span class="badge badge-red">Vencida</span>&nbsp; Caducada, requiere renovación.</p>
    </div>
    <div class="module-card">
      <h4>Nueva membresía</h4>
      <p>Clic en <strong style="color:#fff">"Registrar Membresía"</strong>. Seleccione el cliente, el tipo de plan y la fecha de inicio. El sistema calcula automáticamente la fecha de vencimiento según los meses contratados.</p>
    </div>
  </div>
  <div class="tip tip-blue"><strong>Nota:</strong> El plan base es de 60.000 COP/mes. Para crear planes con diferentes precios o duraciones, puede editarlos directamente en la base de datos en la tabla <code style="background:rgba(255,255,255,0.07);padding:1px 6px;border-radius:4px">tipos_membresia</code>.</div>
</div>

<hr class="divider">

<!-- 06 — PAGOS -->
<div class="section" id="s6">
  <div class="section-header">
    <div class="section-num">06</div>
    <div>
      <div class="section-title">Pagos</div>
      <div class="section-desc">Registro de todos los cobros y métodos de pago</div>
    </div>
  </div>
  <div class="screen-block">
    <div class="screen-label">▶ Módulo de pagos — pagos.html</div>
    <img class="screen-img" src="${imgs['06_pagos']}" alt="Módulo pagos">
    <div class="screen-caption">Historial completo de pagos con filtros por período, método de pago y búsqueda por cliente. Las tarjetas superiores muestran el total recaudado, ingresos del mes y pagos del día.</div>
  </div>
  <p class="sub-heading">Registrar un pago</p>
  <ol class="steps">
    <li><div class="step-text"><strong>Clic en "Nuevo Pago"</strong>Abre el formulario de registro de cobro.</div></li>
    <li><div class="step-text"><strong>Seleccionar cliente</strong>Busque el nombre del cliente en la lista desplegable.</div></li>
    <li><div class="step-text"><strong>Indicar meses contratados</strong>El monto se calcula automáticamente (60.000 × meses). Puede ajustarlo manualmente si es necesario.</div></li>
    <li><div class="step-text"><strong>Seleccionar método de pago</strong>Efectivo, Tarjeta, Transferencia, Nequi o Daviplata.</div></li>
    <li><div class="step-text"><strong>Guardar</strong>El pago queda registrado y aparece en el historial inmediatamente.</div></li>
  </ol>
  <table class="ref-table">
    <thead><tr><th>Filtro</th><th>Opciones disponibles</th></tr></thead>
    <tbody>
      <tr><td>Período</td><td>Hoy · Esta semana · Este mes · Todo el historial</td></tr>
      <tr><td>Método</td><td>Efectivo · Tarjeta · Transferencia · Nequi · Daviplata</td></tr>
      <tr><td>Búsqueda</td><td>Por nombre del cliente</td></tr>
    </tbody>
  </table>
</div>

<hr class="divider">

<!-- 07 — RUTINAS -->
<div class="section" id="s7">
  <div class="section-header">
    <div class="section-num">07</div>
    <div>
      <div class="section-title">Rutinas de<br>entrenamiento</div>
      <div class="section-desc">Creación y asignación de planes de entrenamiento personalizados</div>
    </div>
  </div>
  <div class="screen-block">
    <div class="screen-label">▶ Módulo de rutinas — rutinas.html</div>
    <img class="screen-img" src="${imgs['07_rutinas']}" alt="Módulo rutinas">
    <div class="screen-caption">Vista de tarjetas con cada rutina, sus ejercicios detallados (series, repeticiones, tiempo de descanso) y los clientes asignados. Permite crear, editar, asignar y eliminar rutinas.</div>
  </div>
  <div class="module-intro">
    <div class="module-card">
      <h4>Crear nueva rutina</h4>
      <p>Clic en <strong style="color:#fff">"Nueva Rutina"</strong>. Defina nombre, objetivo, nivel (principiante / intermedio / avanzado) y descripción. Puede agregar ejercicios del catálogo al crearla.</p>
    </div>
    <div class="module-card">
      <h4>Asignar a un cliente</h4>
      <p>En cada tarjeta hay un botón <strong style="color:#fff">➕ Asignar</strong>. Seleccione el cliente y confirme. El cliente verá su rutina automáticamente en su portal personal.</p>
    </div>
  </div>
  <table class="ref-table">
    <thead><tr><th>Botón</th><th>Función</th></tr></thead>
    <tbody>
      <tr><td>👤➕</td><td>Asignar rutina a un cliente</td></tr>
      <tr><td>👤➖</td><td>Quitar la asignación de un cliente</td></tr>
      <tr><td>✏</td><td>Editar nombre, objetivo, nivel y descripción</td></tr>
      <tr><td>🗑</td><td>Eliminar la rutina del sistema</td></tr>
    </tbody>
  </table>
  <div class="tip tip-green"><strong>Buena práctica:</strong> Cree primero las rutinas base (ej. "Rutina Principiante Fuerza", "Cardio Intermedio") y luego asígnelas a los clientes según su perfil y objetivo declarado.</div>
</div>

<hr class="divider">

<!-- 08 — MÁQUINAS -->
<div class="section" id="s8">
  <div class="section-header">
    <div class="section-num">08</div>
    <div>
      <div class="section-title">Catálogo de máquinas</div>
      <div class="section-desc">Inventario del equipamiento del gimnasio con fotos</div>
    </div>
  </div>
  <div class="screen-block">
    <div class="screen-label">▶ Módulo de máquinas — maquinas.html</div>
    <img class="screen-img" src="${imgs['08_maquinas']}" alt="Módulo máquinas">
    <div class="screen-caption">Galería de todas las máquinas registradas con estado (disponible / en mantenimiento), grupos musculares que trabaja y ejercicios asociados. Cada máquina puede tener una foto real subida por el administrador.</div>
  </div>
  <p class="sub-heading">Agregar o cambiar la imagen de una máquina</p>
  <ol class="steps">
    <li><div class="step-text"><strong>Localizar la máquina</strong>Use la barra de búsqueda o los filtros por grupo muscular y estado.</div></li>
    <li><div class="step-text"><strong>Clic en el ícono de imagen (🖼)</strong>Se abre el modal "Cambiar imagen".</div></li>
    <li><div class="step-text"><strong>Seleccionar la foto</strong>Haga clic en la zona de carga y seleccione una fotografía del equipo (JPG o PNG, máx. 5 MB). La imagen se comprime automáticamente antes de guardarse.</div></li>
    <li><div class="step-text"><strong>Guardar</strong>Clic en "Guardar imagen". La foto aparece de inmediato en la tarjeta de la máquina.</div></li>
  </ol>
  <div class="module-intro">
    <div class="module-card">
      <h4>Cambiar estado de disponibilidad</h4>
      <p>Use el botón <strong style="color:#fff">⏻</strong> para alternar entre <span class="badge badge-green">Disponible</span> y <span class="badge badge-yellow">En mantenimiento</span>. Útil para avisar cuando una máquina está fuera de servicio.</p>
    </div>
    <div class="module-card">
      <h4>Máquinas y ejercicios</h4>
      <p>Las máquinas se vinculan automáticamente a los ejercicios del catálogo de rutinas. El número de ejercicios asociados se muestra como <span class="badge badge-blue">N ejercicios</span> en cada tarjeta.</p>
    </div>
  </div>
</div>

<hr class="divider">

<!-- 09 — PORTAL DEL CLIENTE -->
<div class="section" id="s9">
  <div class="section-header">
    <div class="section-num">09</div>
    <div>
      <div class="section-title">Portal del cliente</div>
      <div class="section-desc">Lo que ve cada cliente al iniciar sesión en el sistema</div>
    </div>
  </div>
  <div class="tip tip-blue" style="margin-bottom:28px"><strong>¿Es necesario documentar esto?</strong> Sí. Como administrador del sistema, debe conocer qué ve su cliente para poder guiarlo y resolver sus dudas. Además, puede entregar esta sección como mini-guía impresa a los clientes de su gimnasio.</div>
  <div class="screen-block">
    <div class="screen-label">▶ Portal del cliente — portal.html</div>
    <img class="screen-img" src="${imgs['09_portal']}" alt="Portal cliente">
    <div class="screen-caption">Cada cliente, al iniciar sesión con su correo y contraseña, accede a su espacio personal donde puede consultar el estado de su membresía, los días restantes, su rutina asignada y el historial de pagos.</div>
  </div>
  <div class="module-intro">
    <div class="module-card">
      <h4>Información de membresía</h4>
      <p>El cliente ve su plan activo, la fecha de vencimiento y un indicador visual con los días que le quedan. Si está vencida, aparece una alerta de renovación.</p>
    </div>
    <div class="module-card">
      <h4>Rutina asignada</h4>
      <p>Si el administrador le asignó una rutina, el cliente puede verla completa: ejercicios, series, repeticiones y tiempos de descanso.</p>
    </div>
  </div>
  <p class="sub-heading">¿Cómo accede un cliente a su portal?</p>
  <ol class="steps">
    <li><div class="step-text"><strong>El administrador registra al cliente</strong>En el módulo de Clientes, con nombre, correo y contraseña.</div></li>
    <li><div class="step-text"><strong>El cliente abre la página del gimnasio</strong>O va directamente a la URL del sistema y hace clic en "Ingresar".</div></li>
    <li><div class="step-text"><strong>Ingresa su correo y contraseña</strong>Los que el administrador le asignó al registrarlo.</div></li>
    <li><div class="step-text"><strong>Ve su portal personal</strong>Con toda su información: membresía, rutina asignada e historial de pagos.</div></li>
  </ol>
  <div class="tip"><strong>Recomendación:</strong> Comparta la URL del sistema con sus clientes junto a sus credenciales de acceso. El sistema funciona desde el celular como una app web progresiva (PWA) — no requiere instalar nada.</div>
</div>

<hr class="divider">

<!-- FOOTER -->
<div class="manual-footer">
  <p><strong>HECTORGYM</strong> &nbsp;·&nbsp; Sistema de gestión para gimnasios &nbsp;·&nbsp; Manual v1.0</p>
  <p style="margin-top:6px;opacity:0.5">Generado automáticamente · 2026</p>
</div>

</body>
</html>`;

fs.writeFileSync(path.join(__dirname, '..', 'MANUAL_HECTORGYM.html'), html, 'utf8');
const size = Buffer.byteLength(html, 'utf8');
console.log('Manual generado:', Math.round(size / 1024) + ' KB');
