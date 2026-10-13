/* ============================================================
   PORTFOLIO — main.js
   Vanilla JS: scroll reveal, navbar, cursor glow,
   project filter, skill bars, form validation
   ============================================================ */

'use strict';

/* ── Utility: debounce ─────────────────────────────────────── */
function debounce(fn, delay) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

/* ──────────────────────────────────────────────────────────────
   1. CURSOR GLOW
   ────────────────────────────────────────────────────────────── */
(function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow || window.matchMedia('(pointer: coarse)').matches) {
    if (glow) glow.style.display = 'none';
    return;
  }

  let cx = window.innerWidth / 2;
  let cy = window.innerHeight / 2;
  let raf;

  document.addEventListener('mousemove', (e) => {
    cx = e.clientX;
    cy = e.clientY;
  });

  function animate() {
    glow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    raf = requestAnimationFrame(animate);
  }
  animate();
})();

/* ──────────────────────────────────────────────────────────────
   2. NAVBAR — scroll + mobile hamburger
   ────────────────────────────────────────────────────────────── */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  // Scrolled state
  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger toggle
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      navLinks.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target)) {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  // Active link highlight on scroll
  const sections = document.querySelectorAll('section[id]');
  const links    = navLinks ? navLinks.querySelectorAll('a') : [];

  const highlightActive = debounce(() => {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    links.forEach(link => {
      link.classList.toggle(
        'active',
        link.getAttribute('href') === `#${current}`
      );
    });
  }, 50);

  window.addEventListener('scroll', highlightActive, { passive: true });
})();

/* ──────────────────────────────────────────────────────────────
   3. SCROLL REVEAL
   ────────────────────────────────────────────────────────────── */
(function initReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger siblings within the same parent
          const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal:not(.visible)'));
          const delay    = siblings.indexOf(entry.target) * 80;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, Math.min(delay, 400));
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  targets.forEach(el => observer.observe(el));
})();

/* ──────────────────────────────────────────────────────────────
   4. SKILL BARS — animate when in view
   ────────────────────────────────────────────────────────────── */
(function initSkillBars() {
  const fills = document.querySelectorAll('.skill-fill');
  if (!fills.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const fill  = entry.target;
          const width = fill.dataset.width || '0';
          fill.style.width = `${width}%`;
          observer.unobserve(fill);
        }
      });
    },
    { threshold: 0.3 }
  );

  fills.forEach(fill => observer.observe(fill));
})();

/* ──────────────────────────────────────────────────────────────
   5. PROJECT FILTER
   ────────────────────────────────────────────────────────────── */
(function initFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');
  if (!btns.length || !cards.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update button state
      btns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Show / hide cards with a tiny animation
      cards.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        if (match) {
          card.classList.remove('hidden');
          card.style.animation = 'none';
          card.offsetHeight;       // reflow
          card.style.animation = 'fadeUp .4s cubic-bezier(.4,0,.2,1) forwards';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
})();

/* ──────────────────────────────────────────────────────────────
   6. CONTACT FORM — validation + simulated submit
   ────────────────────────────────────────────────────────────── */
(function initContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  const rules = {
    name:    { required: true, minLength: 2,  label: 'Full name' },
    email:   { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, label: 'Email' },
    subject: { required: true, minLength: 3,  label: 'Subject' },
    message: { required: true, minLength: 10, label: 'Message' },
  };

  function getError(field, value) {
    const rule = rules[field];
    if (!rule) return '';
    if (rule.required && !value.trim()) return `${rule.label} is required.`;
    if (rule.minLength && value.trim().length < rule.minLength)
      return `${rule.label} must be at least ${rule.minLength} characters.`;
    if (rule.pattern && !rule.pattern.test(value.trim()))
      return 'Please enter a valid email address.';
    return '';
  }

  function showError(input, msg) {
    input.classList.toggle('error', !!msg);
    const errEl = input.parentElement.querySelector('.form-error');
    if (errEl) errEl.textContent = msg;
  }

  // Live validation
  Object.keys(rules).forEach(name => {
    const input = form.elements[name];
    if (!input) return;
    input.addEventListener('blur', () => showError(input, getError(name, input.value)));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) showError(input, getError(name, input.value));
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    Object.keys(rules).forEach(name => {
      const input = form.elements[name];
      if (!input) return;
      const msg = getError(name, input.value);
      showError(input, msg);
      if (msg) valid = false;
    });

    if (!valid) return;

    // Simulate async submit
    const submitBtn = form.querySelector('.btn-submit');
    const btnText   = submitBtn.querySelector('.btn-text');
    submitBtn.disabled = true;
    btnText.textContent = 'Sending…';

    setTimeout(() => {
      form.reset();
      submitBtn.disabled = false;
      btnText.textContent = 'Send Message';
      if (success) {
        success.classList.add('visible');
        setTimeout(() => success.classList.remove('visible'), 5000);
      }
    }, 1500);
  });
})();

/* ──────────────────────────────────────────────────────────────
   7. HERO — typewriter for sub-text (subtle effect)
   ────────────────────────────────────────────────────────────── */
(function initHeroTypewriter() {
  const roles = [
    'Full Stack Developer & UI Engineer',
    'JavaScript Enthusiast',
    'Open Source Contributor',
    'Performance-obsessed Builder',
  ];
  const el = document.querySelector('.hero-sub');
  if (!el) return;

  const line2 = 'based in New York. I turn ideas into polished, high-performance products.';
  let roleIdx = 0;
  let charIdx = 0;
  let deleting = false;
  let pauseTimer;

  function tick() {
    const role    = roles[roleIdx];
    const current = deleting ? role.slice(0, charIdx--) : role.slice(0, charIdx++);
    el.innerHTML  = `${current}<br/>${line2}`;

    if (!deleting && charIdx > role.length) {
      deleting = true;
      pauseTimer = setTimeout(tick, 2200);
      return;
    }
    if (deleting && charIdx < 0) {
      deleting  = false;
      charIdx   = 0;
      roleIdx   = (roleIdx + 1) % roles.length;
      pauseTimer = setTimeout(tick, 400);
      return;
    }

    setTimeout(tick, deleting ? 40 : 70);
  }

  // Only start after hero is visible
  const heroObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { tick(); heroObserver.disconnect(); }
  }, { threshold: 0.5 });
  const hero = document.getElementById('hero');
  if (hero) heroObserver.observe(hero);
})();

/* ──────────────────────────────────────────────────────────────
   8. INJECT FILTER ANIMATION keyframe at runtime
   ────────────────────────────────────────────────────────────── */
(function injectKeyframes() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
})();

/* ──────────────────────────────────────────────────────────────
   9. SMOOTH SCROLL for anchor fallback (older browsers)
   ────────────────────────────────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ──────────────────────────────────────────────────────────────
   10. HERO UNDERLINE ANIMATION — re-trigger on every page load
       and whenever the hero scrolls back into view
   ────────────────────────────────────────────────────────────── */
(function initUnderlineAnim() {
  const paths = document.querySelectorAll('.uline-path, .uline-arrow');
  if (!paths.length) return;

  function resetAndPlay() {
    paths.forEach(p => {
      // Force reflow to restart CSS animation
      p.style.animation = 'none';
      p.getBoundingClientRect(); // trigger reflow
      p.style.animation = '';
    });
  }

  // Fire once on load (after a short delay so reveal has run)
  setTimeout(resetAndPlay, 400);

  // Re-fire whenever hero comes back into view (e.g. back-to-top)
  const hero = document.getElementById('hero');
  if (!hero) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) resetAndPlay();
      });
    },
    { threshold: 0.3 }
  );
  observer.observe(hero);
})();
