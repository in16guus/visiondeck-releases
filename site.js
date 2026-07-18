document.documentElement.classList.add('js');

const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 14);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const setMenuOpen = (open) => {
  menuToggle?.setAttribute('aria-expanded', String(open));
  nav?.classList.toggle('open', open);
  header?.classList.toggle('menu-active', open);
  document.body.classList.toggle('menu-open', open);

  const label = menuToggle?.querySelector('.sr-only');
  if (label) label.textContent = open ? 'Close navigation' : 'Open navigation';
};

menuToggle?.addEventListener('click', () => {
  setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenuOpen(false)));

window.addEventListener('resize', () => {
  if (window.innerWidth > 1180) setMenuOpen(false);
});

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
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') {
    setMenuOpen(false);
    menuToggle.focus();
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
