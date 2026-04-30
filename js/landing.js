/* ============================================================
   HECTORGYM — Landing Page JS
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initSplash();
  initParticles();
  try { AOS.init({ duration: 700, once: true, offset: 80 }); } catch(_) {}
  initNavbar();
  initSmoothScroll();
  initCounters();
  initGallery();
  initHamburger();
  initParallax();
  initAuthState();
});

/* ── Splash Screen ─────────────────────────────────────── */
function initSplash() {
  const splash = document.getElementById('splash');
  if (!splash) return;

  document.body.style.overflow = 'hidden';

  // Partículas en canvas del splash
  const canvas = document.getElementById('splashCanvas');
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    const dots = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      vy: -(Math.random() * 0.6 + 0.2),
      o: Math.random() * 0.5 + 0.1,
      red: Math.random() > 0.6
    }));
    (function drawSplash() {
      if (!splash.parentNode) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(d => {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = d.red
          ? `rgba(229,57,53,${d.o})`
          : `rgba(255,255,255,${d.o * 0.4})`;
        ctx.fill();
        d.y += d.vy;
        if (d.y < -4) { d.y = canvas.height + 4; d.x = Math.random() * canvas.width; }
      });
      requestAnimationFrame(drawSplash);
    })();
  }

  setTimeout(() => {
    splash.classList.add('fade-out');
    document.body.style.overflow = '';
    setTimeout(() => splash.remove(), 700);
  }, 2200);
}

/* ── Partículas hero canvas ────────────────────────────── */
function initParticles() {
  const canvas = document.getElementById('heroParticles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const count = Math.min(Math.floor(window.innerWidth / 18), 80);
  const particles = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.8 + 0.4,
    vx: (Math.random() - 0.5) * 0.3,
    vy: -(Math.random() * 0.4 + 0.1),
    o: Math.random() * 0.5 + 0.1,
    red: Math.random() > 0.65
  }));

  (function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.red
        ? `rgba(229,57,53,${p.o})`
        : `rgba(255,255,255,${p.o * 0.35})`;
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -4) { p.y = canvas.height + 4; p.x = Math.random() * canvas.width; }
      if (p.x < -4)  p.x = canvas.width  + 4;
      if (p.x > canvas.width + 4) p.x = -4;
    });
    requestAnimationFrame(draw);
  })();
}

/* ── Navbar scroll effect ──────────────────────────────── */
function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  const update = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ── Smooth scroll ─────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
      // Cerrar menú móvil si está abierto
      document.getElementById('navLinks')?.classList.remove('open');
    });
  });
}

/* ── Stats counter ─────────────────────────────────────── */
function initCounters() {
  const nums = document.querySelectorAll('.hg-stat-num[data-count]');
  if (!nums.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = 1400;
      const fps = 60;
      const steps = Math.ceil(duration / (1000 / fps));
      let step = 0;
      const timer = setInterval(() => {
        step++;
        el.textContent = Math.round(target * easeOut(step / steps));
        if (step >= steps) {
          el.textContent = target;
          clearInterval(timer);
        }
      }, 1000 / fps);
      observer.unobserve(el);
    });
  }, { threshold: 0.6 });

  nums.forEach(n => observer.observe(n));
}
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

/* ── Gallery lightbox ──────────────────────────────────── */
function initGallery() {
  const items = document.querySelectorAll('.hg-gallery-item');
  if (!items.length) return;

  const lb = document.createElement('div');
  lb.className = 'hg-lightbox';
  lb.innerHTML = '<span class="hg-lightbox-close">&times;</span><img src="" alt="">';
  document.body.appendChild(lb);

  const lbImg = lb.querySelector('img');
  const close = () => { lb.classList.remove('active'); document.body.style.overflow = ''; };

  items.forEach(item => {
    item.addEventListener('click', () => {
      const src = item.querySelector('img')?.src;
      if (!src) return;
      lbImg.src = src;
      lb.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  lb.querySelector('.hg-lightbox-close').addEventListener('click', close);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
}

/* ── Hamburger ─────────────────────────────────────────── */
function initHamburger() {
  const btn   = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;
  btn.addEventListener('click', () => links.classList.toggle('open'));
}

/* ── Parallax hero bg ──────────────────────────────────── */
function initParallax() {
  const bg = document.querySelector('.hg-hero-bg');
  if (!bg) return;
  window.addEventListener('scroll', () => {
    const offset = window.scrollY;
    if (offset < window.innerHeight) {
      bg.style.transform = `scale(1.05) translateY(${offset * 0.25}px)`;
    }
  }, { passive: true });
}

/* ── Auth state en navbar ──────────────────────────────── */
function initAuthState() {
  try {
    const user = localStorage.getItem('hectorgym_user');
    const loginBtn  = document.getElementById('navLoginBtn');
    const logoutBtn = document.getElementById('navLogoutBtn');
    const loginBtnMobile = document.getElementById('navLoginBtnMobile');
    if (user) {
      if (loginBtn)  loginBtn.style.display  = 'none';
      if (loginBtnMobile) loginBtnMobile.style.display = 'none';
      if (logoutBtn) {
        logoutBtn.style.display = 'inline-flex';
        logoutBtn.addEventListener('click', e => {
          e.preventDefault();
          localStorage.removeItem('hectorgym_token');
          localStorage.removeItem('hectorgym_user');
          window.location.reload();
        });
      }
    }
  } catch (_) {}
}
