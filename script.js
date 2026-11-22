const menuButton = document.querySelector('.menu-button');
const navLinks = document.querySelector('.nav-links');

menuButton?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

const sections = [...document.querySelectorAll('main section[id]')];
const navItems = [...document.querySelectorAll('.nav-links a')];
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navItems.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    }
  });
}, { rootMargin: '-35% 0px -55%', threshold: 0 });
sections.forEach(section => sectionObserver.observe(section));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.filter;
    document.querySelectorAll('.movie-row').forEach(row => {
      row.classList.toggle('hidden', filter !== 'all' && row.dataset.category !== filter);
    });
  });
});

document.querySelectorAll('[data-project-filter]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-project-filter]').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.projectFilter;
    document.querySelectorAll('.project-card').forEach(card => {
      card.classList.toggle('hidden', filter !== 'all' && card.dataset.projectCategory !== filter);
    });
  });
});

document.querySelectorAll('.project-open').forEach(button => {
  button.addEventListener('click', () => {
    const card = button.closest('.project-card');
    card.animate([
      { transform: 'translateY(0)' },
      { transform: 'translateY(-8px)' },
      { transform: 'translateY(0)' }
    ], { duration: 420, easing: 'ease-out' });
  });
});

const form = document.querySelector('#contact-form');
form?.addEventListener('submit', event => {
  event.preventDefault();
  const status = form.querySelector('.form-status');
  status.textContent = 'Thank you — your note is ready to send.';
  form.reset();
});

document.querySelector('#year').textContent = new Date().getFullYear();
