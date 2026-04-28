const API_BASE_URL = window.HECTORGYM_API_URL || `${window.location.origin}/api`;
const STORAGE_KEYS = {
  token: 'hectorgym_token',
  user: 'hectorgym_user',
  portalUserId: 'hectorgym_portal_user_id'
};

const appState = {
  get token() {
    return localStorage.getItem(STORAGE_KEYS.token);
  },
  get user() {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    return raw ? JSON.parse(raw) : null;
  },
  setSession(token, user) {
    localStorage.setItem(STORAGE_KEYS.token, token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  },
  clearSession() {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.portalUserId);
  }
};

function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toISOString().split('T')[0];
}

function formatCurrency(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function initialsFromName(nombre = '', apellido = '') {
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
}

function calculateImc(peso, estatura) {
  if (!peso || !estatura) return '-';
  const imc = Number(peso) / (Number(estatura) * Number(estatura));
  return Number.isFinite(imc) ? imc.toFixed(1) : '-';
}

async function apiFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (appState.token) {
    headers.Authorization = `Bearer ${appState.token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = data?.error || data?.message || 'No se pudo completar la solicitud';
    throw new Error(message);
  }

  return data;
}

function bindLogoutButtons() {
  document.querySelectorAll('.btn-logout').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      appState.clearSession();
      window.location.href = 'login.html';
    });
  });
}

function showMessage(target, message, type = 'error') {
  if (!target) return;
  target.textContent = message;
  target.className = `status-message status-${type}`;
}

function populateSelect(select, items, config) {
  if (!select) return;

  const {
    placeholder = 'Selecciona una opción',
    valueKey = 'id',
    label = (item) => item.nombre
  } = config;

  select.innerHTML = [
    `<option value="">${escapeHtml(placeholder)}</option>`,
    ...items.map((item) => `
      <option value="${escapeHtml(item[valueKey])}">${escapeHtml(label(item))}</option>
    `)
  ].join('');
}

function membershipBadgeClass(estado) {
  if (estado === 'activa') return 'badge-green';
  if (estado === 'proxima_a_vencer') return 'badge-orange';
  if (estado === 'vencida') return 'badge-red';
  return 'badge-yellow';
}

function paymentBadgeClass(metodo) {
  if (metodo === 'tarjeta') return 'badge-blue';
  if (metodo === 'transferencia') return 'badge-teal';
  return 'badge-green';
}

function closeModalById(id) {
  document.getElementById(id)?.classList.remove('active');
}

function buildPromptOptions(items, formatter) {
  return items.map((item) => formatter(item)).join('\n');
}

// ── Custom modal system (replaces window.prompt / window.confirm) ─────────────

function _getModalOverlay() {
  let overlay = document.getElementById('hg-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'hg-modal-overlay';
    overlay.className = 'modal-overlay';
    document.body.appendChild(overlay);
  }
  return overlay;
}

function showFormModal({ title, icon = '', fields = [], submitLabel = 'Guardar' }) {
  return new Promise((resolve) => {
    const overlay = _getModalOverlay();

    const fieldsHtml = fields.map((f) => {
      let input;
      if (f.type === 'select') {
        const opts = (f.options || []).map((o) =>
          `<option value="${escapeHtml(String(o.value))}"${String(o.value) === String(f.value) ? ' selected' : ''}>${escapeHtml(o.label)}</option>`
        ).join('');
        input = `<select class="form-control" id="hgf-${f.id}" name="${f.id}">${opts}</select>`;
      } else if (f.type === 'textarea') {
        input = `<textarea class="form-control" id="hgf-${f.id}" name="${f.id}" rows="${f.rows || 3}">${escapeHtml(String(f.value || ''))}</textarea>`;
      } else {
        const attrs = [
          f.min !== undefined ? `min="${f.min}"` : '',
          f.max !== undefined ? `max="${f.max}"` : '',
          f.step !== undefined ? `step="${f.step}"` : '',
          f.placeholder ? `placeholder="${escapeHtml(f.placeholder)}"` : ''
        ].filter(Boolean).join(' ');
        input = `<input class="form-control" id="hgf-${f.id}" name="${f.id}" type="${f.type}" value="${escapeHtml(String(f.value ?? ''))}" ${attrs}>`;
      }
      const showRequired = f.required !== false;
      return `<div class="form-group">
        <label for="hgf-${f.id}">${escapeHtml(f.label)}${showRequired ? ' <span style="color:var(--red)">*</span>' : ''}</label>
        ${input}
      </div>`;
    }).join('');

    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          ${icon ? `<span style="margin-right:10px;font-size:1.1rem">${icon}</span>` : ''}<span>${escapeHtml(title)}</span>
          <button class="modal-close" id="hg-modal-close" type="button">✕</button>
        </div>
        <div class="modal-body">
          <form id="hg-modal-form" novalidate>${fieldsHtml}</form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" id="hg-modal-cancel">Cancelar</button>
          <button type="submit" form="hg-modal-form" class="btn btn-primary">${escapeHtml(submitLabel)}</button>
        </div>
      </div>`;

    overlay.classList.add('active');
    setTimeout(() => overlay.querySelector('input,select,textarea')?.focus(), 60);

    function close(result) {
      overlay.classList.remove('active');
      resolve(result);
    }

    overlay.querySelector('#hg-modal-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const data = {};
      fields.forEach((f) => { data[f.id] = document.getElementById(`hgf-${f.id}`)?.value ?? ''; });
      close(data);
    });
    overlay.querySelector('#hg-modal-cancel').addEventListener('click', () => close(null));
    overlay.querySelector('#hg-modal-close').addEventListener('click', () => close(null));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(null); });
  });
}

function showConfirmModal({ title = '¿Confirmar?', message = '', confirmLabel = 'Confirmar', danger = false } = {}) {
  return new Promise((resolve) => {
    const overlay = _getModalOverlay();

    overlay.innerHTML = `
      <div class="modal" style="max-width:420px">
        <div class="modal-header">
          ${danger ? '<span style="color:var(--red);margin-right:8px;font-size:1.1rem">⚠</span>' : ''}<span>${escapeHtml(title)}</span>
          <button class="modal-close" id="hg-modal-close" type="button">✕</button>
        </div>
        <div class="modal-body">
          <p style="color:var(--text-secondary);font-size:.9rem;line-height:1.65;margin:0">${escapeHtml(message)}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" id="hg-modal-cancel">Cancelar</button>
          <button type="button" class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="hg-modal-confirm">${escapeHtml(confirmLabel)}</button>
        </div>
      </div>`;

    overlay.classList.add('active');
    setTimeout(() => overlay.querySelector('#hg-modal-confirm')?.focus(), 60);

    function close(result) {
      overlay.classList.remove('active');
      resolve(result);
    }

    overlay.querySelector('#hg-modal-confirm').addEventListener('click', () => close(true));
    overlay.querySelector('#hg-modal-cancel').addEventListener('click', () => close(false));
    overlay.querySelector('#hg-modal-close').addEventListener('click', () => close(false));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(false); });
  });
}

// ─────────────────────────────────────────────────────────────────────────────

function bindDashboardLinks() {
  const dashboardLinks = document.querySelectorAll('[data-dashboard-link]');

  dashboardLinks.forEach((element) => {
    const target = element.dataset.dashboardLink;
    if (!target) return;

    element.addEventListener('click', () => {
      window.location.href = target;
    });

    element.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        window.location.href = target;
      }
    });
  });
}

function requireSession() {
  if (!appState.token || !appState.user) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function requireAdmin() {
  if (!requireSession()) return false;
  if (appState.user.rol !== 'admin') {
    window.location.href = 'landing.html';
    return false;
  }
  return true;
}

async function initLoginPage() {
  if (appState.user?.rol === 'admin') { window.location.href = 'index.html'; return; }
  if (appState.user?.rol === 'usuario') { window.location.href = 'landing.html'; return; }

  const loginForm = document.getElementById('loginForm');
  const loginStatus = document.getElementById('loginStatus');
  const loginBtn = document.getElementById('loginBtn');
  const togglePass = document.getElementById('togglePass');
  const passwordInput = document.getElementById('loginPassword');

  // Toggle login ↔ registro
  const loginCard = loginForm?.closest('.login-card');
  const registerCard = document.getElementById('registerCard');
  document.getElementById('showRegisterBtn')?.addEventListener('click', () => {
    loginCard.style.display = 'none';
    registerCard.style.display = '';
    window.scrollTo(0, 0);
  });
  document.getElementById('showLoginBtn')?.addEventListener('click', () => {
    registerCard.style.display = 'none';
    loginCard.style.display = '';
    window.scrollTo(0, 0);
  });

  togglePass?.addEventListener('click', () => {
    const isPass = passwordInput.type === 'password';
    passwordInput.type = isPass ? 'text' : 'password';
    document.getElementById('togglePassIcon').className = isPass ? 'fas fa-eye-slash' : 'fas fa-eye';
  });

  // Toggle mostrar/ocultar contraseña en registro
  document.getElementById('toggleRegPass')?.addEventListener('click', () => {
    const inp = document.getElementById('regPassword');
    const isPass = inp.type === 'password';
    inp.type = isPass ? 'text' : 'password';
    document.getElementById('toggleRegPassIcon').className = isPass ? 'fas fa-eye-slash' : 'fas fa-eye';
  });

  loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    loginStatus.style.display = 'block';
    showMessage(loginStatus, 'Verificando credenciales...', 'info');
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ingresando...';
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ correo: formData.get('correo'), password: formData.get('password') })
      });
      appState.setSession(data.token, data.usuario);
      showMessage(loginStatus, 'Acceso correcto. Redirigiendo...', 'success');
      setTimeout(() => {
        window.location.href = data.usuario.rol === 'admin' ? 'index.html' : 'landing.html';
      }, 600);
    } catch (error) {
      showMessage(loginStatus, error.message);
      loginBtn.disabled = false;
      loginBtn.innerHTML = '<i class="fas fa-unlock"></i> INGRESAR';
    }
  });

  // Formulario de registro
  const registerForm = document.getElementById('registerForm');
  const registerStatus = document.getElementById('registerStatus');
  const registerBtn = document.getElementById('registerBtn');

  registerForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(registerForm);
    registerStatus.style.display = 'block';
    showMessage(registerStatus, 'Creando cuenta...', 'info');
    registerBtn.disabled = true;
    registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creando...';
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          nombre: formData.get('nombre'),
          apellido: formData.get('apellido'),
          documento: formData.get('documento') || undefined,
          correo: formData.get('correo'),
          password: formData.get('password'),
          telefono: formData.get('telefono') || undefined
        })
      });
      showMessage(registerStatus, '¡Cuenta creada! Ahora inicia sesión.', 'success');
      setTimeout(() => {
        registerCard.style.display = 'none';
        loginCard.style.display = '';
        registerForm.reset();
        registerStatus.style.display = 'none';
      }, 1500);
    } catch (error) {
      showMessage(registerStatus, error.message);
    } finally {
      registerBtn.disabled = false;
      registerBtn.innerHTML = '<i class="fas fa-user-plus"></i> REGISTRARME';
    }
  });
}

async function initIndexPage() {
  bindLogoutButtons();
  bindDashboardLinks();

  const loginOverlay = document.getElementById('loginOverlay');
  const loginForm = document.getElementById('loginForm');
  const loginStatus = document.getElementById('loginStatus');
  const adminName = document.getElementById('adminName');

  async function loadAdminDashboard() {
    const [usuarios, membresias, pagos, rutinas] = await Promise.all([
      apiFetch('/usuarios'),
      apiFetch('/membresias'),
      apiFetch('/pagos'),
      apiFetch('/rutinas')
    ]);

    document.querySelector('[data-stat="clientes"]').textContent = usuarios.length;
    document.querySelector('[data-stat="membresias"]').textContent = membresias.filter((item) => item.estado === 'activa').length;
    document.querySelector('[data-stat="pagos"]').textContent = pagos.length;
    document.querySelector('[data-stat="rutinas"]').textContent = rutinas.length;

    if (adminName && appState.user) {
      adminName.textContent = `${appState.user.nombre} ${appState.user.apellido}`;
    }
  }

  if (appState.user?.rol === 'usuario') {
    window.location.href = 'landing.html';
    return;
  }

  if (appState.user?.rol !== 'admin') {
    window.location.href = 'login.html';
    return;
  }

  try {
    await loadAdminDashboard();
  } catch (error) {
    appState.clearSession();
    window.location.href = 'login.html';
  }
}


async function initClientesPage() {
  bindLogoutButtons();
  if (!requireAdmin()) return;

  const tableBody = document.getElementById('clientesTableBody');
  const totalInfo = document.getElementById('clientesTotalInfo');
  const searchInput = document.getElementById('clientesSearch');
  const statusFilter = document.getElementById('clientesEstadoFilter');
  const formStatus = document.getElementById('clienteFormStatus');
  let clientes = [];

  function renderRows(items) {
    if (!tableBody) return;

    if (!items.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              <i class="fas fa-users-slash"></i>
              <p>No hay clientes que coincidan con los filtros.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = items.map((cliente) => {
      const estado = cliente.estado_membresia || 'sin_membresia';
      const badgeClass = estado === 'activa'
        ? 'badge-green'
        : estado === 'proxima_a_vencer'
          ? 'badge-orange'
          : estado === 'vencida'
            ? 'badge-red'
            : 'badge-yellow';
      const badgeLabel = estado === 'sin_membresia' ? 'Sin membresía' : estado.replaceAll('_', ' ');

      return `
        <tr>
          <td>
            <div class="user-info">
              <div class="user-avatar">${initialsFromName(cliente.nombre, cliente.apellido)}</div>
              <div>
                <div class="user-name">${escapeHtml(cliente.nombre)} ${escapeHtml(cliente.apellido)}</div>
                <div class="user-email">${escapeHtml(cliente.correo)}</div>
              </div>
            </div>
          </td>
          <td>${escapeHtml(cliente.documento || '-')}</td>
          <td>${escapeHtml(cliente.telefono || '-')}</td>
          <td><span class="badge ${badgeClass}">${escapeHtml(badgeLabel)}</span></td>
          <td>${escapeHtml(cliente.objetivo || '-')}</td>
          <td>
            <div class="action-btns">
              <button class="action-btn action-btn-view" data-preview-user="${cliente.id}" title="Ver portal"><i class="fas fa-eye"></i></button>
              <button class="action-btn action-btn-edit" data-edit-user="${cliente.id}" title="Editar cliente"><i class="fas fa-pen"></i></button>
              <button class="action-btn action-btn-delete" data-delete-user="${cliente.id}" title="Desactivar cliente"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function applyFilters() {
    const query = (searchInput?.value || '').trim().toLowerCase();
    const status = statusFilter?.value || 'todos';
    const filtered = clientes.filter((cliente) => {
      const fullName = `${cliente.nombre} ${cliente.apellido}`.toLowerCase();
      const matchesQuery = !query
        || fullName.includes(query)
        || String(cliente.id).includes(query)
        || (cliente.correo || '').toLowerCase().includes(query);
      const clienteEstado = cliente.estado_membresia || 'sin_membresia';
      const matchesStatus = status === 'todos' || clienteEstado === status;
      return matchesQuery && matchesStatus;
    });

    renderRows(filtered);
    if (totalInfo) {
      totalInfo.textContent = `Mostrando ${filtered.length} de ${clientes.length} clientes`;
    }
  }

  async function loadClientes() {
    clientes = await apiFetch('/usuarios');
    applyFilters();
  }

  tableBody?.addEventListener('click', async (event) => {
    const previewButton = event.target.closest('[data-preview-user]');
    const editButton = event.target.closest('[data-edit-user]');
    const deleteButton = event.target.closest('[data-delete-user]');
    if (!previewButton && !editButton && !deleteButton) return;

    if (previewButton) {
      localStorage.setItem(STORAGE_KEYS.portalUserId, previewButton.dataset.previewUser);
      window.location.href = 'portal.html';
      return;
    }

    if (editButton) {
      const cliente = clientes.find((item) => Number(item.id) === Number(editButton.dataset.editUser));
      if (!cliente) return;

      const result = await showFormModal({
        title: 'Editar cliente',
        icon: '✏️',
        fields: [
          { id: 'nombreCompleto', label: 'Nombre completo', type: 'text', value: `${cliente.nombre} ${cliente.apellido}` },
          { id: 'telefono', label: 'Teléfono', type: 'text', value: cliente.telefono || '', required: false },
          { id: 'objetivo', label: 'Objetivo', type: 'text', value: cliente.objetivo || '', required: false },
          { id: 'peso', label: 'Peso (kg)', type: 'number', value: cliente.peso || '', required: false, min: 0, step: 0.1 },
          { id: 'estatura', label: 'Estatura (m)', type: 'number', value: cliente.estatura || '', required: false, min: 0, step: 0.01 }
        ]
      });
      if (!result) return;

      const [nombre = '', ...apellidoPartes] = result.nombreCompleto.trim().split(' ');
      const apellido = apellidoPartes.join(' ') || cliente.apellido;

      apiFetch(`/usuarios/${cliente.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          nombre,
          apellido,
          telefono: result.telefono,
          objetivo: result.objetivo,
          peso: result.peso || null,
          estatura: result.estatura || null
        })
      })
        .then(async () => {
          showMessage(formStatus, 'Cliente actualizado correctamente.', 'success');
          await loadClientes();
        })
        .catch((error) => showMessage(formStatus, error.message));

      return;
    }

    if (deleteButton) {
      const cliente = clientes.find((item) => Number(item.id) === Number(deleteButton.dataset.deleteUser));
      if (!cliente) return;
      const ok = await showConfirmModal({
        title: 'Desactivar cliente',
        message: `¿Desactivar la cuenta de ${cliente.nombre} ${cliente.apellido}? El cliente no podrá iniciar sesión.`,
        confirmLabel: 'Desactivar',
        danger: true
      });
      if (!ok) return;

      apiFetch(`/usuarios/${cliente.id}`, { method: 'DELETE' })
        .then(async () => {
          showMessage(formStatus, 'Cliente desactivado correctamente.', 'success');
          await loadClientes();
        })
        .catch((error) => showMessage(formStatus, error.message));
    }
  });

  searchInput?.addEventListener('input', applyFilters);
  statusFilter?.addEventListener('change', applyFilters);

  try {
    await loadClientes();
  } catch (error) {
    if (tableBody) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              <i class="fas fa-triangle-exclamation"></i>
              <p>${escapeHtml(error.message)}</p>
            </div>
          </td>
        </tr>
      `;
    }
  }
}

async function initPortalPage() {
  bindLogoutButtons();
  if (!requireSession()) return;

  const currentUser = appState.user;
  const requestedUserId = localStorage.getItem(STORAGE_KEYS.portalUserId);
  const userId = currentUser.rol === 'admin' && requestedUserId ? Number(requestedUserId) : currentUser.id;

  try {
    const [perfil, membresia, rutina, pagos] = await Promise.all([
      apiFetch(`/usuarios/${userId}`),
      apiFetch(`/membresias/usuario/${userId}`),
      apiFetch(`/rutinas/usuario/${userId}`).catch(() => null),
      apiFetch(`/pagos/usuario/${userId}`)
    ]);

    document.getElementById('portalNombre').textContent = `Hola, ${perfil.nombre}`;
    document.getElementById('portalBienvenida').textContent = currentUser.rol === 'admin'
      ? `Vista previa del portal de ${perfil.nombre} ${perfil.apellido}`
      : 'Bienvenido a tu portal personal de entrenamiento';
    document.getElementById('portalObjetivo').textContent = perfil.objetivo || 'Sin objetivo';
    document.getElementById('portalPeso').textContent = perfil.peso ? `${perfil.peso} kg` : '-';
    document.getElementById('portalEstatura').textContent = perfil.estatura ? `${perfil.estatura} m` : '-';
    document.getElementById('portalImc').textContent = calculateImc(perfil.peso, perfil.estatura);
    document.getElementById('portalMembresiaEstado').textContent = membresia.estado.replaceAll('_', ' ');
    document.getElementById('portalPlan').textContent = membresia.tipo;
    document.getElementById('portalFechaInicio').textContent = formatDate(membresia.fecha_inicio);
    document.getElementById('portalFechaFin').textContent = formatDate(membresia.fecha_fin);
    document.getElementById('portalNotice').textContent = `Tu membresía tiene ${membresia.dias_restantes} día(s) restantes.`;

    document.getElementById('perfilNombreCompleto').textContent = `${perfil.nombre} ${perfil.apellido}`;
    document.getElementById('perfilDocumento').textContent = perfil.documento || '-';
    document.getElementById('perfilEmail').textContent = perfil.correo;
    document.getElementById('perfilTelefono').textContent = perfil.telefono || '-';
    document.getElementById('perfilObservaciones').textContent = perfil.objetivo || 'Sin observaciones';

    const estadoBadge = document.getElementById('portalEstadoBadge');
    estadoBadge.textContent = membresia.estado.replaceAll('_', ' ');
    estadoBadge.className = `badge ${membresia.estado === 'activa' ? 'badge-green' : membresia.estado === 'proxima_a_vencer' ? 'badge-orange' : 'badge-red'}`;

    const rutinaTitulo = document.getElementById('rutinaTitulo');
    const rutinaObjetivo = document.getElementById('rutinaObjetivo');
    const rutinaDuracion = document.getElementById('rutinaDuracion');
    const rutinaBody = document.getElementById('rutinaBody');

    if (rutina) {
      rutinaTitulo.textContent = rutina.nombre;
      rutinaObjetivo.textContent = `Objetivo: ${rutina.objetivo || 'General'}`;
      rutinaDuracion.textContent = `${rutina.ejercicios.length} ejercicio(s)`;
      rutinaBody.innerHTML = rutina.ejercicios.map((ejercicio) => `
        <tr>
          <td>
            <div class="exercise-name">${escapeHtml(ejercicio.nombre)}</div>
            <div class="exercise-desc">${escapeHtml(ejercicio.grupo_muscular || 'Sin grupo muscular')}</div>
          </td>
          <td>${escapeHtml(ejercicio.series)}</td>
          <td>${escapeHtml(ejercicio.repeticiones)}</td>
          <td>${escapeHtml(ejercicio.descanso_seg)}s</td>
        </tr>
      `).join('');
    } else {
      rutinaTitulo.textContent = 'Sin rutina asignada';
      rutinaObjetivo.textContent = 'Objetivo: pendiente';
      rutinaDuracion.textContent = '-';
      rutinaBody.innerHTML = `
        <tr>
          <td colspan="4">
            <div class="empty-state">
              <i class="fas fa-clipboard"></i>
              <p>Este usuario todavía no tiene rutina asignada.</p>
            </div>
          </td>
        </tr>
      `;
    }

    const pagosBody = document.getElementById('pagosBody');
    pagosBody.innerHTML = pagos.map((pago) => {
      const badgeClass = pago.metodo_pago === 'tarjeta'
        ? 'badge-blue'
        : pago.metodo_pago === 'transferencia'
          ? 'badge-teal'
          : 'badge-green';
      return `
        <tr>
          <td>${formatDate(pago.fecha)}</td>
          <td>${escapeHtml(pago.tipo_membresia || pago.descripcion || 'Pago')}</td>
          <td><span class="badge ${badgeClass}">${escapeHtml(pago.metodo_pago)}</span></td>
          <td class="amount">${formatCurrency(pago.monto)}</td>
        </tr>
      `;
    }).join('') || `
      <tr>
        <td colspan="4">
          <div class="empty-state">
            <i class="fas fa-receipt"></i>
            <p>No hay pagos registrados.</p>
          </div>
        </td>
      </tr>
    `;
  } catch (error) {
    document.querySelector('.main-container').innerHTML = `
      <div class="section-card">
        <div class="card-header"><i class="fas fa-triangle-exclamation"></i> Error</div>
        <div class="card-body">
          <div class="empty-state">
            <i class="fas fa-circle-exclamation"></i>
            <p>${escapeHtml(error.message)}</p>
          </div>
        </div>
      </div>
    `;
  }
}

async function initMembresiasPage() {
  bindLogoutButtons();
  if (!requireAdmin()) return;

  const tableBody = document.getElementById('membresiasTableBody');
  const totalInfo = document.getElementById('membresiasTotalInfo');
  const resumenInfo = document.getElementById('membresiasResumenInfo');
  const searchInput = document.getElementById('membresiasSearch');
  const estadoFilter = document.getElementById('membresiasEstadoFilter');
  const planFilter = document.getElementById('membresiasPlanFilter');
  const formStatus = document.getElementById('membresiaFormStatus');
  let membresias = [];
  let tipos = [];

  function updateStats(items) {
    document.getElementById('membresiasActivasStat').textContent = items.filter((item) => item.estado === 'activa').length;
    document.getElementById('membresiasVencidasStat').textContent = items.filter((item) => item.estado === 'vencida').length;
    document.getElementById('membresiasProximasStat').textContent = items.filter((item) => item.estado === 'proxima_a_vencer').length;
    document.getElementById('membresiasIngresosStat').textContent = formatCurrency(
      items.filter((item) => item.estado !== 'vencida').reduce((sum, item) => sum + Number(item.precio || 0), 0)
    );
  }

  function renderRows(items) {
    if (!tableBody) return;

    if (!items.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="empty-state">
              <i class="fas fa-id-card"></i>
              <p>No hay membresías que coincidan con los filtros.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = items.map((membresia) => `
      <tr>
        <td>
          <div class="user-info">
            <div class="user-avatar">${initialsFromName(membresia.nombre, membresia.apellido)}</div>
            <div>
              <div class="user-name">${escapeHtml(membresia.nombre)} ${escapeHtml(membresia.apellido)}</div>
              <div class="user-email">#${escapeHtml(membresia.id)} · ${escapeHtml(membresia.correo || '')}</div>
            </div>
          </div>
        </td>
        <td>${escapeHtml(membresia.tipo)}</td>
        <td>${formatDate(membresia.fecha_inicio)}</td>
        <td>${formatDate(membresia.fecha_fin)}</td>
        <td><span class="badge ${membershipBadgeClass(membresia.estado)}">${escapeHtml(String(membresia.estado).replaceAll('_', ' '))}</span></td>
        <td>${formatCurrency(membresia.precio)}</td>
        <td>
          <div class="action-btns">
            <button class="action-btn action-btn-edit" data-edit-membership="${membresia.id}" title="Editar membresía"><i class="fas fa-pen"></i></button>
            <button class="action-btn action-btn-delete" data-delete-membership="${membresia.id}" title="Eliminar membresía"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function applyFilters() {
    const query = (searchInput?.value || '').trim().toLowerCase();
    const estado = estadoFilter?.value || 'todos';
    const plan = planFilter?.value || 'todos';

    const filtered = membresias.filter((membresia) => {
      const fullName = `${membresia.nombre} ${membresia.apellido}`.toLowerCase();
      const matchesQuery = !query
        || fullName.includes(query)
        || String(membresia.id).includes(query)
        || String(membresia.tipo || '').toLowerCase().includes(query);
      const matchesEstado = estado === 'todos' || membresia.estado === estado;
      const matchesPlan = plan === 'todos' || String(membresia.tipo) === plan;
      return matchesQuery && matchesEstado && matchesPlan;
    });

    renderRows(filtered);
    updateStats(membresias);

    if (totalInfo) {
      totalInfo.textContent = `Mostrando ${filtered.length} de ${membresias.length} membresías`;
    }
    if (resumenInfo) {
      const total = filtered.reduce((sum, item) => sum + Number(item.precio || 0), 0);
      resumenInfo.textContent = `Ingreso estimado del filtro: ${formatCurrency(total)}`;
    }
  }

  async function loadData() {
    const [tiposData, membresiasData, pagosData] = await Promise.all([
      apiFetch('/membresias/tipos'),
      apiFetch('/membresias'),
      apiFetch('/pagos')
    ]);

    tipos = tiposData;
    membresias = membresiasData;

    // Calcular ingresos reales del mes actual desde pagos
    const ahora = new Date();
    const mesActual = ahora.getMonth();
    const anioActual = ahora.getFullYear();
    const ingresosMes = (pagosData || []).reduce((sum, p) => {
      const fecha = new Date(p.fecha);
      if (fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual) {
        return sum + Number(p.monto || 0);
      }
      return sum;
    }, 0);

    if (planFilter) {
      planFilter.innerHTML = ['<option value="todos">Todos los planes</option>', ...tipos.map((tipo) => `
        <option value="${escapeHtml(tipo.nombre)}">${escapeHtml(tipo.nombre)}</option>
      `)].join('');
    }

    applyFilters();

    // Sobreescribir el stat con el ingreso real del mes
    document.getElementById('membresiasIngresosStat').textContent = formatCurrency(ingresosMes);
  }

  searchInput?.addEventListener('input', applyFilters);
  estadoFilter?.addEventListener('change', applyFilters);
  planFilter?.addEventListener('change', applyFilters);

  tableBody?.addEventListener('click', async (event) => {
    const editButton = event.target.closest('[data-edit-membership]');
    const deleteButton = event.target.closest('[data-delete-membership]');

    if (editButton) {
      const membership = membresias.find((item) => Number(item.id) === Number(editButton.dataset.editMembership));
      if (!membership) return;

      const result = await showFormModal({
        title: 'Editar membresía',
        icon: '💳',
        fields: [
          {
            id: 'tipo_id', label: 'Tipo de membresía', type: 'select', value: String(membership.tipo_id),
            options: tipos.map((t) => ({ value: t.id, label: `${t.nombre} — ${formatCurrency(t.precio)}` }))
          },
          { id: 'fecha_inicio', label: 'Fecha de inicio', type: 'date', value: formatDate(membership.fecha_inicio) },
          {
            id: 'estado', label: 'Estado', type: 'select', value: membership.estado,
            options: [
              { value: 'activa', label: 'Activa' },
              { value: 'proxima_a_vencer', label: 'Próxima a vencer' },
              { value: 'vencida', label: 'Vencida' }
            ]
          }
        ]
      });
      if (!result) return;

      apiFetch(`/membresias/${membership.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          tipo_id: Number(result.tipo_id),
          fecha_inicio: result.fecha_inicio,
          estado: result.estado
        })
      })
        .then(async () => {
          showMessage(formStatus, 'Membresía actualizada correctamente.', 'success');
          await loadData();
        })
        .catch((error) => showMessage(formStatus, error.message));

      return;
    }

    if (deleteButton) {
      const membership = membresias.find((item) => Number(item.id) === Number(deleteButton.dataset.deleteMembership));
      if (!membership) return;
      const ok = await showConfirmModal({
        title: 'Eliminar membresía',
        message: `¿Eliminar la membresía #${membership.id} de ${membership.nombre} ${membership.apellido}?`,
        confirmLabel: 'Eliminar',
        danger: true
      });
      if (!ok) return;

      apiFetch(`/membresias/${membership.id}`, { method: 'DELETE' })
        .then(async () => {
          showMessage(formStatus, 'Membresía eliminada correctamente.', 'success');
          await loadData();
        })
        .catch((error) => showMessage(formStatus, error.message));
    }
  });

  try {
    await loadData();
  } catch (error) {
    if (tableBody) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="empty-state">
              <i class="fas fa-triangle-exclamation"></i>
              <p>${escapeHtml(error.message)}</p>
            </div>
          </td>
        </tr>
      `;
    }
  }
}

async function initPagosPage() {
  bindLogoutButtons();
  if (!requireAdmin()) return;

  const tableBody = document.getElementById('pagosTableBody');
  const totalInfo = document.getElementById('pagosTotalInfo');
  const resumenInfo = document.getElementById('pagosResumenInfo');
  const searchInput = document.getElementById('pagosSearch');
  const metodoFilter = document.getElementById('pagosMetodoFilter');
  const periodoFilter = document.getElementById('pagosPeriodoFilter');
  const form = document.getElementById('pagoForm');
  const formStatus = document.getElementById('pagoFormStatus');
  const usuarioSelect = document.getElementById('pagoUsuarioSelect');
  let pagos = [];
  let usuarios = [];
  let membresias = [];

  function updateStats(items) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    document.getElementById('pagosTotalStat').textContent = formatCurrency(items.reduce((sum, item) => sum + Number(item.monto || 0), 0));
    document.getElementById('pagosMesStat').textContent = formatCurrency(
      items.filter((item) => String(item.fecha).startsWith(currentMonth)).reduce((sum, item) => sum + Number(item.monto || 0), 0)
    );
    document.getElementById('pagosHoyStat').textContent = formatCurrency(
      items.filter((item) => formatDate(item.fecha) === today).reduce((sum, item) => sum + Number(item.monto || 0), 0)
    );
    const hoy = today;
    const membresiasVencidas = membresias.filter(m => m.fecha_fin && m.fecha_fin.split('T')[0] < hoy).length;
    document.getElementById('pagosPendientesStat').textContent = membresiasVencidas;
  }

  function renderRows(items) {
    if (!tableBody) return;

    if (!items.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              <i class="fas fa-receipt"></i>
              <p>No hay pagos que coincidan con los filtros.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = items.map((pago) => `
      <tr>
        <td>${formatDate(pago.fecha)}</td>
        <td>
          <div class="user-info">
            <div class="user-avatar">${initialsFromName(pago.nombre, pago.apellido)}</div>
            <div>
              <div class="user-name">${escapeHtml(pago.nombre)} ${escapeHtml(pago.apellido)}</div>
              <div class="user-email">#${escapeHtml(pago.id)} · ${escapeHtml(pago.correo || '')}</div>
            </div>
          </div>
        </td>
        <td>${escapeHtml(pago.tipo_membresia || pago.descripcion || 'Pago general')}</td>
        <td><span class="badge ${paymentBadgeClass(pago.metodo_pago)}">${escapeHtml(pago.metodo_pago)}</span></td>
        <td>${formatCurrency(pago.monto)}</td>
        <td>
          <div class="action-btns">
            <button class="action-btn action-btn-edit" data-edit-payment="${pago.id}" title="Editar pago"><i class="fas fa-pen"></i></button>
            <button class="action-btn action-btn-delete" data-delete-payment="${pago.id}" title="Eliminar pago"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function filterByPeriod(items, period) {
    if (period === 'todos' || period === 'todo') return items;

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    if (period === 'hoy') {
      return items.filter((item) => formatDate(item.fecha) === today);
    }

    if (period === 'mes') {
      return items.filter((item) => String(item.fecha).startsWith(monthKey));
    }

    if (period === 'semana') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return items.filter((item) => new Date(item.fecha) >= weekAgo);
    }

    return items;
  }

  function applyFilters() {
    const query = (searchInput?.value || '').trim().toLowerCase();
    const metodo = metodoFilter?.value || 'todos';
    const periodo = periodoFilter?.value || 'todos';

    const filtered = filterByPeriod(pagos, periodo).filter((pago) => {
      const fullName = `${pago.nombre} ${pago.apellido}`.toLowerCase();
      const matchesQuery = !query
        || fullName.includes(query)
        || String(pago.tipo_membresia || '').toLowerCase().includes(query)
        || String(pago.descripcion || '').toLowerCase().includes(query);
      const matchesMetodo = metodo === 'todos' || pago.metodo_pago === metodo;
      return matchesQuery && matchesMetodo;
    });

    renderRows(filtered);
    updateStats(pagos);

    if (totalInfo) {
      totalInfo.textContent = `Mostrando ${filtered.length} de ${pagos.length} pagos`;
    }
    if (resumenInfo) {
      resumenInfo.textContent = `Monto filtrado: ${formatCurrency(filtered.reduce((sum, item) => sum + Number(item.monto || 0), 0))}`;
    }
  }

  function reloadMembershipOptions(selectedUserId = '') {
    const filtered = selectedUserId
      ? membresias.filter((item) => Number(item.usuario_id) === Number(selectedUserId))
      : membresias;

    populateSelect(membresiaSelect, filtered, {
      placeholder: 'Pago sin membresía asociada',
      label: (item) => `#${item.id} - ${item.tipo} (${item.nombre} ${item.apellido})`
    });
  }

  async function loadData() {
    const [pagosData, usuariosData, membresiasData] = await Promise.all([
      apiFetch('/pagos'),
      apiFetch('/usuarios'),
      apiFetch('/membresias')
    ]);

    pagos = pagosData;
    usuarios = usuariosData;
    membresias = membresiasData;

    populateSelect(usuarioSelect, usuarios, {
      placeholder: 'Seleccionar cliente',
      label: (item) => `${item.nombre} ${item.apellido}`
    });

    // Fecha por defecto = hoy
    const fechaInput = document.getElementById('pagoFecha');
    if (fechaInput && !fechaInput.value) {
      fechaInput.value = new Date().toISOString().split('T')[0];
    }

    // Monto auto según meses seleccionados
    const mesesSelect = document.getElementById('pagoMeses');
    const montoInput = document.getElementById('pagoMonto');
    const PRECIO_MES = 60000;
    if (mesesSelect && montoInput) {
      const syncMonto = () => {
        montoInput.value = parseInt(mesesSelect.value, 10) * PRECIO_MES;
      };
      syncMonto();
      mesesSelect.addEventListener('change', syncMonto);
    }

    applyFilters();
  }

  tableBody?.addEventListener('click', async (event) => {
    const editButton = event.target.closest('[data-edit-payment]');
    const deleteButton = event.target.closest('[data-delete-payment]');

    if (editButton) {
      const payment = pagos.find((item) => Number(item.id) === Number(editButton.dataset.editPayment));
      if (!payment) return;

      const result = await showFormModal({
        title: 'Editar pago',
        icon: '💰',
        fields: [
          { id: 'monto', label: 'Monto (COP)', type: 'number', value: payment.monto, min: 0 },
          { id: 'fecha', label: 'Fecha', type: 'date', value: formatDate(payment.fecha) },
          {
            id: 'metodo_pago', label: 'Método de pago', type: 'select', value: payment.metodo_pago,
            options: [
              { value: 'efectivo', label: 'Efectivo' },
              { value: 'tarjeta', label: 'Tarjeta' },
              { value: 'transferencia', label: 'Transferencia' },
              { value: 'nequi', label: 'Nequi' },
              { value: 'daviplata', label: 'Daviplata' }
            ]
          },
          { id: 'descripcion', label: 'Descripción', type: 'text', value: payment.descripcion || payment.tipo_membresia || '', required: false }
        ]
      });
      if (!result) return;

      apiFetch(`/pagos/${payment.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          monto: Number(result.monto),
          fecha: result.fecha,
          metodo_pago: result.metodo_pago,
          descripcion: result.descripcion,
          membresia_id: payment.membresia_id || null
        })
      })
        .then(async () => {
          showMessage(formStatus, 'Pago actualizado correctamente.', 'success');
          await loadData();
        })
        .catch((error) => showMessage(formStatus, error.message));

      return;
    }

    if (deleteButton) {
      const payment = pagos.find((item) => Number(item.id) === Number(deleteButton.dataset.deletePayment));
      if (!payment) return;
      const ok = await showConfirmModal({
        title: 'Eliminar pago',
        message: `¿Eliminar el pago #${payment.id} por ${formatCurrency(payment.monto)}?`,
        confirmLabel: 'Eliminar',
        danger: true
      });
      if (!ok) return;

      apiFetch(`/pagos/${payment.id}`, { method: 'DELETE' })
        .then(async () => {
          showMessage(formStatus, 'Pago eliminado correctamente.', 'success');
          await loadData();
        })
        .catch((error) => showMessage(formStatus, error.message));
    }
  });

  searchInput?.addEventListener('input', applyFilters);
  metodoFilter?.addEventListener('change', applyFilters);
  periodoFilter?.addEventListener('change', applyFilters);

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);

    try {
      const result = await apiFetch('/pagos', {
        method: 'POST',
        body: JSON.stringify({
          usuario_id: Number(formData.get('usuario_id')),
          monto: Number(formData.get('monto')),
          fecha: formData.get('fecha'),
          meses: Number(formData.get('meses')) || 1,
          metodo_pago: formData.get('metodo_pago'),
          descripcion: formData.get('descripcion')
        })
      });

      showMessage(formStatus, result.message || 'Pago registrado correctamente.', 'success');
      form.reset();
      closeModalById('modalPago');
      await loadData();
    } catch (error) {
      showMessage(formStatus, error.message);
    }
  });

  try {
    await loadData();
  } catch (error) {
    if (tableBody) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              <i class="fas fa-triangle-exclamation"></i>
              <p>${escapeHtml(error.message)}</p>
            </div>
          </td>
        </tr>
      `;
    }
  }
}

async function initRutinasPage() {
  bindLogoutButtons();
  if (!requireAdmin()) return;

  const container = document.getElementById('rutinasContainer');
  const searchInput = document.getElementById('rutinasSearch');
  const objetivoFilter = document.getElementById('rutinasObjetivoFilter');
  const form = document.getElementById('rutinaForm');
  const formStatus = document.getElementById('rutinaFormStatus');
  const usuarioSelect = document.getElementById('rutinaUsuarioSelect');
  const ejercicioSelect = document.getElementById('rutinaEjercicioSelect');
  let rutinas = [];
  let usuarios = [];
  let ejercicios = [];

  function getAssignedUsers(routine) {
    const assignedIds = String(routine.usuarios_asignados_ids || '')
      .split(',')
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isFinite(value) && value > 0);

    return usuarios.filter((user) => assignedIds.includes(Number(user.id)));
  }

  function renderCards(items) {
    if (!container) return;

    if (!items.length) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-clipboard-list"></i>
          <p>No hay rutinas que coincidan con los filtros.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map((rutina) => {
      const ejerciciosRows = rutina.ejercicios?.length
        ? rutina.ejercicios.map((ejercicio) => `
          <tr>
            <td><div class="exercise-name">${escapeHtml(ejercicio.nombre)}</div></td>
            <td><span style="color: var(--text-secondary)">${escapeHtml(ejercicio.grupo_muscular || 'General')}</span></td>
            <td>${escapeHtml(ejercicio.series)}</td>
            <td>${escapeHtml(ejercicio.repeticiones)}</td>
            <td>${escapeHtml(ejercicio.descanso_seg)}s</td>
          </tr>
        `).join('')
        : `
          <tr>
            <td colspan="5">
              <div class="empty-state">
                <i class="fas fa-dumbbell"></i>
                <p>Rutina sin ejercicios cargados.</p>
              </div>
            </td>
          </tr>
        `;

      return `
        <div class="routine-card">
          <div class="routine-card-header">
            <h3><i class="fas fa-dumbbell"></i> ${escapeHtml(rutina.nombre)}</h3>
            <div class="action-btns">
              <span class="badge badge-orange">${escapeHtml(rutina.nivel || 'general')}</span>
              <button class="action-btn action-btn-view" data-assign-routine="${rutina.id}" title="Asignar rutina"><i class="fas fa-user-plus"></i></button>
              <button class="action-btn action-btn-view" data-unassign-routine="${rutina.id}" title="Quitar cliente de rutina"><i class="fas fa-user-minus"></i></button>
              <button class="action-btn action-btn-edit" data-edit-routine="${rutina.id}" title="Editar rutina"><i class="fas fa-pen"></i></button>
              <button class="action-btn action-btn-delete" data-delete-routine="${rutina.id}" title="Eliminar rutina"><i class="fas fa-trash"></i></button>
            </div>
          </div>
          <div class="routine-card-body">
            <div class="routine-card-meta">
              <div class="meta-item">
                <div class="meta-label">Objetivo</div>
                <div class="meta-value">${escapeHtml(rutina.objetivo || 'General')}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">Ejercicios</div>
                <div class="meta-value">${escapeHtml(rutina.ejercicios?.length || 0)}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">Asignada a</div>
                <div class="meta-value" style="color: var(--orange)">${escapeHtml(rutina.usuarios_asignados || 'Nadie aún')}</div>
              </div>
            </div>
            <p style="margin-bottom: 16px; color: var(--text-secondary)">${escapeHtml(rutina.descripcion || 'Sin descripción')}</p>
            <table class="data-table">
              <thead>
                <tr>
                  <th>Ejercicio</th>
                  <th>Grupo</th>
                  <th>Series</th>
                  <th>Reps</th>
                  <th>Descanso</th>
                </tr>
              </thead>
              <tbody>${ejerciciosRows}</tbody>
            </table>
          </div>
        </div>
      `;
    }).join('');
  }

  function applyFilters() {
    const query = (searchInput?.value || '').trim().toLowerCase();
    const objetivo = objetivoFilter?.value || 'todos';

    const filtered = rutinas.filter((rutina) => {
      const matchesQuery = !query
        || String(rutina.nombre || '').toLowerCase().includes(query)
        || String(rutina.usuarios_asignados || '').toLowerCase().includes(query)
        || String(rutina.descripcion || '').toLowerCase().includes(query);
      const matchesObjetivo = objetivo === 'todos' || String(rutina.objetivo) === objetivo;
      return matchesQuery && matchesObjetivo;
    });

    renderCards(filtered);
  }

  async function loadData() {
    const [rutinasData, usuariosData, ejerciciosData] = await Promise.all([
      apiFetch('/rutinas'),
      apiFetch('/usuarios'),
      apiFetch('/ejercicios')
    ]);

    const rutinasDetalladas = await Promise.all(
      rutinasData.map(async (rutina) => {
        try {
          const detalle = await apiFetch(`/rutinas/${rutina.id}`);
          return { ...rutina, ejercicios: detalle.ejercicios || [] };
        } catch {
          return { ...rutina, ejercicios: [] };
        }
      })
    );

    rutinas = rutinasDetalladas;
    usuarios = usuariosData;
    ejercicios = ejerciciosData;

    populateSelect(usuarioSelect, usuarios, {
      placeholder: 'No asignar todavía',
      label: (item) => `${item.nombre} ${item.apellido}`
    });
    populateSelect(ejercicioSelect, ejercicios, {
      placeholder: 'Sin ejercicios por ahora',
      label: (item) => `${item.nombre} (${item.grupo_muscular || 'General'})`
    });

    applyFilters();
  }

  searchInput?.addEventListener('input', applyFilters);
  objetivoFilter?.addEventListener('change', applyFilters);

  container?.addEventListener('click', async (event) => {
    const editButton = event.target.closest('[data-edit-routine]');
    const deleteButton = event.target.closest('[data-delete-routine]');
    const assignButton = event.target.closest('[data-assign-routine]');
    const unassignButton = event.target.closest('[data-unassign-routine]');

    if (assignButton) {
      const routine = rutinas.find((item) => Number(item.id) === Number(assignButton.dataset.assignRoutine));
      if (!routine) return;

      const assignableUsers = usuarios.filter((u) => {
        const assigned = getAssignedUsers(routine);
        return !assigned.some((a) => a.id === u.id);
      });
      if (!assignableUsers.length) {
        showMessage(formStatus, 'Todos los clientes ya tienen esta rutina asignada.', 'info');
        return;
      }

      const result = await showFormModal({
        title: `Asignar rutina: ${routine.nombre}`,
        icon: '➕',
        submitLabel: 'Asignar',
        fields: [{
          id: 'usuario_id', label: 'Cliente', type: 'select', value: String(assignableUsers[0].id),
          options: assignableUsers.map((u) => ({ value: u.id, label: `${u.nombre} ${u.apellido}` }))
        }]
      });
      if (!result) return;

      apiFetch(`/rutinas/${routine.id}/asignar`, {
        method: 'POST',
        body: JSON.stringify({ usuario_id: Number(result.usuario_id) })
      })
        .then(async () => {
          showMessage(formStatus, 'Rutina asignada correctamente.', 'success');
          await loadData();
        })
        .catch((error) => showMessage(formStatus, error.message));

      return;
    }

    if (unassignButton) {
      const routine = rutinas.find((item) => Number(item.id) === Number(unassignButton.dataset.unassignRoutine));
      if (!routine) return;

      const assignedUsers = getAssignedUsers(routine);
      if (!assignedUsers.length) {
        showMessage(formStatus, 'Esta rutina no tiene clientes asignados.', 'info');
        return;
      }

      const result = await showFormModal({
        title: `Quitar cliente de: ${routine.nombre}`,
        icon: '➖',
        submitLabel: 'Quitar',
        fields: [{
          id: 'usuario_id', label: 'Cliente asignado', type: 'select', value: String(assignedUsers[0].id),
          options: assignedUsers.map((u) => ({ value: u.id, label: `${u.nombre} ${u.apellido}` }))
        }]
      });
      if (!result) return;

      apiFetch(`/rutinas/${routine.id}/desasignar`, {
        method: 'POST',
        body: JSON.stringify({ usuario_id: Number(result.usuario_id) })
      })
        .then(async () => {
          showMessage(formStatus, 'Cliente retirado de la rutina correctamente.', 'success');
          await loadData();
        })
        .catch((error) => showMessage(formStatus, error.message));

      return;
    }

    if (editButton) {
      const routine = rutinas.find((item) => Number(item.id) === Number(editButton.dataset.editRoutine));
      if (!routine) return;

      const result = await showFormModal({
        title: 'Editar rutina',
        icon: '✏️',
        fields: [
          { id: 'nombre', label: 'Nombre de la rutina', type: 'text', value: routine.nombre },
          { id: 'objetivo', label: 'Objetivo', type: 'text', value: routine.objetivo || '', required: false },
          {
            id: 'nivel', label: 'Nivel', type: 'select', value: routine.nivel || 'principiante',
            options: [
              { value: 'principiante', label: 'Principiante' },
              { value: 'intermedio', label: 'Intermedio' },
              { value: 'avanzado', label: 'Avanzado' }
            ]
          },
          { id: 'descripcion', label: 'Descripción', type: 'textarea', value: routine.descripcion || '', required: false, rows: 3 }
        ]
      });
      if (!result) return;

      apiFetch(`/rutinas/${routine.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          nombre: result.nombre,
          objetivo: result.objetivo,
          nivel: result.nivel,
          descripcion: result.descripcion
        })
      })
        .then(async () => {
          showMessage(formStatus, 'Rutina actualizada correctamente.', 'success');
          await loadData();
        })
        .catch((error) => showMessage(formStatus, error.message));

      return;
    }

    if (deleteButton) {
      const routine = rutinas.find((item) => Number(item.id) === Number(deleteButton.dataset.deleteRoutine));
      if (!routine) return;
      const ok = await showConfirmModal({
        title: 'Eliminar rutina',
        message: `¿Eliminar la rutina "${routine.nombre}"? Esta acción no se puede deshacer.`,
        confirmLabel: 'Eliminar',
        danger: true
      });
      if (!ok) return;

      apiFetch(`/rutinas/${routine.id}`, { method: 'DELETE' })
        .then(async () => {
          showMessage(formStatus, 'Rutina eliminada correctamente.', 'success');
          await loadData();
        })
        .catch((error) => showMessage(formStatus, error.message));
    }
  });

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const ejercicioId = formData.get('ejercicio_id');
    const usuarioId = formData.get('usuario_id');

    try {
      const created = await apiFetch('/rutinas', {
        method: 'POST',
        body: JSON.stringify({
          nombre: formData.get('nombre'),
          objetivo: formData.get('objetivo'),
          nivel: formData.get('nivel'),
          descripcion: formData.get('descripcion'),
          ejercicios: ejercicioId ? [{
            ejercicio_id: Number(ejercicioId),
            series: Number(formData.get('series') || 3),
            repeticiones: formData.get('repeticiones') || '10',
            descanso_seg: Number(formData.get('descanso_seg') || 60)
          }] : []
        })
      });

      if (usuarioId) {
        await apiFetch(`/rutinas/${created.id}/asignar`, {
          method: 'POST',
          body: JSON.stringify({ usuario_id: Number(usuarioId) })
        });
      }

      showMessage(formStatus, 'Rutina creada correctamente.', 'success');
      form.reset();
      closeModalById('modalRutina');
      await loadData();
    } catch (error) {
      showMessage(formStatus, error.message);
    }
  });

  try {
    await loadData();
  } catch (error) {
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-triangle-exclamation"></i>
          <p>${escapeHtml(error.message)}</p>
        </div>
      `;
    }
  }
}

async function initMaquinasPage() {
  bindLogoutButtons();
  if (!requireAdmin()) return;

  // ── Comprimir imagen con canvas ────────────────────────────────────────
  function compressImage(file, maxWidth, quality, callback) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(1, maxWidth / img.width);
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        callback(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  // ── Setup file input nueva máquina ────────────────────────────────────
  const imgInput = document.getElementById('maquinaImgInput');
  const imgData  = document.getElementById('maquinaImgData');
  const previewWrap = document.getElementById('maquinaImgPreviewWrap');
  const previewImg  = document.getElementById('maquinaImgPreview');
  const removeBtn   = document.getElementById('maquinaImgRemove');
  const uploadArea  = document.getElementById('imgUploadArea');

  imgInput?.addEventListener('change', () => {
    const file = imgInput.files[0];
    if (!file) return;
    compressImage(file, 800, 0.82, (dataUrl) => {
      previewImg.src = dataUrl;
      imgData.value = dataUrl;
      previewWrap.style.display = '';
      uploadArea.style.display = 'none';
    });
  });
  removeBtn?.addEventListener('click', () => {
    previewImg.src = '';
    imgData.value = '';
    previewWrap.style.display = 'none';
    uploadArea.style.display = '';
    imgInput.value = '';
  });
  // Limpiar al cerrar modal
  document.querySelector('#modalMaquina .modal-close')?.addEventListener('click', () => {
    previewImg.src = '';
    imgData.value = '';
    previewWrap.style.display = 'none';
    uploadArea.style.display = '';
    imgInput && (imgInput.value = '');
  });

  const grid = document.getElementById('maquinasGrid');
  const searchInput = document.getElementById('maquinasSearch');
  const grupoFilter = document.getElementById('maquinasGrupoFilter');
  const estadoFilter = document.getElementById('maquinasEstadoFilter');
  const form = document.getElementById('maquinaForm');
  const formStatus = document.getElementById('maquinaFormStatus');
  let maquinas = [];

  function updateStats(items) {
    const grupos = new Set();
    items.forEach((item) => {
      String(item.grupos_musculares || '')
        .split(',')
        .map((grupo) => grupo.trim())
        .filter(Boolean)
        .forEach((grupo) => grupos.add(grupo));
    });

    document.getElementById('maquinasTotalStat').textContent = items.length;
    document.getElementById('maquinasDisponiblesStat').textContent = items.filter((item) => Number(item.activa) === 1).length;
    document.getElementById('maquinasMantenimientoStat').textContent = items.filter((item) => Number(item.activa) !== 1).length;
    document.getElementById('maquinasGruposStat').textContent = grupos.size;
  }

  function renderCards(items) {
    if (!grid) return;

    if (!items.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-cog"></i>
          <p>No hay máquinas que coincidan con los filtros.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = items.map((maquina) => {
      const imgSection = maquina.imagen_url
        ? `<div class="machine-card-img has-photo" style="background-image:url('${maquina.imagen_url}')"></div>`
        : `<div class="machine-card-img"><i class="fas ${Number(maquina.activa) === 1 ? 'fa-dumbbell' : 'fa-screwdriver-wrench'}"></i></div>`;
      return `
      <div class="machine-card">
        ${imgSection}
        <div class="machine-card-body">
          <h3>${escapeHtml(maquina.nombre)}</h3>
          <div class="machine-meta">
            <span><i class="fas fa-bullseye"></i> Grupo: ${escapeHtml(maquina.grupos_musculares || 'Sin definir')}</span>
            <span><i class="fas fa-list"></i> Ejercicios: ${escapeHtml(maquina.ejercicios || 'Sin ejercicios asociados')}</span>
            <span><i class="fas fa-info-circle"></i> ${escapeHtml(maquina.descripcion || 'Sin descripción')}</span>
          </div>
        </div>
        <div class="machine-card-footer">
          <span class="badge ${Number(maquina.activa) === 1 ? 'badge-green' : 'badge-orange'}">${Number(maquina.activa) === 1 ? 'Disponible' : 'En mantenimiento'}</span>
          <div class="action-btns">
            <span class="badge badge-blue">${escapeHtml(maquina.total_ejercicios)} ejercicios</span>
            <button class="action-btn action-btn-edit" data-edit-machine="${maquina.id}" title="Editar máquina"><i class="fas fa-pen"></i></button>
            <button class="action-btn" data-image-machine="${maquina.id}" title="Cambiar imagen" style="color:var(--text-secondary)"><i class="fas fa-image"></i></button>
            <button class="action-btn action-btn-view" data-toggle-machine="${maquina.id}" title="Cambiar estado"><i class="fas fa-power-off"></i></button>
            <button class="action-btn action-btn-delete" data-delete-machine="${maquina.id}" title="Eliminar máquina"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      </div>
    `;}
    ).join('');
  }

  function applyFilters() {
    const query = (searchInput?.value || '').trim().toLowerCase();
    const grupo = grupoFilter?.value || 'todos';
    const estado = estadoFilter?.value || 'todos';

    const filtered = maquinas.filter((maquina) => {
      const machineGroups = String(maquina.grupos_musculares || '').toLowerCase();
      const matchesQuery = !query
        || String(maquina.nombre || '').toLowerCase().includes(query)
        || String(maquina.descripcion || '').toLowerCase().includes(query)
        || String(maquina.ejercicios || '').toLowerCase().includes(query);
      const matchesGrupo = grupo === 'todos' || machineGroups.includes(grupo.toLowerCase());
      const matchesEstado = estado === 'todos' || (estado === 'disponible' ? Number(maquina.activa) === 1 : Number(maquina.activa) !== 1);
      return matchesQuery && matchesGrupo && matchesEstado;
    });

    renderCards(filtered);
    updateStats(maquinas);
  }

  async function loadData() {
    maquinas = await apiFetch('/maquinas');

    const grupos = Array.from(new Set(
      maquinas.flatMap((maquina) => String(maquina.grupos_musculares || '')
        .split(',')
        .map((grupo) => grupo.trim())
        .filter(Boolean))
    )).sort((a, b) => a.localeCompare(b));

    if (grupoFilter) {
      grupoFilter.innerHTML = ['<option value="todos">Todos los grupos</option>', ...grupos.map((grupo) => `
        <option value="${escapeHtml(grupo)}">${escapeHtml(grupo)}</option>
      `)].join('');
    }

    applyFilters();
  }

  searchInput?.addEventListener('input', applyFilters);
  grupoFilter?.addEventListener('change', applyFilters);
  estadoFilter?.addEventListener('change', applyFilters);

  grid?.addEventListener('click', async (event) => {
    const editButton = event.target.closest('[data-edit-machine]');
    const toggleButton = event.target.closest('[data-toggle-machine]');
    const deleteButton = event.target.closest('[data-delete-machine]');
    const imageButton = event.target.closest('[data-image-machine]');

    if (imageButton) {
      const machine = maquinas.find((item) => Number(item.id) === Number(imageButton.dataset.imageMachine));
      if (!machine) return;

      const overlay = document.getElementById('modalImagenMaquina');
      const titulo = document.getElementById('modalImagenMaquinaTitulo');
      const fileInput = document.getElementById('maquinaImgInputEdit');
      const previewWrap = document.getElementById('maquinaImgPreviewWrapEdit');
      const previewImg = document.getElementById('maquinaImgPreviewEdit');
      const removeBtn = document.getElementById('maquinaImgRemoveEdit');
      const uploadArea = document.getElementById('imgUploadAreaEdit');
      const saveBtn = document.getElementById('btnGuardarImagenMaquina');

      titulo.textContent = `Imagen — ${machine.nombre}`;
      fileInput.value = '';
      previewWrap.style.display = 'none';
      previewImg.src = '';
      uploadArea.style.display = '';
      if (machine.imagen_url) {
        previewImg.src = machine.imagen_url;
        previewWrap.style.display = '';
        uploadArea.style.display = 'none';
      }
      overlay.classList.add('active');

      // Nuevo listener de archivo (limpiamos clonando)
      const newFileInput = fileInput.cloneNode(true);
      fileInput.parentNode.replaceChild(newFileInput, fileInput);
      newFileInput.addEventListener('change', () => {
        const file = newFileInput.files[0];
        if (!file) return;
        compressImage(file, 800, 0.82, (dataUrl) => {
          previewImg.src = dataUrl;
          previewWrap.style.display = '';
          uploadArea.style.display = 'none';
        });
      });

      removeBtn.onclick = () => {
        previewImg.src = '';
        previewWrap.style.display = 'none';
        uploadArea.style.display = '';
        newFileInput.value = '';
      };

      // Botón guardar (limpiamos clonando)
      const newSaveBtn = saveBtn.cloneNode(true);
      saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
      newSaveBtn.addEventListener('click', async () => {
        const imgData = previewImg.src && previewImg.src !== window.location.href ? previewImg.src : null;
        newSaveBtn.disabled = true;
        newSaveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        try {
          await apiFetch(`/maquinas/${machine.id}`, {
            method: 'PUT',
            body: JSON.stringify({ imagen_url: imgData })
          });
          showMessage(formStatus, 'Imagen actualizada correctamente.', 'success');
          overlay.classList.remove('active');
          await loadData();
        } catch (err) {
          showMessage(formStatus, err.message);
        } finally {
          newSaveBtn.disabled = false;
          newSaveBtn.innerHTML = '<i class="fas fa-save"></i> Guardar imagen';
        }
      });

      return;
    }

    if (editButton) {
      const machine = maquinas.find((item) => Number(item.id) === Number(editButton.dataset.editMachine));
      if (!machine) return;

      const result = await showFormModal({
        title: 'Editar máquina',
        icon: '⚙️',
        fields: [
          { id: 'nombre', label: 'Nombre de la máquina', type: 'text', value: machine.nombre },
          { id: 'descripcion', label: 'Descripción', type: 'textarea', value: machine.descripcion || '', required: false, rows: 3 }
        ]
      });
      if (!result) return;

      apiFetch(`/maquinas/${machine.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          nombre: result.nombre,
          descripcion: result.descripcion,
          activa: Number(machine.activa)
        })
      })
        .then(async () => {
          showMessage(formStatus, 'Máquina actualizada correctamente.', 'success');
          await loadData();
        })
        .catch((error) => showMessage(formStatus, error.message));

      return;
    }

    if (toggleButton) {
      const machine = maquinas.find((item) => Number(item.id) === Number(toggleButton.dataset.toggleMachine));
      if (!machine) return;

      apiFetch(`/maquinas/${machine.id}`, {
        method: 'PUT',
        body: JSON.stringify({ activa: Number(machine.activa) === 1 ? 0 : 1 })
      })
        .then(async () => {
          showMessage(formStatus, 'Estado de la máquina actualizado.', 'success');
          await loadData();
        })
        .catch((error) => showMessage(formStatus, error.message));

      return;
    }

    if (deleteButton) {
      const machine = maquinas.find((item) => Number(item.id) === Number(deleteButton.dataset.deleteMachine));
      if (!machine) return;
      const ok = await showConfirmModal({
        title: 'Eliminar máquina',
        message: `¿Eliminar la máquina "${machine.nombre}"? Esta acción no se puede deshacer.`,
        confirmLabel: 'Eliminar',
        danger: true
      });
      if (!ok) return;

      apiFetch(`/maquinas/${machine.id}`, { method: 'DELETE' })
        .then(async () => {
          showMessage(formStatus, 'Máquina eliminada correctamente.', 'success');
          await loadData();
        })
        .catch((error) => showMessage(formStatus, error.message));
    }
  });

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);

    try {
      await apiFetch('/maquinas', {
        method: 'POST',
        body: JSON.stringify({
          nombre: formData.get('nombre'),
          descripcion: formData.get('descripcion'),
          activa: Number(formData.get('activa')),
          imagen_url: formData.get('imagen_url') || null
        })
      });

      showMessage(formStatus, 'Máquina registrada correctamente.', 'success');
      form.reset();
      if (imgData) imgData.value = '';
      if (previewImg) previewImg.src = '';
      if (previewWrap) previewWrap.style.display = 'none';
      if (uploadArea) uploadArea.style.display = '';
      if (imgInput) imgInput.value = '';
      closeModalById('modalMaquina');
      await loadData();
    } catch (error) {
      showMessage(formStatus, error.message);
    }
  });

  try {
    await loadData();
  } catch (error) {
    if (grid) {
      grid.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-triangle-exclamation"></i>
          <p>${escapeHtml(error.message)}</p>
        </div>
      `;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;

  // ── Menú hamburguesa para páginas admin ──────────────────────────────────
  const adminPages = ['index', 'clientes', 'membresias', 'pagos', 'rutinas', 'maquinas'];
  if (adminPages.includes(page)) {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      // Botón hamburguesa
      const hamburger = document.createElement('button');
      hamburger.className = 'navbar-hamburger';
      hamburger.setAttribute('aria-label', 'Menú');
      hamburger.innerHTML = '<span></span><span></span><span></span>';
      navbar.insertBefore(hamburger, navbar.querySelector('.navbar-nav') || navbar.firstChild.nextSibling);

      // Drawer
      const navLinks = [
        { href: 'index.html',      icon: 'fas fa-chart-pie',         label: 'Dashboard' },
        { href: 'clientes.html',   icon: 'fas fa-users',             label: 'Clientes' },
        { href: 'membresias.html', icon: 'fas fa-id-card',           label: 'Membresías' },
        { href: 'pagos.html',      icon: 'fas fa-money-bill-wave',   label: 'Pagos' },
        { href: 'rutinas.html',    icon: 'fas fa-clipboard-list',    label: 'Rutinas' },
        { href: 'maquinas.html',   icon: 'fas fa-cog',               label: 'Máquinas' },
      ];

      const currentFile = window.location.pathname.split('/').pop() || 'index.html';

      const drawer = document.createElement('div');
      drawer.className = 'mobile-nav-drawer';
      drawer.innerHTML = `
        <div class="mobile-nav-overlay"></div>
        <div class="mobile-nav-panel">
          <div class="mobile-nav-brand">
            <i class="fas fa-dumbbell"></i>
            <span>HECTOR<span class="gym">GYM</span></span>
          </div>
          <nav>
            ${navLinks.map(l => `
              <a href="${l.href}" class="${currentFile === l.href ? 'active' : ''}">
                <i class="${l.icon}"></i> ${l.label}
              </a>`).join('')}
          </nav>
          <div class="mobile-nav-user" id="mobileNavUser"></div>
        </div>`;
      document.body.appendChild(drawer);

      // Mostrar usuario en drawer
      const mobileNavUser = drawer.querySelector('#mobileNavUser');
      const user = appState.user;
      if (user && mobileNavUser) {
        mobileNavUser.innerHTML = `<i class="fas fa-user-circle"></i> ${escapeHtml(user.nombre || user.correo)}`;
      }

      // Abrir/cerrar drawer
      const openDrawer = () => drawer.classList.add('open');
      const closeDrawer = () => drawer.classList.remove('open');

      hamburger.addEventListener('click', openDrawer);
      drawer.querySelector('.mobile-nav-overlay').addEventListener('click', closeDrawer);

      // Cerrar con Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDrawer();
      });
    }
  }
  // ── Fin hamburguesa ──────────────────────────────────────────────────────
  if (page === 'login') {
    initLoginPage();
  }
  if (page === 'index') {
    initIndexPage();
  }
  if (page === 'clientes') {
    initClientesPage();
  }
  if (page === 'portal') {
    initPortalPage();
  }
  if (page === 'membresias') {
    initMembresiasPage();
  }
  if (page === 'pagos') {
    initPagosPage();
  }
  if (page === 'rutinas') {
    initRutinasPage();
  }
  if (page === 'maquinas') {
    initMaquinasPage();
  }
});
