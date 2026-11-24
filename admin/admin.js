import { isSupabaseConfigured, supabase } from '../supabase-client.js';

const loginView = document.querySelector('#login-view');
const dashboardView = document.querySelector('#dashboard-view');
const loginForm = document.querySelector('#login-form');
const loginStatus = document.querySelector('#login-status');
const inboxStatus = document.querySelector('#inbox-status');
const messageList = document.querySelector('#message-list');
const loginButton = loginForm.querySelector('button[type="submit"]');
const forgotView = document.querySelector('#forgot-view');
const resetView = document.querySelector('#reset-view');
const forgotForm = document.querySelector('#forgot-form');
const resetForm = document.querySelector('#reset-form');
const forgotStatus = document.querySelector('#forgot-status');
const resetStatus = document.querySelector('#reset-status');

function showLogin(message = '') {
  loginView.hidden = false;
  forgotView.hidden = true;
  resetView.hidden = true;
  dashboardView.hidden = true;
  loginStatus.textContent = message;
}

function showForgotPassword() {
  loginView.hidden = true;
  forgotView.hidden = false;
  resetView.hidden = true;
  dashboardView.hidden = true;
  forgotStatus.textContent = '';
}

function showResetPassword() {
  loginView.hidden = true;
  forgotView.hidden = true;
  resetView.hidden = false;
  dashboardView.hidden = true;
  resetStatus.textContent = '';
}

function showDashboard(user) {
  loginView.hidden = true;
  dashboardView.hidden = false;
  document.querySelector('#owner-email').textContent = user.email || 'Signed in';
  loadMessages();
}

function addText(parent, tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  parent.append(element);
  return element;
}

function renderMessages(messages) {
  messageList.replaceChildren();

  if (messages.length === 0) {
    addText(messageList, 'p', 'empty-state', 'No messages yet. New contact form submissions will appear here.');
    return;
  }

  for (const message of messages) {
    const card = document.createElement('article');
    card.className = 'message-card';

    const top = document.createElement('div');
    top.className = 'message-top';
    const sender = document.createElement('div');
    addText(sender, 'h2', '', message.name);
    addText(sender, 'a', 'message-email', message.email).href = `mailto:${encodeURIComponent(message.email)}`;
    top.append(sender);

    const date = new Date(message.created_at);
    addText(top, 'time', 'message-date', Number.isNaN(date.getTime())
      ? 'Date unavailable'
      : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date));
    card.append(top);
    addText(card, 'span', 'message-type', message.project_type);
    addText(card, 'p', 'message-body', message.message);
    messageList.append(card);
  }
}

async function loadMessages() {
  if (!supabase) return;

  const refreshButton = document.querySelector('#refresh-button');
  refreshButton.disabled = true;
  inboxStatus.textContent = 'Loading messages...';

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('id, name, email, project_type, message, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    renderMessages(data || []);
    inboxStatus.textContent = '';
  } catch (error) {
    console.error('Could not load messages:', error);
    messageList.replaceChildren();
    inboxStatus.textContent = 'Messages could not be loaded. Confirm that this signed-in account is the owner and that the owner read policy is configured.';
  } finally {
    refreshButton.disabled = false;
  }
}

loginForm.addEventListener('submit', async event => {
  event.preventDefault();

  if (!loginForm.reportValidity() || !supabase) return;

  const values = new FormData(loginForm);
  loginButton.disabled = true;
  loginStatus.textContent = 'Signing in...';

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: String(values.get('email')).trim(),
      password: String(values.get('password'))
    });

    if (error) throw error;
    loginForm.reset();
  } catch (error) {
    console.error('Owner sign-in failed:', error);
    loginStatus.textContent = 'Sign-in failed. Check your email and password, then try again.';
  } finally {
    loginButton.disabled = false;
  }
});

document.querySelector('#forgot-password-button').addEventListener('click', showForgotPassword);
document.querySelector('#forgot-back-button').addEventListener('click', () => showLogin());

document.querySelector('#refresh-button').addEventListener('click', loadMessages);
forgotForm.addEventListener('submit', async event => {
  event.preventDefault();

  if (!forgotForm.reportValidity() || !supabase) return;

  const email = String(new FormData(forgotForm).get('email') || '').trim();
  const submitButton = forgotForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  forgotStatus.textContent = 'Sending recovery email...';

  try {
    const redirectTo = `${location.origin}${location.pathname}`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) throw error;

    forgotStatus.textContent = 'If this email is registered, a recovery link has been sent. Please check your inbox.';
  } catch (error) {
    console.error('Password recovery request failed:', error);
    forgotStatus.textContent = 'The recovery email could not be sent. Please try again later.';
  } finally {
    submitButton.disabled = false;
  }
});

resetForm.addEventListener('submit', async event => {
  event.preventDefault();

  if (!resetForm.reportValidity() || !supabase) return;

  const values = new FormData(resetForm);
  const password = String(values.get('password') || '');
  const confirmPassword = String(values.get('confirmPassword') || '');

  if (password !== confirmPassword) {
    resetStatus.textContent = 'The passwords do not match.';
    return;
  }

  if (password.length < 8) {
    resetStatus.textContent = 'The new password must be at least 8 characters.';
    return;
  }

  const submitButton = resetForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  resetStatus.textContent = 'Updating password...';

  try {
    const { error } = await supabase.auth.updateUser({ password });

    if (error) throw error;

    resetForm.reset();
    await supabase.auth.signOut();
    showLogin('Your password has been changed. Please sign in.');
  } catch (error) {
    console.error('Password update failed:', error);
    resetStatus.textContent = 'Your password could not be changed. The recovery link may have expired.';
  } finally {
    submitButton.disabled = false;
  }
});

document.querySelector('#logout-button').addEventListener('click', async () => {
  const button = document.querySelector('#logout-button');
  button.disabled = true;
  const { error } = await supabase.auth.signOut();
  button.disabled = false;
  if (error) inboxStatus.textContent = 'You could not be logged out. Please try again.';
});

async function initializeAdmin() {
  if (!isSupabaseConfigured || !supabase) {
    loginButton.disabled = true;
    showLogin('The Supabase connection is not configured yet. Add the project URL and publishable key to supabase-client.js.');
    return;
  }

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') {
      showResetPassword();
    } else if (event === 'SIGNED_OUT' || !session) {
      showLogin();
    } else if (event === 'SIGNED_IN') {
      showDashboard(session.user);
    }
  });

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    showLogin('Could not check your sign-in session. Please try again.');
  } else if (data.session) {
    const recoveryLink = location.hash.includes('type=recovery') || location.search.includes('type=recovery');
    if (recoveryLink) showResetPassword();
    else showDashboard(data.session.user);
  } else {
    showLogin();
  }
}

initializeAdmin();
