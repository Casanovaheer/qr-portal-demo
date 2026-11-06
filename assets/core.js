/* Shared helpers for the portal, the staff dashboard and the presenter page. */
(function () {
  const PREFIX = 'qrp_';

  const Store = {
    get(k, d) { try { const v = localStorage.getItem(PREFIX + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(PREFIX + k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    push(k, item, max) {
      const a = Store.get(k, []); a.unshift(item);
      if (max && a.length > max) a.length = max;
      return Store.set(k, a);
    },
    clear() { try { Object.keys(localStorage).filter(k => k.startsWith(PREFIX)).forEach(k => localStorage.removeItem(k)); } catch (e) {} }
  };

  /* Seed the sample history once so portal and dashboard share one data set. */
  function seed() {
    if (Store.get('seeded', false)) return;
    const now = Date.now(), H = 3600e3, S = APP.seed;
    const fb = S.feedback.map(f => Object.assign({}, f, { t: now - f.ago * H, seed: true, lang: 'ar' }));
    const qs = S.questions.map(q => Object.assign({}, q, { t: now - q.ago * H, seed: true, consentPub: true }));
    const consents = []
      .concat(fb.map(f => ({ id: 'C-' + f.id.slice(3), kind: f.type, ref: f.id, version: '1.0', t: f.t, lang: 'ar', contact: !f.anon })))
      .concat(qs.map(q => ({ id: 'C-' + q.id.slice(2), kind: 'question', ref: q.id, version: '1.0', t: q.t, lang: q.lang, contact: !!q.notify })))
      .sort((a, b) => b.t - a.t);
    Store.set('feedback', Store.get('feedback', []).concat(fb));
    Store.set('questions', Store.get('questions', []).concat(qs));
    Store.set('consents', Store.get('consents', []).concat(consents));
    Store.set('seeded', true);
  }

  let lang = Store.get('lang', APP.defaultLang || 'ar');

  function L(o) { if (o == null) return ''; if (typeof o === 'string') return o; return o[lang] != null ? o[lang] : (o.en || ''); }
  function t(key, vars) {
    let s = (APP.i18n[lang] && APP.i18n[lang][key]);
    if (s == null) s = APP.i18n.en[key];
    if (s == null) s = key;
    if (vars) Object.keys(vars).forEach(k => { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  function applyLang() {
    const h = document.documentElement;
    h.lang = lang; h.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
    document.querySelectorAll('[data-brand]').forEach(el => { el.textContent = L(APP.brand[el.dataset.brand]); });
    document.title = (document.body.dataset.titleKey ? t(document.body.dataset.titleKey) + ' · ' : '') + L(APP.brand.name);
    document.dispatchEvent(new CustomEvent('langchange'));
  }
  function setLang(l) { lang = l; Store.set('lang', l); applyLang(); }
  function getLang() { return lang; }

  function applyBrand() {
    const c = APP.brand.colors, r = document.documentElement.style;
    r.setProperty('--primary', c.primary); r.setProperty('--primary-dark', c.primaryDark);
    r.setProperty('--accent', c.accent); r.setProperty('--tint', c.tint);
  }

  /* Lucide-style line icons */
  const ICONS = {
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    droplet: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
    smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01M15 9h.01"/>',
    venus: '<circle cx="12" cy="9" r="6"/><path d="M12 15v7M9 19h6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    bone: '<path d="M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-7 7c-.7.7-1.69 0-2.5 0a2.5 2.5 0 0 0 0 5c.28 0 .5.22.5.5a2.5 2.5 0 1 0 5 0c0-.81-.7-1.8 0-2.5Z"/>',
    tooth: '<path d="M7 3C5 3 3 4.5 3 7.5c0 2 1 3.5 1.5 5.5.6 2.5 1 8 3 8 1.5 0 1.7-4 4.5-4s3 4 4.5 4c2 0 2.4-5.5 3-8 .5-2 1.5-3.5 1.5-5.5C21 4.5 19 3 17 3c-2 0-3 1-5 1S9 3 7 3z"/>',
    mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/>',
    play: '<path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" fill="currentColor" stroke="none"/>',
    pause: '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    video: '<path d="m16 13 5.22 3.48a.5.5 0 0 0 .78-.42V7.87a.5.5 0 0 0-.75-.43L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    steth: '<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 12 0V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 12 0v-4"/><circle cx="20" cy="10" r="2"/>',
    book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    chart: '<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    file: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="m9 15 2 2 4-4"/>',
    qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM21 14v.01M14 21h7M21 17v4"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
    reset: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    printer: '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    user: '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    pen: '<path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>'
  };
  function icon(name, cls) {
    return '<svg class="i ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }
  const LOGO = APP.brand.logoIcon ? '<img class="logo-img" src="' + APP.brand.logoIcon + '" alt="">' : '<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="12" fill="currentColor"/><path d="M17 9h6v8h8v6h-8v8h-6v-8H9v-6h8z" fill="#fff"/><circle cx="31" cy="9" r="3" fill="var(--accent)"/></svg>';

  /* Look-ups */
  const spec = id => APP.specialties.find(s => s.id === id);
  const doctor = id => APP.doctors.find(d => d.id === id);
  function unitName(id) {
    const s = spec(id); if (s) return L(s.name);
    const u = APP.otherUnits.find(x => x.id === id); return u ? L(u.name) : '';
  }
  function initials(nameObj) {
    const n = L(nameObj).replace(/^(د\.|Dr\.)\s*/, '').replace(/\bAl-/g, '').replace(/ال/g, '');
    const parts = n.trim().split(/\s+/);
    return (parts[0] || '').charAt(0) + (parts.length > 1 ? '‌' + parts[parts.length - 1].charAt(0) : '');
  }
  function avatar(doc, size) {
    const s = spec(doc.spec);
    return '<span class="avatar" style="--c:' + s.color + ';' + (size ? 'width:' + size + 'px;height:' + size + 'px;font-size:' + Math.round(size / 2.6) + 'px' : '') + '">' + esc(initials(doc.name)) + '</span>';
  }

  /* Dates */
  function locale() { return lang === 'ar' ? 'ar-SA-u-ca-gregory-nu-latn' : 'en-GB'; }
  function fmtDate(ts, opts) { try { return new Intl.DateTimeFormat(locale(), opts || { day: 'numeric', month: 'short' }).format(new Date(ts)); } catch (e) { return new Date(ts).toLocaleDateString(); } }
  function fmtTime(ts) { return fmtDate(ts, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }); }
  function ago(ts) {
    const m = Math.round((Date.now() - ts) / 60000);
    if (m < 1) return t('ago_now');
    if (m < 60) return t('ago_min', { n: m });
    const h = Math.round(m / 60); if (h < 24) return t('ago_h', { n: h });
    return t('ago_d', { n: Math.round(h / 24) });
  }
  function fmtNum(n) { return Number(n).toLocaleString('en-US'); }
  function ref(prefix) { return prefix + '-' + (Math.floor(Math.random() * 9000) + 1000); }

  /* Analytics events (demo: stored in the browser) */
  function track(type, data) { Store.push('events', { type, data: data || {}, t: Date.now() }, 400); }
  function trackVisit() {
    const src = new URLSearchParams(location.search).get('src') || 'direct';
    if (!Store.get('vid', null)) { Store.set('vid', ref('V')); track('unique'); }
    if (!sessionStorageOk('visited')) track('visit', { src });
  }
  function sessionStorageOk(k) {
    try { if (sessionStorage.getItem(PREFIX + k)) return true; sessionStorage.setItem(PREFIX + k, '1'); return false; } catch (e) { return false; }
  }

  /* Toast */
  let toastTimer;
  function toast(msg, kind) {
    let el = document.getElementById('toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.className = 'toast show ' + (kind || '');
    el.innerHTML = icon(kind === 'err' ? 'x' : 'check') + '<span>' + esc(msg) + '</span>';
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.className = 'toast'; }, 3200);
  }

  /* Modal (bottom sheet on phones) */
  function modal(html, opts) {
    opts = opts || {};
    const wrap = document.createElement('div');
    wrap.className = 'sheet-wrap';
    wrap.innerHTML = '<div class="sheet ' + (opts.cls || '') + '" role="dialog" aria-modal="true"><button class="sheet-x" aria-label="' + esc(t('close')) + '">' + icon('x') + '</button>' + html + '</div>';
    document.body.appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add('open'));
    function close() { wrap.classList.remove('open'); setTimeout(() => wrap.remove(), 250); if (opts.onClose) opts.onClose(); document.removeEventListener('keydown', onKey); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    wrap.addEventListener('click', e => { if (e.target === wrap || e.target.closest('.sheet-x') || e.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', onKey);
    const first = wrap.querySelector('button, a, input, textarea, select'); if (first) setTimeout(() => first.focus(), 60);
    return { el: wrap, close };
  }

  function youtubeId(url) {
    const m = String(url || '').match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
    return m ? m[1] : null;
  }

  window.Q = { Store, seed, L, t, esc, applyLang, setLang, getLang, applyBrand, icon, LOGO, spec, doctor, unitName, avatar,
    fmtDate, fmtTime, ago, fmtNum, ref, track, trackVisit, toast, modal, youtubeId };

  applyBrand();
  seed();
})();
