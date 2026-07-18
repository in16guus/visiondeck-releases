const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const nav = document.querySelector('[data-nav]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 14);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const closeMenu = () => {
  menuToggle?.setAttribute('aria-expanded', 'false');
  nav?.classList.remove('open');
  document.body.classList.remove('menu-open');
  const label = menuToggle?.querySelector('.sr-only');
  if (label) label.textContent = 'Open navigation';
};

menuToggle?.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  nav?.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  const label = menuToggle.querySelector('.sr-only');
  if (label) label.textContent = open ? 'Close navigation' : 'Open navigation';
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

const environmentImage = document.querySelector('[data-environment-image]');
const environmentStatus = document.querySelector('[data-environment-status]');
const environmentOptions = [...document.querySelectorAll('[data-environment]')];

environmentOptions.forEach((button) => {
  const preload = new Image();
  preload.src = button.dataset.environment;

  button.addEventListener('click', () => {
    if (!environmentImage || button.classList.contains('is-active')) return;

    environmentOptions.forEach((item) => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
    });

    environmentImage.classList.add('is-switching');
    const nextImage = new Image();
    nextImage.onload = () => {
      environmentImage.src = button.dataset.environment;
      environmentImage.alt = button.dataset.environmentAlt;
      environmentImage.classList.remove('is-switching');
    };
    nextImage.src = button.dataset.environment;

    if (environmentStatus) environmentStatus.textContent = button.dataset.environmentCaption;
  });
});

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -7% 0px', threshold: 0.08 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const heroMedia = document.querySelector('[data-hero-media]');
const precisePointer = window.matchMedia('(pointer: fine)');
if (heroMedia && precisePointer.matches && !reducedMotion.matches) {
  window.addEventListener('pointermove', (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 6;
    const y = (event.clientY / window.innerHeight - 0.5) * 5;
    heroMedia.style.setProperty('--hero-x', `${x}px`);
    heroMedia.style.setProperty('--hero-y', `${y}px`);
  }, { passive: true });
}
