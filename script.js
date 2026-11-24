import { isSupabaseConfigured, supabase } from './supabase-client.js';

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
  submitContactForm(form);
});

document.querySelector('#year').textContent = new Date().getFullYear();

async function submitContactForm(form) {
  const status = form.querySelector('.form-status');
  const submitButton = form.querySelector('button[type="submit"]');

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const values = new FormData(form);
  const message = {
    name: String(values.get('name') || '').trim(),
    email: String(values.get('email') || '').trim(),
    project_type: String(values.get('project') || '').trim(),
    message: String(values.get('message') || '').trim()
  };

  if (!message.name || !message.email || !message.project_type || !message.message) {
    status.textContent = 'Please complete every field before sending.';
    return;
  }

  if (!isSupabaseConfigured || !supabase) {
    status.textContent = 'The contact form is not connected yet. Please email hello@houriapinkdiary.com.';
    return;
  }

  submitButton.disabled = true;
  submitButton.setAttribute('aria-busy', 'true');
  status.textContent = 'Sending your note...';

  try {
    const { error } = await supabase.from('messages').insert(message);

    if (error) throw error;

    form.reset();
    status.textContent = 'Thank you — your note has been sent.';
  } catch (error) {
    console.error('Contact form submission failed:', error);
    status.textContent = 'Your note could not be sent. Please try again or email hello@houriapinkdiary.com.';
  } finally {
    submitButton.disabled = false;
    submitButton.removeAttribute('aria-busy');
  }
}
