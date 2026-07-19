document.documentElement.classList.add('js');

const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');
const main = document.querySelector('main');
const footer = document.querySelector('.site-footer');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileNavigation = window.matchMedia('(max-width: 1180px)');
const demoVideo = document.querySelector('[data-demo-video]');
const demoToggle = document.querySelector('[data-demo-toggle]');
let demoVisible = false;
let demoPausedByUser = false;

const updateDemoToggle = () => {
  if (!demoToggle) return;
  demoToggle.textContent = demoPausedByUser ? 'Play' : 'Pause';
  demoToggle.setAttribute('aria-label', demoPausedByUser ? 'Play product demo' : 'Pause product demo');
  demoToggle.setAttribute('aria-pressed', String(demoPausedByUser));
};

const syncDemoPlayback = () => {
  if (!demoVideo) return;
  if (reducedMotion.matches || demoPausedByUser || document.hidden || !demoVisible || document.body.classList.contains('tour-open')) {
    demoVideo.pause();
    if (reducedMotion.matches) demoVideo.currentTime = 0;
    return;
  }
  demoVideo.muted = true;
  demoVideo.play().catch(() => {});
};

if (demoVideo && 'IntersectionObserver' in window) {
  const demoObserver = new IntersectionObserver((entries) => {
    demoVisible = entries.some((entry) => entry.isIntersecting);
    syncDemoPlayback();
  }, { rootMargin: '100px 0px', threshold: 0.18 });
  demoObserver.observe(demoVideo);
} else if (demoVideo) {
  demoVisible = true;
  syncDemoPlayback();
}

document.addEventListener('visibilitychange', syncDemoPlayback);
reducedMotion.addEventListener?.('change', syncDemoPlayback);
demoToggle?.addEventListener('click', () => {
  demoPausedByUser = !demoPausedByUser;
  updateDemoToggle();
  syncDemoPlayback();
});
updateDemoToggle();

const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 14);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const setMenuOpen = (open, { focusFirst = false, restoreFocus = false } = {}) => {
  const mobile = mobileNavigation.matches;
  const shouldOpen = mobile && open;

  menuToggle?.setAttribute('aria-expanded', String(shouldOpen));
  nav?.classList.toggle('open', shouldOpen);
  header?.classList.toggle('menu-active', shouldOpen);
  document.body.classList.toggle('menu-open', shouldOpen);

  nav?.toggleAttribute('inert', mobile && !shouldOpen);
  if (mobile) nav?.setAttribute('aria-hidden', String(!shouldOpen));
  else nav?.removeAttribute('aria-hidden');
  main?.toggleAttribute('inert', shouldOpen);
  footer?.toggleAttribute('inert', shouldOpen);

  const label = menuToggle?.querySelector('.sr-only');
  if (label) label.textContent = shouldOpen ? 'Close navigation' : 'Open navigation';

  if (shouldOpen && focusFirst) {
    window.requestAnimationFrame(() => nav?.querySelector('a')?.focus());
  } else if (!shouldOpen && restoreFocus) {
    menuToggle?.focus();
  }
};

menuToggle?.addEventListener('click', () => {
  const opening = menuToggle.getAttribute('aria-expanded') !== 'true';
  setMenuOpen(opening, { focusFirst: opening, restoreFocus: !opening });
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenuOpen(false)));

window.addEventListener('resize', () => {
  setMenuOpen(menuToggle?.getAttribute('aria-expanded') === 'true');
});

setMenuOpen(false);

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -7% 0px', threshold: 0.08 });

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const tourDialog = document.querySelector('[data-tour-dialog]');
const tourOpeners = [...document.querySelectorAll('[data-tour-open]')];
const tourClose = document.querySelector('[data-tour-close]');
const tourPrevious = document.querySelector('[data-tour-prev]');
const tourNext = document.querySelector('[data-tour-next]');
const tourProgress = document.querySelector('[data-tour-progress]');
const tourSlides = [...document.querySelectorAll('[data-tour-slide]')];
let tourIndex = 0;
let tourOpener = null;

const renderTour = () => {
  tourSlides.forEach((slide, index) => {
    const active = index === tourIndex;
    slide.hidden = !active;
    slide.classList.toggle('is-active', active);
  });

  if (tourProgress) tourProgress.textContent = `${tourIndex + 1} / ${tourSlides.length}`;
};

const showTour = (opener) => {
  if (!tourDialog || typeof tourDialog.showModal !== 'function') return;
  tourOpener = opener;
  tourIndex = 0;
  renderTour();
  tourDialog.showModal();
  document.body.classList.add('tour-open');
  syncDemoPlayback();
};

const closeTour = () => {
  if (tourDialog?.open) tourDialog.close();
};

tourOpeners.forEach((opener) => opener.addEventListener('click', () => showTour(opener)));
tourClose?.addEventListener('click', closeTour);

tourPrevious?.addEventListener('click', () => {
  tourIndex = (tourIndex - 1 + tourSlides.length) % tourSlides.length;
  renderTour();
});

tourNext?.addEventListener('click', () => {
  tourIndex = (tourIndex + 1) % tourSlides.length;
  renderTour();
});

tourDialog?.addEventListener('click', (event) => {
  if (event.target === tourDialog) closeTour();
});

tourDialog?.addEventListener('close', () => {
  document.body.classList.remove('tour-open');
  tourOpener?.focus();
  tourOpener = null;
  syncDemoPlayback();
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') {
    setMenuOpen(false, { restoreFocus: true });
    return;
  }

  if (!tourDialog?.open) return;
  if (event.key === 'ArrowLeft') {
    tourIndex = (tourIndex - 1 + tourSlides.length) % tourSlides.length;
    renderTour();
  }
  if (event.key === 'ArrowRight') {
    tourIndex = (tourIndex + 1) % tourSlides.length;
    renderTour();
  }
});

renderTour();
