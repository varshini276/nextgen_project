/**
 * ============================================================
 *  script.js  –  Eventora Frontend Logic
 *  Connects: dashboard.html | add-event.html | home.html
 *            registration.html | event-details.html
 *            login.html | register.html | admin.html
 *            event.html (events.html) | review-rating.html
 *
 *  Storage  : localStorage  (no backend needed)
 *  Pattern  : Modular init functions, called via DOMContentLoaded
 * ============================================================
 */
'use strict';

const API_BASE = "http://127.0.0.1:8000/api";

/* ─────────────────────────────────────────────
   CONSTANTS / STORAGE KEYS
───────────────────────────────────────────── */
const KEYS = {
  EVENTS        : 'eventra_events',
  SELECTED_EVENT: 'eventra_selected_event',
  REGISTRATIONS : 'eventra_registrations',
  USERS         : 'eventra_users',
  CURRENT_USER  : 'eventra_current_user',
  REVIEWS       : 'eventra_reviews',
  FILTER_STATE  : 'eventra_filter_state',
  DRAFTS        : 'eventra_drafts',
};

/* ─────────────────────────────────────────────
   SEED DATA  – pre-populates localStorage once
───────────────────────────────────────────── */
const SEED_EVENTS = [
  {
    id: 'evt-001', emoji: '🎨', title: 'UI/UX Masterclass 2025',
    category: 'Workshop', date: '2025-08-28', time: '10:00',
    venue: 'Design Hub, Bandra, Mumbai', price: 499, capacity: 60,
    registered: 42, description: 'A full-day deep dive into modern UI/UX principles led by industry experts.',
    organiser: 'DesignCircle India', status: 'Live', popularity: 95,
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80'
  },
  {
    id: 'evt-002', emoji: '🎵', title: 'Indie Sound Fest 2025',
    category: 'Music', date: '2025-09-05', time: '18:00',
    venue: 'Mahalaxmi Racecourse, Mumbai', price: 999, capacity: 200,
    registered: 120, description: 'Three stages, 20+ indie artists, and a night to remember.',
    organiser: 'Rohan Mehta', status: 'Live', popularity: 88,
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80'
  },
  {
    id: 'evt-003', emoji: '💻', title: 'AI & Future Conf 2025',
    category: 'Tech', date: '2025-09-15', time: '09:00',
    venue: 'HICC, Hyderabad', price: 1499, capacity: 500,
    registered: 492, description: 'India\'s biggest AI conference featuring speakers from OpenAI, Google DeepMind, and more.',
    organiser: 'Aanya Kapoor', status: 'Sold Out', popularity: 99,
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80'
  },
  {
    id: 'evt-004', emoji: '🍜', title: 'Street Food Carnival',
    category: 'Food', date: '2025-09-20', time: '12:00',
    venue: 'Cubbon Park, Bengaluru', price: 0, capacity: 800,
    registered: 680, description: 'Taste 100+ street food stalls from across India in one weekend.',
    organiser: 'Vikram Nair', status: 'Live', popularity: 82,
    image: 'https://images.unsplash.com/photo-1565299543923-37dd37887442?w=600&q=80'
  },
  {
    id: 'evt-005', emoji: '🏃', title: 'City Marathon 2025',
    category: 'Sports', date: '2025-10-02', time: '06:00',
    venue: 'Marine Drive, Mumbai', price: 299, capacity: 1500,
    registered: 1200, description: 'Run 5K, 10K, or the full 42K through the heart of the city.',
    organiser: 'Sneha Patel', status: 'Live', popularity: 91,
    image: 'https://images.unsplash.com/photo-1532444458054-01a7dd3e9fca?w=600&q=80'
  },
  {
    id: 'evt-006', emoji: '⚛️', title: 'React Summit India',
    category: 'Tech', date: '2025-10-18', time: '10:00',
    venue: 'NIMHANS Convention Centre, Bengaluru', price: 1999, capacity: 500,
    registered: 340, description: 'Two days of React, Next.js, and full-stack JavaScript sessions.',
    organiser: 'Karan Bose', status: 'Upcoming', popularity: 85,
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80'
  },
];

/* ─────────────────────────────────────────────
   STORAGE HELPERS
───────────────────────────────────────────── */
const storage = {
  get   : (key)        => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  set   : (key, val)   => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
  remove: (key)        => { localStorage.removeItem(key); },
};

/** Load events from localStorage; seed on first visit */
async function getEvents() {
  try {
    const res = await fetch(`${API_BASE}/events/`);
    return await res.json();
  } catch (err) {
    console.error("Error fetching events:", err);
    return [];
  }
}

async function saveEventToBackend(event) {
  try {
    const res = await fetch(`${API_BASE}/events/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(event)
    });

    return await res.json();
  } catch (err) {
    console.error("Error saving event:", err);
  }
}
async function getRegistrations() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/registrations/');
    return await res.json();
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return [];
  }
}

async function saveRegistrations(data) {
  try {
    await fetch('http://127.0.0.1:8000/api/registrations/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.error('Error saving registration:', error);
  }
}
async function getUsers() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/users/');
    return await res.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

async function saveUsers(user) {
  try {
    await fetch('http://127.0.0.1:8000/api/users/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
  } catch (error) {
    console.error('Error saving user:', error);
  }
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('eventra_current_user'));
}
async function getReviews() {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/reviews/');
    return await res.json();
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

async function saveReviews(review) {
  try {
    await fetch('http://127.0.0.1:8000/api/reviews/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review)
    });
  } catch (error) {
    console.error('Error saving review:', error);
  }
}

/* ─────────────────────────────────────────────
   TOAST  (global utility used across pages)
───────────────────────────────────────────── */
/**
 * showToast(icon, title, msg)  OR  showToast(message)  — both signatures work.
 * Looks for #toast, #toastIcon, #toastTitle, #toastMsg in the current page.
 */
function showToast(iconOrMsg, title, msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  // Support single-string signature (review-rating.html style)
  if (title === undefined) {
    toast.textContent = iconOrMsg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3200);
    return;
  }

  const iconEl  = document.getElementById('toastIcon');
  const titleEl = document.getElementById('toastTitle');
  const msgEl   = document.getElementById('toastMsg');

  if (iconEl)  iconEl.textContent  = iconOrMsg;
  if (titleEl) titleEl.textContent = title;
  if (msgEl)   msgEl.textContent   = msg || '';

  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

/* ─────────────────────────────────────────────
   SCROLL-REVEAL  (shared across pages)
───────────────────────────────────────────── */
function initReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.07 });
  reveals.forEach(el => io.observe(el));
}

/* ─────────────────────────────────────────────
   NAVIGATION HELPERS
───────────────────────────────────────────── */
/** Navigate to a page */
function goTo(page) { window.location.href = page; }

/**
 * Store the selected event ID, then navigate to event-details.html
 */
function selectEvent(eventId) {
  storage.set(KEYS.SELECTED_EVENT, eventId);
  goTo('event-details.html');
}

/* ─────────────────────────────────────────────
   USER  AUTH  (login.html / register.html)
───────────────────────────────────────────── */

/** Initialise login.html */
function initLogin() {
  const form = document.querySelector('form[onsubmit]');
  if (!form) return;
  form.onsubmit = null;          // remove inline handler; we use our own
  form.addEventListener('submit', handleLogin);

  // Auto-fill from remembered user
  const user = getCurrentUser();
  if (user) {
    const emailEl = document.getElementById('email');
    if (emailEl) emailEl.value = user.email;
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email    = (document.getElementById('email')?.value || '').trim().toLowerCase();
  const password = (document.getElementById('password')?.value || '').trim();
  const role     = document.getElementById('role')?.value || 'user';
  const msgEl    = document.getElementById('loginMsg') || document.querySelector('.message');

  // Hardcoded admin shortcut
  if (role === 'admin' && email === 'admin@eventora.com' && password === 'admin123') {
    storage.set(KEYS.CURRENT_USER, { name: 'Admin', email, role: 'admin' });
    showFeedback(msgEl, '✅ Logging in as Admin…', true);
    setTimeout(() => goTo('admin.html'), 900);
    return;
  }

  const users = await getUsers();
  const match = users.find(u => u.email === email && u.password === password);
  if (match) {
    storage.set(KEYS.CURRENT_USER, { name: match.name, email: match.email, role: match.role || 'user' });
    showFeedback(msgEl, '✅ Login successful! Redirecting…', true);
    setTimeout(() => goTo(match.role === 'admin' ? 'admin.html' : 'dashboard.html'), 900);
  } else {
    showFeedback(msgEl, '❌ Invalid email or password.', false);
  }
}

/** Toggle password visibility (login.html uses inline onclick="togglePwd()" ) */
function togglePwd() {
  const input = document.getElementById('password');
  const eye   = document.querySelector('.eye');
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
  if (eye) eye.textContent = input.type === 'password' ? '👁' : '🙈';
}

/** Initialise register.html */
function initRegister() {
  // Handle both the inline-onclick form and a plain <form>
  const form = document.getElementById('registerForm') || document.querySelector('form');
  if (!form) return;
  form.addEventListener('submit', handleRegister);
}

async function handleRegister(e) {
  e.preventDefault();
  const name     = (document.getElementById('name')?.value || document.getElementById('regName')?.value || '').trim();
  const email    = (document.getElementById('email')?.value || document.getElementById('regEmail')?.value || '').trim().toLowerCase();
  const password = (document.getElementById('password')?.value || document.getElementById('regPassword')?.value || '').trim();
  const confirm  = (document.getElementById('confirmPassword')?.value || document.getElementById('regConfirm')?.value || '').trim();
  const msgEl    = document.getElementById('registerMsg') || document.querySelector('.message');

  if (!name || !email || !password) {
    showFeedback(msgEl, '❌ Please fill all fields.', false); return;
  }
  if (password !== confirm && confirm !== '') {
    showFeedback(msgEl, '❌ Passwords do not match.', false); return;
  }
  if (password.length < 6) {
    showFeedback(msgEl, '❌ Password must be at least 6 characters.', false); return;
  }

  const users = await getUsers();
  if (users.find(u => u.email === email)) {
    showFeedback(msgEl, '❌ An account with this email already exists.', false); return;
  }

  users.push({ name, email, password, role: 'user', joinedAt: new Date().toISOString() });
  await saveUsers(users);
  storage.set(KEYS.CURRENT_USER, { name, email, role: 'user' });
  showFeedback(msgEl, '✅ Account created! Redirecting…', true);
  setTimeout(() => goTo('dashboard.html'), 1000);
}

/** Show inline feedback message */
function showFeedback(el, msg, success) {
  if (!el) { showToast(success ? '✅' : '❌', msg, ''); return; }
  el.textContent = msg;
  el.className   = 'message ' + (success ? 'success' : 'error');
}

/** Logout helper (used in nav / sidebar) */
function logout() {
  storage.remove(KEYS.CURRENT_USER);
  goTo('login.html');
}

/* ─────────────────────────────────────────────
   ADD-EVENT  (add-event.html)
───────────────────────────────────────────── */
function initAddEvent() {
  // Wire up live preview
  const previewFields = ['eventTitle', 'eventCat', 'eventDate', 'eventTime', 'eventVenue', 'tier1Price'];
  previewFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateAddEventPreview);
  });

  // Remove inline handlers so our module owns them
  const publishBtn = document.querySelector('.btn-submit');
  const draftBtn   = document.querySelector('.btn-draft');
  if (publishBtn) { publishBtn.removeAttribute('onclick'); publishBtn.addEventListener('click', submitEvent); }
  if (draftBtn)   { draftBtn.removeAttribute('onclick');   draftBtn.addEventListener('click', saveDraft); }

  updateAddEventPreview();
}

function updateAddEventPreview() {
  const title  = document.getElementById('eventTitle')?.value || 'Your event title will appear here…';
  const cat    = document.getElementById('eventCat')?.value   || 'Category';
  const date   = document.getElementById('eventDate')?.value;
  const time   = document.getElementById('eventTime')?.value;
  const venue  = document.getElementById('eventVenue')?.value || 'Venue / Location';
  const price  = document.getElementById('tier1Price')?.value;

  const previewTitle = document.getElementById('previewTitle');
  const previewTag   = document.getElementById('previewTag');
  const previewDate  = document.getElementById('previewDate');
  const previewVenue = document.getElementById('previewVenue');
  const previewPrice = document.getElementById('previewPrice');

  if (previewTitle) previewTitle.textContent = title;
  if (previewTag)   previewTag.textContent   = cat;

  if (previewDate) {
    previewDate.textContent = date
      ? '📅 ' + new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + (time ? ', ' + time : '')
      : '📅 Date & Time';
  }
  if (previewVenue) previewVenue.textContent = '📍 ' + venue;
  if (previewPrice) {
    previewPrice.textContent = (price && !isNaN(price))
      ? '₹' + Number(price).toLocaleString('en-IN')
      : 'Free';
  }
}

async function submitEvent() {
  const title = document.getElementById('eventTitle')?.value.trim();
  const date  = document.getElementById('eventDate')?.value;
  const time  = document.getElementById('eventTime')?.value;
  const venue = document.getElementById('eventVenue')?.value.trim();
  const cat   = document.getElementById('eventCat')?.value || 'General';
  const price = parseInt(document.getElementById('tier1Price')?.value) || 0;
  const desc  = document.getElementById('eventDesc')?.value?.trim() || '';

  if (!title || !date || !time || !venue) {
    showToast('⚠️', 'Missing Info', 'Please fill in all required fields (Title, Date, Time, Venue).');
    return;
  }

  const events = getEvents();
  const newEvent = {
    id         : 'evt-' + Date.now(),
    emoji      : selectedEmoji || '🎉',
    title, category: cat, date, time, venue, price,
    capacity   : parseInt(document.getElementById('eventCapacity')?.value) || 100,
    registered : 0,
    description: desc,
    organiser  : getCurrentUser()?.name || 'Organiser',
    status     : 'Upcoming',
    popularity : 50,
    image      : '',
    createdAt  : new Date().toISOString(),
  };

  await saveEventToBackend(newEvent);

  showToast('🎉', 'Event Published!', `"${title}" is now live and visible to everyone.`);
  setTimeout(() => {
    storage.set(KEYS.SELECTED_EVENT, newEvent.id);
    goTo('event-details.html');
  }, 2000);
}

function saveDraft() {
  const title = document.getElementById('eventTitle')?.value.trim();
  if (!title) { showToast('⚠️', 'Nothing to save', 'Add a title before saving a draft.'); return; }

  const drafts = storage.get(KEYS.DRAFTS) || [];
  drafts.push({ title, savedAt: new Date().toISOString() });
  storage.set(KEYS.DRAFTS, drafts);
  showToast('💾', 'Draft Saved', `"${title}" saved. You can publish it later.`);
}

/* ─────────────────────────────────────────────
   EVENT-DETAILS  (event-details.html)
───────────────────────────────────────────── */
async function initEventDetails() {
  const eventId = storage.get(KEYS.SELECTED_EVENT);
  if (!eventId) { goTo('event.html'); return; }

  const events = await getEvents();
  const event   = events.find(e => e.id === eventId);
  if (!event)   { goTo('event.html'); return; }

  // Populate elements that exist in the page
  setTextIfExists('detailTitle',       event.title);
  setTextIfExists('detailCategory',    event.category);
  setTextIfExists('detailDate',        formatDate(event.date) + (event.time ? ', ' + event.time : ''));
  setTextIfExists('detailVenue',       event.venue);
  setTextIfExists('detailPrice',       event.price ? '₹' + event.price.toLocaleString('en-IN') : 'Free');
  setTextIfExists('detailOrganiser',   event.organiser);
  setTextIfExists('detailDescription', event.description || 'No description provided.');
  setTextIfExists('detailCapacity',    event.registered + ' / ' + event.capacity + ' registered');
  setTextIfExists('detailStatus',      event.status);
  setTextIfExists('detailEmoji',       event.emoji);

  const imgEl = document.getElementById('detailImage');
  if (imgEl && event.image) { imgEl.src = event.image; imgEl.style.display = 'block'; }

  // Populate breadcrumb event name
  const bcEvent = document.querySelector('.breadcrumb a[href="event-details.html"]');
  if (bcEvent) bcEvent.textContent = event.title;

  // Wire Register button
  const regBtn = document.getElementById('detailRegisterBtn') || document.querySelector('.btn-register-detail');
  if (regBtn) {
    regBtn.onclick = () => {
      goTo('registration.html');
    };
  }

  // Load reviews for this event
  renderEventReviews(eventId);
}

function renderEventReviews(eventId) {
  const container = document.getElementById('detailReviews');
  if (!container) return;
  const reviews = getReviews().filter(r => r.eventId === eventId);
  if (!reviews.length) { container.innerHTML = '<p style="color:var(--text-light)">No reviews yet. Be the first!</p>'; return; }
  container.innerHTML = reviews.map(r => `
    <div class="review-card" data-stars="${r.stars}">
      <div style="display:flex;align-items:center;gap:.6rem;margin-bottom:.5rem;">
        <div class="p-av pav1" style="width:32px;height:32px;font-size:.75rem;">${(r.name||'U')[0].toUpperCase()}</div>
        <strong>${r.name || 'User'}</strong>
        <span style="color:#f9c784;">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</span>
      </div>
      <p style="font-size:.84rem;color:var(--text-mid);">${r.text}</p>
      <div style="font-size:.7rem;color:var(--text-light);margin-top:.4rem;">${timeAgo(r.createdAt)}</div>
    </div>
  `).join('');
}

/* ─────────────────────────────────────────────
   EVENT LISTING  (event.html / events.html)
───────────────────────────────────────────── */

/**
 * Dynamically injects event cards into #eventsGrid.
 * Also works when the page has static cards — it just appends to them.
 */
async function initEventsPage(){
  await loadDynamicEvents();
  initSearchAndFilter();
  initReveal();
}

async function loadDynamicEvents() {
  const grid = document.getElementById('eventsGrid');
  if (!grid) return;

 const events = await getEvents();
  const dynamicEvents = events.filter(e => e.id.startsWith('evt-1'));   // only user-created ones
  if (!dynamicEvents.length) return;

  dynamicEvents.forEach(ev => {
    if (document.querySelector(`[data-event-id="${ev.id}"]`)) return;   // skip duplicates
    const card = buildEventCard(ev);
    grid.prepend(card);
  });

  updateResultCount();
}

function buildEventCard(ev) {
  const card = document.createElement('div');
  card.className = 'event-card';
  card.dataset.title    = ev.title.toLowerCase();
  card.dataset.category = ev.category;
  card.dataset.location = ev.venue.split(',').pop().trim();
  card.dataset.date     = ev.date;
  card.dataset.price    = ev.price;
  card.dataset.popularity = ev.popularity || 50;
  card.dataset.eventId  = ev.id;

  const seatsLeft  = ev.capacity - ev.registered;
  const pct        = Math.round((ev.registered / ev.capacity) * 100);
  const priceLabel = ev.price ? '₹' + ev.price.toLocaleString('en-IN') : 'Free';

  card.innerHTML = `
    <div class="card-thumb" style="background:linear-gradient(135deg,#fde8f0,#e8eaff);display:flex;align-items:center;justify-content:center;font-size:3rem;min-height:160px;border-radius:16px 16px 0 0;position:relative;">
      ${ev.image ? `<img src="${ev.image}" alt="${ev.title}" style="width:100%;height:160px;object-fit:cover;border-radius:16px 16px 0 0;">` : ev.emoji}
      <div class="card-date-strip">📅 ${formatDate(ev.date)}</div>
      <div class="seats-badge ${seatsLeft < 20 ? 'low' : ''}" style="position:absolute;top:.6rem;right:.6rem;background:rgba(255,255,255,.85);padding:.25rem .65rem;border-radius:50px;font-size:.72rem;font-weight:700;">
        <span class="dot" style="width:6px;height:6px;border-radius:50%;background:${seatsLeft < 20 ? '#e07090' : '#60c090'};display:inline-block;margin-right:.25rem;"></span>
        ${seatsLeft > 0 ? seatsLeft + ' seats left' : 'Sold Out'}
      </div>
    </div>
    <div class="card-body">
      <span class="card-cat" style="font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#a070d0;margin-bottom:.4rem;display:block;">${ev.category}</span>
      <h3>${ev.title}</h3>
      <div class="card-location">📍 ${ev.venue}</div>
      <p class="card-desc">${ev.description || ''}</p>
      <div style="height:4px;border-radius:4px;background:rgba(200,180,220,.2);overflow:hidden;margin-bottom:.8rem;">
        <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#e07090,#a070d0);border-radius:4px;"></div>
      </div>
      <div class="card-footer">
        <div class="card-price">${priceLabel} <span>/ ticket</span></div>
        <button class="btn-register" onclick="selectEvent('${ev.id}')">View Details →</button>
      </div>
    </div>
  `;
  return card;
}

/* ─────────────────────────────────────────────
   SEARCH & FILTER  (events page)
───────────────────────────────────────────── */
function initSearchAndFilter() {
  // Attach to search input if not already attached inline
  const searchEl = document.getElementById('searchInput');
  if (searchEl && !searchEl.dataset.jsAttached) {
    searchEl.dataset.jsAttached = '1';
    searchEl.addEventListener('input', filterEvents);
  }

  const filterEls = ['categoryFilter', 'locationFilter', 'dateFilter', 'sortFilter'];
  filterEls.forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.dataset.jsAttached) {
      el.dataset.jsAttached = '1';
      el.addEventListener('change', filterEvents);
    }
  });

  restoreFilterState();
}

/** Core filter + sort function */
function filterEvents() {
  const grid = document.getElementById('eventsGrid');
  if (!grid) return;

  const q    = (document.getElementById('searchInput')?.value    || '').toLowerCase();
  const cat  = (document.getElementById('categoryFilter')?.value || '').toLowerCase();
  const loc  = (document.getElementById('locationFilter')?.value || '').toLowerCase();
  const dt   = (document.getElementById('dateFilter')?.value     || '');
  const sort = (document.getElementById('sortFilter')?.value     || 'popular');

  const cards = [...grid.querySelectorAll('.event-card')];
  let visible = cards.filter(c => {
    const titleMatch = !q   || c.dataset.title?.toLowerCase().includes(q);
    const catMatch   = !cat || c.dataset.category?.toLowerCase() === cat;
    const locMatch   = !loc || c.dataset.location?.toLowerCase().includes(loc);
    const dtMatch    = !dt  || c.dataset.date === dt;
    const show       = titleMatch && catMatch && locMatch && dtMatch;
    c.style.display  = show ? '' : 'none';
    return show;
  });

  // Sort
  if (sort === 'price') {
    visible.sort((a, b) => parseInt(a.dataset.price || 0) - parseInt(b.dataset.price || 0));
  } else if (sort === 'newest') {
    visible.sort((a, b) => (b.dataset.date || '').localeCompare(a.dataset.date || ''));
  } else {
    visible.sort((a, b) => parseInt(b.dataset.popularity || 0) - parseInt(a.dataset.popularity || 0));
  }
  visible.forEach(c => grid.appendChild(c));

  updateResultCount(visible.length);
  saveFilterState();
  toggleNoResults(grid, visible.length);
}

function resetFilters() {
  ['searchInput', 'categoryFilter', 'locationFilter', 'dateFilter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const sortEl = document.getElementById('sortFilter');
  if (sortEl) sortEl.value = 'popular';
  storage.remove(KEYS.FILTER_STATE);
  filterEvents();
}

function updateResultCount(count) {
  const el = document.getElementById('resultCount');
  if (!el) return;
  if (count === undefined) {
    const visible = document.querySelectorAll('.event-card:not([style*="display: none"])');
    count = visible.length;
  }
  el.textContent = count;
}

function toggleNoResults(grid, count) {
  let noRes = document.getElementById('noResults');
  if (count === 0) {
    if (!noRes) {
      noRes = document.createElement('div');
      noRes.id = 'noResults'; noRes.className = 'no-results';
      noRes.innerHTML = '<div class="no-icon">🌸</div><p>No events match your filters — try adjusting them!</p>';
      grid.appendChild(noRes);
    }
  } else if (noRes) noRes.remove();
}

function saveFilterState() {
  const state = {
    search  : document.getElementById('searchInput')?.value    || '',
    category: document.getElementById('categoryFilter')?.value || '',
    location: document.getElementById('locationFilter')?.value || '',
    date    : document.getElementById('dateFilter')?.value     || '',
    sort    : document.getElementById('sortFilter')?.value     || 'popular',
    scrollY : window.scrollY,
  };
  storage.set(KEYS.FILTER_STATE, state);
}

function restoreFilterState() {
  const state = storage.get(KEYS.FILTER_STATE);
  if (!state) return;
  const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  setVal('searchInput',    state.search);
  setVal('categoryFilter', state.category);
  setVal('locationFilter', state.location);
  setVal('dateFilter',     state.date);
  setVal('sortFilter',     state.sort || 'popular');
  filterEvents();
  if (state.scrollY) requestAnimationFrame(() => window.scrollTo({ top: state.scrollY, behavior: 'instant' }));
}

/* ─────────────────────────────────────────────
   REGISTRATION  (registration.html)
───────────────────────────────────────────── */
let regState = {
  step          : 1,
  ticketPrice   : 499,
  ticketName    : 'General Admission',
  qty           : 1,
  addonTotal    : 0,
};

function initRegistration() {
  const eventId = storage.get(KEYS.SELECTED_EVENT);
  if (eventId) {
    const event = getEvents().find(e => e.id === eventId);
    if (event) populateRegSummary(event);
  }

  recalcOrder();
}

function populateRegSummary(event) {
  setTextIfExists('esSummaryTitle',    event.title);
  setTextIfExists('esSummaryDate',     '📅 ' + formatDate(event.date) + (event.time ? ', ' + event.time : ''));
  setTextIfExists('esSummaryVenue',    '📍 ' + event.venue);
  setTextIfExists('esSummaryCategory', event.category);
}

/* Multi-step form */
function nextStep() {
  if (regState.step === 1 && !validateStep1()) return;
  if (regState.step === 2 && !validateStep2()) return;

  const card = document.getElementById('cardStep' + regState.step);
  if (card) card.style.display = 'none';

  regState.step++;
  const nextCard = document.getElementById('cardStep' + regState.step);
  if (nextCard) nextCard.style.display = '';

  // Show submit button on step 3
  const submitWrap = document.getElementById('submitWrap');
  if (submitWrap) submitWrap.style.display = regState.step === 3 ? '' : 'none';

  updateStepUI();
}

function prevStep() {
  if (regState.step <= 1) return;
  const card = document.getElementById('cardStep' + regState.step);
  if (card) card.style.display = 'none';
  regState.step--;
  const prevCard = document.getElementById('cardStep' + regState.step);
  if (prevCard) prevCard.style.display = '';
  updateStepUI();
}

function goToStep(n) {
  if (n > regState.step) return;   // can't skip forward
  const currentCard = document.getElementById('cardStep' + regState.step);
  if (currentCard) currentCard.style.display = 'none';
  regState.step = n;
  const targetCard = document.getElementById('cardStep' + n);
  if (targetCard) targetCard.style.display = '';
  updateStepUI();
}

function updateStepUI() {
  document.querySelectorAll('.rp-step').forEach((el, idx) => {
    el.classList.remove('active', 'completed');
    if (idx + 1 === regState.step) el.classList.add('active');
    if (idx + 1 < regState.step)   el.classList.add('completed');
  });
  document.querySelectorAll('.rp-line').forEach((el, idx) => {
    el.style.background = idx < regState.step - 1 ? 'linear-gradient(90deg,#e07090,#a070d0)' : '';
  });
}

function validateStep1() {
  const firstName = document.getElementById('firstName')?.value.trim();
  const email     = document.getElementById('emailInput')?.value.trim();
  const phone     = document.getElementById('phoneInput')?.value.trim();

  if (!firstName) { showToast('⚠️', 'Required', 'Please enter your first name.'); return false; }
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) { showToast('⚠️', 'Invalid Email', 'Please enter a valid email address.'); return false; }
  if (!phone) { showToast('⚠️', 'Required', 'Please enter your phone number.'); return false; }
  return true;
}

function validateStep2() {
  if (!regState.ticketName) { showToast('⚠️', 'No ticket selected', 'Please choose a ticket type.'); return false; }
  return true;
}

function selectTicket(el, price, name) {
  document.querySelectorAll('.ticket-opt').forEach(t => t.classList.remove('selected'));
  el.classList.add('selected');
  regState.ticketPrice = price;
  regState.ticketName  = name;
  recalcOrder();
}

function changeQty(delta) {
  regState.qty = Math.max(1, Math.min(10, regState.qty + delta));
  const qtyEl = document.getElementById('qtyNum');
  if (qtyEl) qtyEl.textContent = regState.qty;
  recalcOrder();
}

function toggleAddon(el, price) {
  el.classList.toggle('selected');
  const addons = document.querySelectorAll('.addon-card.selected');
  regState.addonTotal = [...addons].reduce((sum, a) => {
    const priceEl = a.querySelector('.addon-price');
    return sum + parseInt(priceEl?.textContent.replace(/\D/g, '') || 0);
  }, 0);
  recalcOrder();
}

function recalcOrder() {
  const subtotal    = regState.ticketPrice * regState.qty;
  const platformFee = 25;
  const gst         = Math.round((subtotal + regState.addonTotal) * 0.18);
  const grand       = subtotal + regState.addonTotal + platformFee + gst;

  setTextIfExists('ticketLabel',    `${regState.ticketName} × ${regState.qty}`);
  setTextIfExists('ticketSubtotal', '₹' + subtotal.toLocaleString('en-IN'));
  setTextIfExists('gstAmt',         '₹' + gst.toLocaleString('en-IN'));
  setTextIfExists('grandTotal',     '₹' + grand.toLocaleString('en-IN'));

  const addonRow = document.getElementById('addonRow');
  if (addonRow) {
    addonRow.style.display = regState.addonTotal > 0 ? '' : 'none';
    setTextIfExists('addonTotal', '₹' + regState.addonTotal.toLocaleString('en-IN'));
  }
}

function selectPay(el) {
  document.querySelectorAll('.pay-opt').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
}

function formatCard(input) {
  let val = input.value.replace(/\D/g, '').substring(0, 16);
  input.value = val.match(/.{1,4}/g)?.join('  ') || '';
}

function formatExpiry(input) {
  let val = input.value.replace(/\D/g, '').substring(0, 4);
  if (val.length >= 3) val = val.substring(0, 2) + ' / ' + val.substring(2);
  input.value = val;
}

function toggleCheck(el) {
  const cb = el.querySelector('.custom-check');
  if (cb) cb.classList.toggle('checked');
}

function submitRegistration() {
  const firstName = document.getElementById('firstName')?.value.trim() || 'Guest';
  const email     = document.getElementById('emailInput')?.value.trim() || '';
  const eventId   = storage.get(KEYS.SELECTED_EVENT) || 'unknown';
  const events    = getEvents();
  const event     = events.find(e => e.id === eventId);

  // Increment registered count
  if (event) {
    event.registered = Math.min(event.registered + regState.qty, event.capacity);
    if (event.registered >= event.capacity) event.status = 'Sold Out';
    saveEvents(events);
  }

  // Save registration record
  const registrations = getRegistrations();
  registrations.push({
    id        : 'reg-' + Date.now(),
    eventId,
    eventTitle: event?.title || 'Unknown Event',
    name      : firstName,
    email,
    ticket    : regState.ticketName,
    qty       : regState.qty,
    total     : document.getElementById('grandTotal')?.textContent || '₹0',
    registeredAt: new Date().toISOString(),
  });
  saveRegistrations(registrations);

  // Advance to confirmation step
  const card3 = document.getElementById('cardStep3');
  if (card3) card3.style.display = 'none';
  regState.step = 4;
  updateStepUI();

  const confirmCard = document.getElementById('cardStep4');
  if (confirmCard) {
    confirmCard.style.display = '';
    setTextIfExists('confirmName',   firstName);
    setTextIfExists('confirmEvent',  event?.title || 'Event');
    setTextIfExists('confirmTicket', regState.ticketName + ' × ' + regState.qty);
    setTextIfExists('confirmTotal',  document.getElementById('grandTotal')?.textContent || '₹0');
  }

  showToast('🎉', 'Registration Complete!', `You're registered for "${event?.title}"!`);
}

/* ─────────────────────────────────────────────
   DASHBOARD  (dashboard.html)
───────────────────────────────────────────── */
function initDashboard() {
  const events        = getEvents();
  const registrations = getRegistrations();
  const user          = getCurrentUser();

  // Update greeting
  const greetingEl = document.querySelector('.nav-greeting span') || document.querySelector('.nav-greeting');
  if (greetingEl) greetingEl.textContent = user ? user.name : 'Organiser';

  // Stat cards
  const totalEvents  = events.length;
  const totalRegs    = registrations.length;
  const totalRevenue = registrations.reduce((sum, r) => {
    const num = parseInt((r.total || '0').replace(/\D/g, ''));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  updateStatCard('statTotalEvents',       totalEvents);
  updateStatCard('statTotalParticipants', totalRegs * 2 + 1248); // includes seed data
  updateStatCard('statRevenue',           '₹' + (totalRevenue + 284900).toLocaleString('en-IN'));
  updateStatCard('statUpcoming',          events.filter(e => e.status === 'Upcoming').length);

  // Update sidebar user
  setTextIfExists('sidebarUserName', user?.name || 'Organiser');
  const suAv = document.querySelector('.su-av');
  if (suAv && user?.name) suAv.textContent = user.name[0].toUpperCase();

  // Recent events table
  loadDashboardEventTable(events.slice(0, 8));

  // Top events panel
  loadTopEvents(events);

  // Bar chart animation
  animateBars();

  // Animate stat counters
  animateCounters();

  initReveal();
}

function updateStatCard(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;

  // Also try data-target attribute approach for existing elements
  const allStats = document.querySelectorAll('.stat-num');
  allStats.forEach(s => {
    if (s.dataset.target) return;  // leave animated ones alone
  });
}

function loadDashboardEventTable(events) {
  const tbody = document.querySelector('#eventsTable tbody') || document.querySelector('.table-wrap table tbody');
  if (!tbody) return;

  const userEvents = events.filter(e => e.id.startsWith('evt-1'));
  if (!userEvents.length) return;

  userEvents.forEach(ev => {
    const pct = Math.round((ev.registered / ev.capacity) * 100);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><strong>${ev.emoji} ${ev.title}</strong></td>
      <td>${formatDate(ev.date)}</td>
      <td>${ev.registered}/${ev.capacity}</td>
      <td>
        <span class="tbl-badge ${statusBadgeClass(ev.status)}">${ev.status}</span>
      </td>
      <td>${ev.price ? '₹' + ev.price.toLocaleString('en-IN') : 'Free'}</td>
      <td>
        <button class="btn btn-ghost" style="padding:.3rem .8rem;font-size:.78rem;" onclick="selectEvent('${ev.id}')">View</button>
        <button class="btn" style="padding:.3rem .8rem;font-size:.78rem;background:linear-gradient(135deg,#fde8f0,#ede8ff);color:#e07090;" onclick="deleteEvent('${ev.id}')">Delete</button>
      </td>
    `;
    tbody.prepend(row);
  });
}

function loadTopEvents(events) {
  const container = document.getElementById('topEventsList');
  if (!container) return;
  const top = [...events].sort((a, b) => b.registered - a.registered).slice(0, 5);
  container.innerHTML = top.map((ev, i) => `
    <div class="top-event-item" onclick="selectEvent('${ev.id}')" style="cursor:pointer;">
      <div class="te-rank">${i + 1}</div>
      <div class="te-info">
        <div class="te-name">${ev.title}</div>
        <div class="te-cat">${ev.category}</div>
      </div>
      <div class="te-reg">${ev.registered} reg.</div>
    </div>
  `).join('');
}

function animateCounters() {
  document.querySelectorAll('.stat-num[data-target]').forEach(el => {
    const target  = parseFloat(el.dataset.target);
    const prefix  = el.dataset.prefix || '';
    const isFloat = target % 1 !== 0;
    let current   = 0;
    const step    = target / 60;
    const timer   = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.round(current).toLocaleString('en-IN'));
    }, 16);
  });
}

function animateBars() {
  document.querySelectorAll('.bar').forEach(bar => {
    const val = parseInt(bar.dataset.val || bar.style.height) || 0;
    bar.style.height = '0';
    setTimeout(() => { bar.style.height = Math.min(val, 140) + 'px'; }, 100);
  });
}

/* ─────────────────────────────────────────────
   ADMIN  (admin.html)
───────────────────────────────────────────── */
function initAdmin() {
  const user = getCurrentUser();
  if (user?.role !== 'admin') {
    // If not admin, still let page work (HTML-only mode)
    // goTo('login.html'); return;
  }

  animateCounters();
  initReveal();
  updateAdminStats();
}

function updateAdminStats() {
  const events = getEvents();
  const users  = getUsers();
  const regs   = getRegistrations();

  // Override stat-num data-targets with real data where possible
  const totalUsersEl = document.querySelector('[data-target="1247"]');
  const totalEventsEl = document.querySelector('[data-target="24"]');
  const totalRegsEl  = document.querySelector('[data-target="3194"]');

  // Only override if we have real data
  if (totalEventsEl && events.length > 6) totalEventsEl.dataset.target = events.length;
  if (totalRegsEl   && regs.length   > 0) totalRegsEl.dataset.target   = regs.length + 3194;
  if (totalUsersEl  && users.length  > 0) totalUsersEl.dataset.target  = users.length + 1247;
}

/** Show admin tab (called from sidebar links) */
function showTab(tabName) {
  document.querySelectorAll('[id^="tab-"]').forEach(t => t.style.display = 'none');
  const tab = document.getElementById('tab-' + tabName);
  if (tab) tab.style.display = '';

  // Update active link in sidebar
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  const activeLink = document.querySelector(`.sidebar-nav a[onclick*="${tabName}"]`);
  if (activeLink) activeLink.classList.add('active');

  // Update nav title
  const titles = {
    dashboard: 'Dashboard', events: 'Event Management', users: 'User Management',
    registrations: 'Registrations', revenue: 'Revenue', reviews: 'Reviews',
    reports: 'Reports', settings: 'Settings', logs: 'Audit Logs',
  };
  setTextIfExists('navTitle', titles[tabName] || tabName);
}

/** Admin: filter table rows */
function filterTable(query, tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;
  const rows = [...table.querySelectorAll('tbody tr')];
  const q    = query.toLowerCase();
  rows.forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

/** Admin: sort table by column */
function sortTable(tableId, colIdx) {
  const table = document.getElementById(tableId);
  if (!table) return;
  const tbody = table.querySelector('tbody');
  const rows  = [...tbody.querySelectorAll('tr')];
  const asc   = table.dataset.sortAsc === String(colIdx);
  table.dataset.sortAsc = asc ? '' : String(colIdx);
  rows.sort((a, b) => {
    const ta = a.cells[colIdx]?.textContent.trim() || '';
    const tb = b.cells[colIdx]?.textContent.trim() || '';
    return asc ? tb.localeCompare(ta, undefined, { numeric: true }) : ta.localeCompare(tb, undefined, { numeric: true });
  });
  rows.forEach(r => tbody.appendChild(r));
}

/** Admin: select all checkboxes */
function selectAll(masterCb, tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;
  table.querySelectorAll('tbody input[type="checkbox"]').forEach(cb => cb.checked = masterCb.checked);
}

/** Admin: approve pending item */
function approveItem(type) {
  showToast('✅', 'Approved', `The ${type} has been approved and is now live.`);
}

/** Admin: confirm delete with toast */
function confirmDelete(label) {
  if (confirm(`Are you sure you want to delete ${label}? This cannot be undone.`)) {
    showToast('🗑', 'Deleted', `${label} has been permanently removed.`);
  }
}

/** Admin: export data as JSON download */
function exportData() {
  const data = {
    events        : getEvents(),
    registrations : getRegistrations(),
    users         : getUsers().map(u => ({ ...u, password: '***' })),
    exportedAt    : new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url; a.download = 'eventora-data.json'; a.click();
  URL.revokeObjectURL(url);
  showToast('⬇️', 'Export Complete', 'eventora-data.json has been downloaded.');
}

/** Admin: open modal (generic) */
function openModal(modalId) {
  const overlay = document.getElementById(modalId) || document.querySelector('.modal-overlay');
  if (overlay) { overlay.classList.add('show'); document.body.style.overflow = 'hidden'; }
}

function closeModal(modalId) {
  const overlay = modalId ? document.getElementById(modalId) : document.querySelector('.modal-overlay.show');
  if (overlay) { overlay.classList.remove('show'); document.body.style.overflow = ''; }
}

/* ─────────────────────────────────────────────
   REVIEW & RATING  (review-rating.html)
───────────────────────────────────────────── */
function initReviews() {
  initReveal();
  loadPublicReviews();
}

function loadPublicReviews() {
  const container = document.getElementById('reviewsContainer');
  if (!container) return;

  const reviews = getReviews();
  if (!reviews.length) return;

  const cards = reviews.map(r => `
    <div class="review-card" data-stars="${r.stars}" style="
      background:rgba(255,255,255,.55);backdrop-filter:blur(16px);
      border:1.5px solid rgba(255,255,255,.75);border-radius:20px;
      padding:1.4rem;box-shadow:0 8px 40px rgba(180,120,140,.18);
      margin-bottom:1rem;
    ">
      <div style="display:flex;align-items:center;gap:.6rem;margin-bottom:.6rem;">
        <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#f4a7b9,#c9b8f0);
             display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:.8rem;">
          ${(r.name||'U')[0].toUpperCase()}
        </div>
        <div>
          <div style="font-weight:700;font-size:.88rem;">${r.name || 'Anonymous'}</div>
          <div style="font-size:.7rem;color:#b8a8c0;">${r.eventTitle || 'Event'} · ${timeAgo(r.createdAt)}</div>
        </div>
        <div style="margin-left:auto;color:#f9c784;font-size:1rem;">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</div>
      </div>
      <p style="font-size:.84rem;color:#7a6080;line-height:1.65;">${r.text}</p>
    </div>
  `).join('');

  container.insertAdjacentHTML('afterbegin', cards);
}

/** Submit a new review */
function submitReview() {
  const starsEl   = document.querySelectorAll('.star-pick.selected');
  const stars     = starsEl.length;
  const text      = document.getElementById('reviewText')?.value.trim() || '';
  const user      = getCurrentUser();
  const eventId   = storage.get(KEYS.SELECTED_EVENT) || 'general';
  const events    = getEvents();
  const event     = events.find(e => e.id === eventId);

  if (!stars)       { showToast('⚠️ Please select a star rating first!');       return; }
  if (text.length < 20) { showToast('⚠️ Please write at least 20 characters.'); return; }

  const reviews = getReviews();
  reviews.unshift({
    id         : 'rev-' + Date.now(),
    eventId,
    eventTitle : event?.title || 'Event',
    name       : user?.name || 'Anonymous',
    stars,
    text,
    createdAt  : new Date().toISOString(),
  });
  saveReviews(reviews);

  showToast('✅ Review submitted! It will appear after moderation.');

  // Reset form
  document.querySelectorAll('.star-pick').forEach(s => s.classList.remove('selected', 'hovered'));
  const ratingLabel = document.getElementById('ratingLabel');
  if (ratingLabel) { ratingLabel.textContent = 'Click a star to rate'; ratingLabel.style.color = ''; }
  const reviewText = document.getElementById('reviewText');
  if (reviewText) reviewText.value = '';
  const charCount = document.getElementById('charCount');
  if (charCount) charCount.textContent = '0';
  document.querySelectorAll('.tag-chip').forEach(c => c.classList.remove('selected'));
}

/* ─────────────────────────────────────────────
   HOME PAGE  (home.html)
───────────────────────────────────────────── */
function initHome() {
  initReveal();
  loadFeaturedEvents();
  updateNavUser();
}

function loadFeaturedEvents() {
  const container = document.getElementById('featuredEvents') || document.getElementById('homeEventsList');
  if (!container) return;

  const events = getEvents().slice(0, 4);
  const html   = events.map(ev => `
    <div class="event-card" onclick="selectEvent('${ev.id}')" style="cursor:pointer;">
      <div style="background:linear-gradient(135deg,#fde8f0,#e8eaff);border-radius:16px 16px 0 0;
           display:flex;align-items:center;justify-content:center;font-size:2.5rem;min-height:140px;">
        ${ev.image ? `<img src="${ev.image}" alt="${ev.title}" style="width:100%;height:140px;object-fit:cover;border-radius:16px 16px 0 0;">` : ev.emoji}
      </div>
      <div style="padding:1rem 1.2rem;">
        <div style="font-size:.7rem;font-weight:700;text-transform:uppercase;color:#a070d0;">${ev.category}</div>
        <h3 style="font-size:.95rem;font-weight:700;margin:.3rem 0;">${ev.title}</h3>
        <div style="font-size:.78rem;color:#b8a8c0;">📅 ${formatDate(ev.date)} · ${ev.venue.split(',')[0]}</div>
        <div style="margin-top:.8rem;display:flex;justify-content:space-between;align-items:center;">
          <strong style="color:#e07090;">${ev.price ? '₹' + ev.price.toLocaleString('en-IN') : 'Free'}</strong>
          <button style="background:linear-gradient(135deg,#e07090,#a070d0);color:#fff;border:none;
                  padding:.4rem 1rem;border-radius:50px;font-size:.78rem;font-weight:700;cursor:pointer;">
            Register →
          </button>
        </div>
      </div>
    </div>
  `).join('');

  container.innerHTML = html;
}

function updateNavUser() {
  const user = getCurrentUser();
  if (!user) return;
  const loginLink = document.querySelector('a[href="login.html"], a[href="register.html"]');
  if (loginLink) {
    loginLink.textContent = '👤 ' + user.name;
    loginLink.href = 'dashboard.html';
  }
}

/* ─────────────────────────────────────────────
   EVENT CARD – REGISTER MODAL  (event.html)
───────────────────────────────────────────── */
function openEventModal(name, date, location, price) {
  const overlay = document.getElementById('modalOverlay');
  if (!overlay) return;

  setTextIfExists('modalEventName', name);
  setTextIfExists('modalDate',      date);
  setTextIfExists('modalLocation',  location);
  setTextIfExists('modalPrice',     price);
  setTextIfExists('modalTitle',     'Confirm Registration');
  setTextIfExists('modalIcon',      '🎟');

  const confirmBtn = document.querySelector('.btn-confirm');
  if (confirmBtn) confirmBtn.style.display = '';
  const closeBtn = document.querySelector('.btn-close-modal');
  if (closeBtn) closeBtn.textContent = 'Cancel';

  const pEl = overlay.querySelector('.modal p, #modal p');
  if (pEl) pEl.textContent = 'You\'re about to register for this event. Please confirm your spot.';

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeEventModal() {
  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function confirmEventRegistration() {
  setTextIfExists('modalTitle', 'You\'re Registered! 🎉');
  setTextIfExists('modalIcon',  '✅');

  const confirmBtn = document.querySelector('.btn-confirm');
  if (confirmBtn) confirmBtn.style.display = 'none';
  const closeBtn = document.querySelector('.btn-close-modal');
  if (closeBtn) closeBtn.textContent = 'Close';

  const pEl = document.querySelector('#modalOverlay .modal p, #modal p');
  if (pEl) pEl.textContent = 'Your spot is confirmed. A confirmation email is on its way!';

  const eventName = document.getElementById('modalEventName')?.textContent || 'Event';
  setTimeout(() => { closeEventModal(); showToast('🎉', 'Registered!', `Spot confirmed for "${eventName}"`); }, 1800);
}

/* ─────────────────────────────────────────────
   EDIT / DELETE EVENTS  (dashboard + admin)
───────────────────────────────────────────── */

/**
 * Delete an event by ID. Removes from localStorage and refreshes the table row.
 */
function deleteEvent(eventId) {
  if (!confirm('Delete this event? This cannot be undone.')) return;
  const events  = getEvents().filter(e => e.id !== eventId);
  saveEvents(events);
  showToast('🗑', 'Event Deleted', 'The event has been removed.');

  // Remove row from DOM if visible
  const row = document.querySelector(`[onclick*="${eventId}"]`)?.closest('tr');
  if (row) row.remove();
}

/**
 * Populate the edit modal and wire the save button.
 * The edit modal uses IDs: editEventModal, editTitle, editDate, editVenue, editPrice, editCapacity
 */
function editEvent(eventId) {
  const events = getEvents();
  const ev     = events.find(e => e.id === eventId);
  if (!ev) return;

  const setField = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  setField('editTitle',    ev.title);
  setField('editDate',     ev.date);
  setField('editVenue',    ev.venue);
  setField('editPrice',    ev.price);
  setField('editCapacity', ev.capacity);
  setField('editCategory', ev.category);
  setField('editDesc',     ev.description);

  const modal   = document.getElementById('editEventModal');
  const saveBtn = document.getElementById('editSaveBtn');
  if (saveBtn) {
    saveBtn.onclick = () => {
      ev.title       = document.getElementById('editTitle')?.value.trim()    || ev.title;
      ev.date        = document.getElementById('editDate')?.value             || ev.date;
      ev.venue       = document.getElementById('editVenue')?.value.trim()    || ev.venue;
      ev.price       = parseInt(document.getElementById('editPrice')?.value) || ev.price;
      ev.capacity    = parseInt(document.getElementById('editCapacity')?.value) || ev.capacity;
      ev.category    = document.getElementById('editCategory')?.value         || ev.category;
      ev.description = document.getElementById('editDesc')?.value.trim()     || ev.description;
      saveEvents(events);
      closeModal('editEventModal');
      showToast('✅', 'Event Updated', `"${ev.title}" has been saved.`);
    };
  }

  if (modal) { modal.classList.add('show'); document.body.style.overflow = 'hidden'; }
}

/* ─────────────────────────────────────────────
   UTILS
───────────────────────────────────────────── */
function setTextIfExists(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)   return 'Just now';
  if (diff < 3600) return Math.floor(diff / 60) + ' min ago';
  if (diff < 86400)return Math.floor(diff / 3600) + ' hr ago';
  return Math.floor(diff / 86400) + ' days ago';
}

function statusBadgeClass(status) {
  const map = { 'Live': 'tb-green', 'Upcoming': 'tb-blue', 'Sold Out': 'tb-orange', 'Pending Review': 'tb-red', 'Draft': 'tb-purple' };
  return map[status] || 'tb-blue';
}

/* ─────────────────────────────────────────────
   GLOBAL KEYBOARD / OVERLAY  EVENTS
───────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeEventModal();
    closeModal();
  }
});

/* Click outside modal to close */
document.addEventListener('click', e => {
  if (e.target?.id === 'modalOverlay') closeEventModal();
  if (e.target?.classList.contains('modal-overlay') && !e.target.closest('.modal')) closeModal();
});

/* ─────────────────────────────────────────────
   PAGE ROUTER  –  runs the right init function
   based on the current HTML file name
───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const page = window.location.pathname.split('/').pop() || 'home.html';

  // Shared across all pages
  initReveal();
  updateNavUser();

  // Page-specific initialisation
  if (page === 'dashboard.html')      initDashboard();
  else if (page === 'add-event.html') initAddEvent();
  else if (page === 'home.html' || page === '' || page === 'index.html') initHome();
  else if (page === 'registration.html') initRegistration();
  else if (page === 'event-details.html') initEventDetails();
  else if (page === 'login.html')     initLogin();
  else if (page === 'register.html')  initRegister();
  else if (page === 'admin.html')     initAdmin();
  else if (page === 'event.html' || page === 'events.html') initEventsPage();
  else if (page === 'review-rating.html') initReviews();
});

/* ─────────────────────────────────────────────
   EXPOSE GLOBALS  (for inline onclick= in HTML)
───────────────────────────────────────────── */
Object.assign(window, {
  // Navigation
  goTo, selectEvent, logout,

  // Auth
  togglePwd,

  // Add-event
  updateAddEventPreview, submitEvent, saveDraft,

  // Events page
  filterEvents, resetFilters,

  // Event modal (events.html)
  openModal: openEventModal, closeModal: closeEventModal,
  confirmRegistration: confirmEventRegistration,
  showToast,

  // Registration
  nextStep, prevStep, goToStep,
  selectTicket, changeQty, toggleAddon,
  selectPay, formatCard, formatExpiry, toggleCheck,
  submitRegistration,

  // Dashboard / admin
  deleteEvent, editEvent,
  showTab, filterTable, sortTable, selectAll,
  approveItem, confirmDelete, exportData,

  // Reviews
  submitReview,

  // Validation helpers used inline
  validateName : (el) => { if (el.value.trim().length < 2) el.style.borderColor = '#e07090'; else el.style.borderColor = ''; },
  validateEmail: (el) => { const ok = /^\S+@\S+\.\S+$/.test(el.value); el.style.borderColor = ok ? '#60c090' : '#e07090'; },
  validatePhone: (el) => { const ok = /^[\d\s+\-()]{7,}$/.test(el.value); el.style.borderColor = ok ? '#60c090' : '#e07090'; },

  // Existing HTML inline calls compatibility
  openModal, closeEventModal,
});