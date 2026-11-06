/* Staff dashboard (demo). Reads what the portal saves in this browser. */
(function () {
  const { Store, L, t, esc, icon, spec, doctor, avatar, fmtDate, fmtTime, ago, fmtNum, toast, modal, unitName } = Q;
  const root = document.getElementById('root');
  const PAGES = [['overview', 'chart', 'ad_overview'], ['feedback', 'inbox', 'ad_feedback'], ['questions', 'help', 'ad_questions'], ['content', 'layers', 'ad_content'], ['consents', 'file', 'ad_consents'], ['qr', 'qr', 'ad_qr']];
  const S = { page: 'overview', fbFilter: 'all', qTab: 'pending', lastEvents: Store.get('events', []).length };

  const FACE_COL = ['#D9434B', '#E8743B', '#D9A21B', '#5FA846', '#1F8A55'];
  const MOUTH = ['M8 17.2c1.6-2.2 6.4-2.2 8 0', 'M8.5 16.4c1.6-1.1 5.4-1.1 7 0', 'M8.5 15.6h7', 'M8.5 14.6c1.6 1.4 5.4 1.4 7 0', 'M7.6 13.8c1.6 3.2 7.2 3.2 8.8 0'];
  const face = r => { const c = FACE_COL[r - 1]; return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="' + c + '" fill-opacity=".14" stroke="' + c + '" stroke-width="1.5"/><circle cx="8.8" cy="10" r="1.3" fill="' + c + '"/><circle cx="15.2" cy="10" r="1.3" fill="' + c + '"/><path d="' + MOUTH[r - 1] + '" fill="none" stroke="' + c + '" stroke-width="1.8" stroke-linecap="round"/></svg>'; };

  /* ---------- data ---------- */
  const events = () => Store.get('events', []);
  const feedback = () => Store.get('feedback', []);
  const questions = () => Store.get('questions', []);
  const consents = () => Store.get('consents', []);
  function updateList(key, id, patch) {
    const a = Store.get(key, []); const i = a.findIndex(x => x.id === id);
    if (i > -1) { if (patch === null) a.splice(i, 1); else Object.assign(a[i], patch); Store.set(key, a); }
  }
  function isoWeek(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const day = d.getUTCDay() || 7; d.setUTCDate(d.getUTCDate() + 4 - day);
    const y0 = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - y0) / 864e5 + 1) / 7);
  }
  function stats() {
    const ev = events(), sd = APP.seed.stats;
    const live = {
      visits: ev.filter(e => e.type === 'visit').length,
      unique: ev.filter(e => e.type === 'unique').length,
      qr: ev.filter(e => e.type === 'visit' && e.data.src === 'qr').length,
      questions: questions().filter(q => !q.seed).length,
      feedback: feedback().filter(f => !f.seed).length
    };
    return { live, total: { visits: sd.visits + live.visits, unique: sd.unique + live.unique, qr: sd.qr + live.qr, questions: sd.questions + live.questions, feedback: sd.feedback + live.feedback } };
  }
  function featureCounts() {
    const ev = events(), base = Object.assign({}, APP.seed.features);
    ev.forEach(e => {
      if (e.type === 'view' && base[e.data.route] != null) base[e.data.route]++;
      if (e.type === 'click' && base[e.data.f] != null) base[e.data.f]++;
    });
    return Object.keys(base).map(k => ({ k, v: base[k] })).sort((a, b) => b.v - a.v);
  }

  /* ---------- login ---------- */
  function vLogin() {
    root.innerHTML = '<div class="login"><form class="login-card" id="loginForm">' +
      '<button type="button" class="lang-btn" data-act="lang">' + t('lang_switch') + '</button>' +
      '<span class="logo">' + Q.LOGO + '</span><h1>' + t('ad_login_title') + '</h1><p class="sub">' + esc(L(APP.brand.name)) + '</p>' +
      '<div class="field"><label for="em">' + t('ad_email') + '</label><input class="input" id="em" dir="ltr" value="experience@alsafaclinic.com" autocomplete="off"></div>' +
      '<div class="field"><label for="pw">' + t('ad_password') + '</label><input class="input" id="pw" type="password" dir="ltr" value="demo-password"></div>' +
      '<button class="btn block" type="submit">' + icon('lock') + t('ad_signin') + '</button>' +
      '<p class="hint" style="display:flex;gap:8px">' + icon('shield') + t('ad_login_note') + '</p></form></div>';
    document.getElementById('loginForm').addEventListener('submit', e => { e.preventDefault(); Store.set('admin_in', true); start(); });
  }

  /* ---------- shell ---------- */
  function shell() {
    const pend = questions().filter(q => q.status === 'pending').length;
    const fresh = feedback().filter(f => f.status === 'new').length;
    root.innerHTML = '<div class="shell"><aside class="side">' +
      '<div class="brand"><span class="logo">' + Q.LOGO + '</span><span><b>' + esc(L(APP.brand.name)) + '</b><small>' + t('ad_role') + '</small></span></div>' +
      PAGES.map(([p, ic, k]) => '<button class="nav ' + (S.page === p ? 'on' : '') + '" data-page="' + p + '">' + icon(ic) + '<span>' + t(k) + '</span>' +
        (p === 'feedback' && fresh ? '<span class="count">' + fresh + '</span>' : '') + (p === 'questions' && pend ? '<span class="count">' + pend + '</span>' : '') + '</button>').join('') +
      '<span class="spacer"></span>' +
      '<button class="nav small" data-act="reset">' + icon('reset') + t('reset_demo') + '</button>' +
      '<button class="nav small" data-act="signout">' + icon('lock') + t('ad_signout') + '</button>' +
      '</aside><main class="main"><div class="top"><h1>' + t(PAGES.find(p => p[0] === S.page)[2]) + '</h1><div class="actions">' +
      '<a class="btn sm ghost" href="portal.html" target="_blank">' + icon('external') + t('ad_view_portal') + '</a>' +
      '<button class="lang-btn" data-act="lang">' + t('lang_switch') + '</button>' +
      '<span class="user"><span class="av">' + icon('user') + '</span><span><b>' + (Q.getLang() === 'ar' ? 'منى الشمري' : 'Mona Al-Shammari') + '</b><small>' + t('ad_role') + '</small></span></span>' +
      '</div></div><div id="page"></div></main></div>';
    const page = document.getElementById('page');
    page.innerHTML = ({ overview: pOverview, feedback: pFeedback, questions: pQuestions, content: pContent, consents: pConsents, qr: pQr })[S.page]();
    if (S.page === 'overview') bindChart();
    if (S.page === 'qr') drawQr();
  }

  /* ---------- overview ---------- */
  function pOverview() {
    const s = stats();
    const k = (key, ic, lbl) => '<div class="kpi" data-k="' + key + '"><span class="lbl">' + icon(ic) + t(lbl) + '</span><span class="val">' + fmtNum(s.total[key]) + '</span><span class="live">' + (s.live[key] ? t('k_live', { n: s.live[key] }) : '') + '</span></div>';
    const feats = featureCounts(), max = feats[0].v;
    const ev = events().filter(e => e.type !== 'unique').slice(0, 9);
    const fname = f => f === 'home' ? t('nav_home') : (t('f_' + f) !== 'f_' + f ? t('f_' + f) : f);
    const evRow = e => {
      let ic = 'activity', txt = '';
      if (e.type === 'visit') { ic = e.data.src === 'qr' ? 'qr' : 'globe'; txt = t(e.data.src === 'qr' ? 'ev_visit_qr' : 'ev_visit'); }
      else if (e.type === 'view') { ic = 'eye'; txt = t('ev_view', { x: fname(e.data.route) }); }
      else if (e.type === 'submit_feedback') { ic = 'inbox'; txt = t('ev_feedback', { x: e.data.id }); }
      else if (e.type === 'submit_question') { ic = 'help'; txt = t('ev_question', { x: e.data.id }); }
      else if (e.type === 'click') { ic = 'activity'; txt = t('ev_click', { x: fname(e.data.f) }); }
      return '<div class="ev"><span class="ic">' + icon(ic) + '</span><span>' + esc(txt) + '</span><time>' + ago(e.t) + '</time></div>';
    };
    return '<div class="grid">' +
      '<div class="grid g-kpi">' + k('visits', 'eye', 'k_visits') + k('unique', 'user', 'k_unique') + k('qr', 'qr', 'k_qr') + k('questions', 'help', 'k_questions') + k('feedback', 'inbox', 'k_feedback') + '</div>' +
      '<div class="grid g-2"><section class="panel"><div class="panel-head"><h2>' + icon('chart') + t('chart_title') + '</h2></div>' + chartHtml() + '</section>' +
      '<section class="panel"><div class="panel-head"><h2>' + icon('activity') + t('clicks_title') + '</h2></div><div class="hbars">' +
        feats.map(f => '<div class="hbar"><div class="row"><span>' + t('f_' + f.k) + '</span><b>' + fmtNum(f.v) + '</b></div><div class="track"><i style="width:' + (f.v / max * 100).toFixed(1) + '%"></i></div></div>').join('') +
      '</div></section></div>' +
      '<div class="grid g-2e"><section class="panel"><div class="panel-head"><h2>' + icon('activity') + t('activity_title') + '</h2><span class="tag" style="background:#E9F7F0;color:var(--ok)">● LIVE</span></div><div class="feed">' +
        (ev.length ? ev.map(evRow).join('') : '<p class="hint">' + t('no_activity') + '</p>') + '</div></section>' +
      '<div class="note" style="align-self:start">' + icon('help') + '<span>' + t('analytics_note') + '</span></div></div>' +
      '</div>';
  }
  function chartHtml() {
    const ev = events(), today = new Date(); today.setHours(0, 0, 0, 0);
    const liveToday = ev.filter(e => e.type === 'visit' && e.t >= today.getTime()).length;
    const vals = APP.seed.daily.slice(); vals[vals.length - 1] += liveToday;
    const max = Math.ceil(Math.max.apply(null, vals) / 100) * 100;
    const lines = [0, .5, 1].map(f => '<div class="grid-l" style="bottom:calc(24px + ' + (f * 100) + '% - ' + (f * 24) + 'px)"><span>' + fmtNum(max * f) + '</span></div>').join('');
    const bars = vals.map((v, i) => {
      const d = new Date(today); d.setDate(d.getDate() - (vals.length - 1 - i));
      const isToday = i === vals.length - 1;
      return '<button class="bar ' + (isToday ? 'today' : '') + '" data-v="' + v + '" data-d="' + esc(fmtDate(d, { weekday: 'short', day: 'numeric', month: 'short' })) + '" aria-label="' + esc(fmtDate(d) + ': ' + t('chart_visits', { n: v })) + '"><i style="height:' + (v / max * 100).toFixed(1) + '%"></i><small>' + (isToday ? t('chart_today') : fmtDate(d, { day: 'numeric' })) + '</small></button>';
    }).join('');
    return '<div class="chart" id="chart">' + lines + '<div class="bars">' + bars + '</div><div class="tip" id="tip"></div></div>';
  }
  function bindChart() {
    const chart = document.getElementById('chart'), tip = document.getElementById('tip'); if (!chart) return;
    const show = b => {
      const cr = chart.getBoundingClientRect(), fill = b.querySelector('i').getBoundingClientRect();
      tip.innerHTML = '<b>' + t('chart_visits', { n: fmtNum(b.dataset.v) }) + '</b>' + b.dataset.d;
      tip.style.left = (fill.left + fill.width / 2 - cr.left) + 'px'; tip.style.top = (fill.top - cr.top) + 'px';
      tip.classList.add('show');
    };
    chart.querySelectorAll('.bar').forEach(b => {
      b.addEventListener('mouseenter', () => show(b)); b.addEventListener('focus', () => show(b));
      b.addEventListener('mouseleave', () => tip.classList.remove('show')); b.addEventListener('blur', () => tip.classList.remove('show'));
    });
  }

  /* ---------- feedback ---------- */
  function fakeWave(id, dur) {
    const bars = Array.from({ length: 48 }, (_, i) => '<span style="height:' + Math.round(5 + Math.abs(Math.sin(i * 1.3 + id.length) * Math.cos(i * .37)) * 22) + 'px"></span>').join('');
    return '<div class="fakewave"><button class="pb" data-act="fakeplay" aria-label="play">' + icon('play') + '</button><div class="w">' + bars + '</div><time>0:' + String(dur || 0).padStart(2, '0') + '</time></div>';
  }
  function pFeedback() {
    const all = feedback(), f = S.fbFilter;
    const list = all.filter(x => f === 'all' || x.status === f);
    const n = k => all.filter(x => k === 'all' || x.status === k).length;
    const item = x => {
      const ageDays = Math.floor((Date.now() - x.t) / 864e5);
      const unit = x.clinic ? unitName(x.clinic) : '';
      return '<article class="item ' + (x.status === 'new' ? 'is-new' : '') + '">' +
        '<div class="item-head"><span class="face">' + face(x.rating) + '</span><span class="who"><b>' + t('r' + x.rating) + (unit ? ' · ' + esc(unit) : '') + '</b><small class="mono" dir="ltr" style="text-align:start">' + esc(x.id) + '</small></span>' +
        '<span class="tags"><span class="tag ' + (x.type === 'voice' ? 'blue' : 'gray') + '">' + icon(x.type === 'voice' ? 'mic' : 'pen') + t(x.type === 'voice' ? 't_voice' : 't_text') + '</span>' +
        (x.anon ? '<span class="tag gray">' + t('anon') + '</span>' : '<span class="tag warn">' + icon('phone') + esc(x.name || '') + ' <span dir="ltr">' + esc(x.phone) + '</span></span><span class="tag red">' + t('wants_call') + '</span>') +
        (x.status === 'new' ? '<span class="tag warn">' + t('is_new') + '</span>' : '') + (!x.seed ? '<span class="tag" style="background:#E9F7F0;color:var(--ok)">' + t('live_tag') + '</span>' : '') + '</span>' +
        '<time>' + ago(x.t) + '</time></div>' +
        (x.type === 'voice'
          ? (x.audio ? '<audio controls src="' + x.audio + '"></audio>' : fakeWave(x.id, x.dur)) +
            (x.transcript ? '<div class="transcript"><small>' + icon('file') + t('transcript') + '</small><span>' + esc(x.transcript) + '</span></div>' : (!x.audio ? '<p class="hint">' + t('sample_audio') + '</p>' : ''))
          : '<div class="body quote">' + esc(x.text) + '</div>') +
        '<div class="item-foot"><span class="meta">' + (x.type === 'voice' ? icon('clock') + t('auto_delete', { n: Math.max(0, 90 - ageDays) }) : '') + '</span>' +
        (x.status === 'new' ? '<button class="btn sm soft" data-act="fbreview" data-id="' + x.id + '">' + icon('check') + t('mark_reviewed') + '</button>' : '<span class="tag gray">' + icon('check') + t('reviewed') + '</span>') +
        '<button class="btn sm danger" data-act="fbdel" data-id="' + x.id + '">' + icon('trash') + t('del') + '</button></div></article>';
    };
    return '<div class="toolbar"><div class="tabs">' + [['all', 'filter_all'], ['new', 'filter_new'], ['reviewed', 'filter_reviewed']].map(([k, l]) =>
      '<button class="' + (f === k ? 'on' : '') + '" data-act="fbfilter" data-v="' + k + '">' + t(l) + '<span class="n">' + n(k) + '</span></button>').join('') + '</div></div>' +
      '<div class="items">' + (list.length ? list.map(item).join('') : '<p class="hint">' + t('empty') + '</p>') + '</div>';
  }

  /* ---------- questions ---------- */
  function pQuestions() {
    const all = questions().filter(q => q.status !== 'dismissed'), tab = S.qTab;
    const list = all.filter(q => q.status === tab);
    const n = k => all.filter(q => q.status === k).length;
    const docOptions = sel => APP.doctors.map(d => '<option value="' + d.id + '"' + (sel === d.id ? ' selected' : '') + '>' + esc(L(d.name)) + ' · ' + esc(L(spec(d.spec).name)) + '</option>').join('');
    const item = q => {
      const s = q.spec ? spec(q.spec) : null, defDoc = q.doctor || (APP.doctors.find(d => d.spec === q.spec) || APP.doctors[0]).id;
      const d = doctor(q.doctor);
      let foot = '';
      if (q.status === 'pending') foot = '<div class="item-foot"><span class="meta"></span><select class="select sm" id="doc-' + q.id + '" aria-label="' + esc(t('doctor')) + '">' + docOptions(defDoc) + '</select>' +
        '<button class="btn sm" data-act="qpick" data-id="' + q.id + '">' + icon('video') + t('pick_video') + '</button><button class="btn sm danger" data-act="qdismiss" data-id="' + q.id + '">' + icon('x') + t('dismiss') + '</button></div>';
      if (q.status === 'selected') foot = '<div class="inline-form"><div class="full" style="display:flex;align-items:center;gap:10px">' + avatar(d, 34) + '<b style="font-size:14px">' + esc(L(d.name)) + '</b></div>' +
        '<input class="input sm full" id="url-' + q.id + '" dir="ltr" placeholder="' + esc(t('video_url')) + '" style="width:100%">' +
        '<textarea class="textarea full" id="sum-' + q.id + '" style="min-height:70px" placeholder="' + esc(t('summary_ph')) + '"></textarea>' +
        '<div class="full"><button class="btn sm" data-act="qpublish" data-id="' + q.id + '">' + icon('send', 'flip') + t('publish') + '</button></div></div>';
      if (q.status === 'published') foot = '<div class="item-foot"><span class="meta">' + avatar(d, 26) + esc(L(d.name)) + (q.videoUrl ? ' · <span dir="ltr">' + esc(q.videoUrl) + '</span>' : '') + '</span><a class="btn sm ghost" href="portal.html#weekly" target="_blank">' + icon('external') + t('ad_view_portal') + '</a></div>';
      return '<article class="item ' + (q.status === 'pending' ? 'is-new' : '') + '"><div class="item-head"><span class="tags">' +
        (s ? '<span class="tag" style="background:color-mix(in srgb,' + s.color + ' 12%,#fff);color:' + s.color + '">' + icon(s.icon) + esc(L(s.name)) + '</span>' : '<span class="tag gray">' + t('no_spec') + '</span>') +
        '<span class="tag gray">' + (q.lang === 'en' ? 'EN' : 'AR') + '</span><span class="tag">' + icon('shield') + t('agreed_pub') + '</span>' +
        (q.notify ? '<span class="tag warn">' + icon('phone') + t('wants_notify') + '</span>' : '') + (!q.seed ? '<span class="tag" style="background:#E9F7F0;color:var(--ok)">' + t('live_tag') + '</span>' : '') +
        '</span><time>' + esc(q.id) + ' · ' + ago(q.t) + '</time></div><div class="body" style="font-size:15.5px;font-weight:600;color:var(--ink)" dir="auto">' + esc(q.text) + '</div>' +
        (q.summary && q.status === 'published' ? '<div class="body quote">' + esc(q.summary) + '</div>' : '') + foot + '</article>';
    };
    return '<div class="toolbar"><div class="tabs">' + [['pending', 'q_pending'], ['selected', 'q_selected'], ['published', 'q_published']].map(([k, l]) =>
      '<button class="' + (tab === k ? 'on' : '') + '" data-act="qtab" data-v="' + k + '">' + t(l) + '<span class="n">' + n(k) + '</span></button>').join('') + '</div></div>' +
      '<div class="items">' + (list.length ? list.map(item).join('') : '<p class="hint">' + t('empty') + '</p>') + '</div>';
  }

  /* ---------- content ---------- */
  function pContent() {
    const hidden = Store.get('doc_hidden', []), custom = Store.get('faqs_custom', []);
    const faqs = APP.faqs.concat(custom);
    return '<div class="grid"><div class="note">' + icon('pen') + '<span>' + t('content_note') + '</span></div><div class="grid g-2e">' +
      '<section class="panel"><div class="panel-head"><h2>' + icon('steth') + t('doctors') + '</h2></div>' +
        APP.doctors.map(d => { const off = hidden.includes(d.id); return '<div class="doc-row ' + (off ? 'off' : '') + '">' + avatar(d) + '<div><b>' + esc(L(d.name)) + '</b><small>' + esc(L(d.title)) + ' · ' + esc(L(d.days)) + '</small></div>' +
          '<label class="switch" title="' + esc(t(off ? 'hidden' : 'shown')) + '"><span class="sr-only">' + t('shown') + '</span><input type="checkbox" data-act="doctoggle" data-id="' + d.id + '"' + (off ? '' : ' checked') + '></label></div>'; }).join('') +
      '</section>' +
      '<section class="panel"><div class="panel-head"><h2>' + icon('book') + t('faqs_title') + '</h2><button class="btn sm" data-act="addfaq">' + icon('plus') + t('add_faq') + '</button></div>' +
        APP.specialties.map(s => { const fs = faqs.filter(f => f.spec === s.id); return '<div class="spec-row"><span class="sp" style="--c:' + s.color + '">' + icon(s.icon) + '</span><span>' + esc(L(s.name)) + '</span><span style="display:flex;gap:6px"><span class="tag gray">' + t('questions_n', { n: fs.length }) + '</span>' + (fs.filter(f => f.video).length ? '<span class="tag blue">' + t('has_video_n', { n: fs.filter(f => f.video).length }) + '</span>' : '') + '</span></div>'; }).join('') +
        custom.map(c => '<div class="custom-faq"><span class="tag" style="background:#E9F7F0;color:var(--ok)">' + t('live_tag') + '</span><b style="margin-top:6px">' + esc(L(c.q)) + '</b><span class="hint">' + esc(L(c.a)) + '</span></div>').join('') +
      '</section></div></div>';
  }
  function openAddFaq() {
    const m = modal('<h2 style="font-size:19px;margin-bottom:16px">' + t('add_faq') + '</h2><form class="grid" id="faqForm" style="gap:12px">' +
      '<div class="inline-form"><div class="field"><label>' + t('specialty') + '</label><select class="select" id="fSpec">' + APP.specialties.map(s => '<option value="' + s.id + '">' + esc(L(s.name)) + '</option>').join('') + '</select></div>' +
      '<div class="field"><label>' + t('doctor') + '</label><select class="select" id="fDoc">' + APP.doctors.map(d => '<option value="' + d.id + '">' + esc(L(d.name)) + '</option>').join('') + '</select></div></div>' +
      '<div class="field"><label>' + t('q_ar') + '</label><input class="input" id="fQar" dir="rtl"></div>' +
      '<div class="field"><label>' + t('a_ar') + '</label><textarea class="textarea" id="fAar" dir="rtl" style="min-height:80px"></textarea></div>' +
      '<div class="field"><label>' + t('q_en') + '</label><input class="input" id="fQen" dir="ltr"></div>' +
      '<div class="field"><label>' + t('a_en') + '</label><textarea class="textarea" id="fAen" dir="ltr" style="min-height:80px"></textarea></div>' +
      '<button class="btn block" type="submit">' + icon('check') + t('save_pub') + '</button></form>');
    const sp = m.el.querySelector('#fSpec'), dc = m.el.querySelector('#fDoc');
    sp.addEventListener('change', () => { const d = APP.doctors.find(x => x.spec === sp.value); if (d) dc.value = d.id; });
    m.el.querySelector('#faqForm').addEventListener('submit', e => {
      e.preventDefault();
      const v = id => m.el.querySelector(id).value.trim();
      if (!v('#fQar') || !v('#fAar')) { toast(t('faq_err'), 'err'); return; }
      Store.push('faqs_custom', { id: 'c' + Date.now(), spec: sp.value, doctor: dc.value, video: null, q: { ar: v('#fQar'), en: v('#fQen') || v('#fQar') }, a: { ar: v('#fAar'), en: v('#fAen') || v('#fAar') } });
      m.close(); toast(t('faq_saved')); shell();
    });
  }

  /* ---------- consents ---------- */
  const kindLabel = k => t(k === 'voice' ? 'ct_voice' : k === 'text' ? 'ct_text' : 'ct_question');
  function pConsents() {
    const list = consents();
    return '<div class="grid"><div class="note">' + icon('shield') + '<span>' + t('consents_note') + '</span></div><section class="panel">' +
      '<div class="panel-head"><h2>' + icon('file') + t('ad_consents') + ' <span class="tag gray">' + list.length + '</span></h2>' + (APP.hosted ? '' : '<button class="btn sm ghost" data-act="csv">' + icon('download') + t('export_csv') + '</button>') + '</div>' +
      '<div class="table-wrap"><table><thead><tr><th>' + t('c_ref') + '</th><th>' + t('c_type') + '</th><th>' + t('c_version') + '</th><th>' + t('c_time') + '</th><th>' + t('c_lang') + '</th><th>' + t('c_contact') + '</th></tr></thead><tbody>' +
      list.map(c => '<tr class="' + (Date.now() - c.t < 6e5 ? 'fresh' : '') + '"><td class="mono">' + esc(c.id) + ' → ' + esc(c.ref) + '</td><td>' + kindLabel(c.kind) + '</td><td>v' + esc(c.version) + '</td><td>' + fmtTime(c.t) + '</td><td>' + (c.lang === 'en' ? 'English' : 'العربية') + '</td><td>' + t(c.contact ? 'yes' : 'no') + '</td></tr>').join('') +
      '</tbody></table></div></section></div>';
  }
  function exportCsv() {
    const rows = [['consent_id', 'submission_ref', 'type', 'form_version', 'timestamp_iso', 'language', 'contact_details']]
      .concat(consents().map(c => [c.id, c.ref, c.kind, c.version, new Date(c.t).toISOString(), c.lang, c.contact ? 'yes' : 'no']));
    const csv = '﻿' + rows.map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'consent-records.csv'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /* ---------- QR ---------- */
  const defaultUrl = () => APP.shareUrl ? APP.shareUrl + '#scan' : new URL('portal.html?src=qr', location.href).href;
  const qrUrl = () => Store.get('qr_url', '') || defaultUrl();
  function pQr() {
    const isFile = !APP.hosted && location.protocol === 'file:' && !Store.get('qr_url', '');
    return '<div class="grid g-2e"><section class="panel"><div class="qr-box"><h2>' + icon('qr') + t('qr_title') + '</h2>' +
      '<div class="qr-holder" id="qrMain"></div>' +
      '<div class="field" style="width:100%;text-align:start"><label for="qrUrl">' + t('qr_url') + '</label><div class="url-row"><input class="input" id="qrUrl" value="' + esc(qrUrl()) + '"><button class="btn sm soft" data-act="qrset">' + icon('check') + '</button></div></div>' +
      (isFile ? '<div class="note warn-note" style="text-align:start">' + icon('help') + '<span>' + t('pr_file_warn') + '</span></div>' : '') +
      '<div class="note" style="text-align:start">' + icon('reset') + '<span>' + t('qr_note') + '</span></div>' +
      (APP.hosted ? '' : '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center"><button class="btn sm" data-act="qrdl">' + icon('download') + t('qr_download') + '</button><button class="btn sm ghost" data-act="qrprint">' + icon('printer') + t('qr_print') + '</button></div>') +
      '</div></section><section class="panel"><div class="grid" style="gap:14px">' + posterHtml('qrPoster') + '<p class="hint" style="text-align:center">' + t('qr_where') + '</p></div></section></div>';
  }
  function posterHtml(id) {
    return '<div class="poster"><div class="p-top"><span class="logo">' + Q.LOGO + '</span><b>' + esc(L(APP.brand.name)) + '</b></div>' +
      '<div class="p-mid"><div class="p-qr" id="' + id + '"></div><h3>' + t('poster_scan') + '</h3><p>' + t('poster_sub') + '</p></div>' +
      '<div class="p-foot" dir="ltr">' + esc(qrUrl().replace(/^https?:\/\//, '').replace(/^file:\/\/\/?/, '').slice(0, 48)) + '</div></div>';
  }
  function makeQr(el, size) {
    if (!el || !window.QRCode) return;
    el.innerHTML = '';
    new QRCode(el, { text: qrUrl(), width: size, height: size, colorDark: APP.brand.colors.primaryDark, colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M });
    el.removeAttribute('title');
  }
  function drawQr() { makeQr(document.getElementById('qrMain'), 440); makeQr(document.getElementById('qrPoster'), 300); }

  /* ---------- events ---------- */
  root.addEventListener('click', e => {
    const pl = e.target.closest('a[href^="portal.html"]');
    if (pl && window.parent !== window) { e.preventDefault(); window.parent.postMessage({ qrpGo: 'portal', hash: (pl.getAttribute('href').split('#')[1] || '') }, '*'); return; }
    const p = e.target.closest('[data-page]');
    if (p) { S.page = p.dataset.page; location.hash = S.page; shell(); window.scrollTo(0, 0); return; }
    const a = e.target.closest('[data-act]'); if (!a) return;
    const id = a.dataset.id;
    switch (a.dataset.act) {
      case 'lang': Q.setLang(Q.getLang() === 'ar' ? 'en' : 'ar'); break;
      case 'signout': Store.set('admin_in', false); start(); break;
      case 'reset': { const lg = Q.getLang(); Store.clear(); Store.set('lang', lg); Store.set('admin_in', true); Q.seed(); } toast(t('reset_done')); S.lastEvents = 0; shell(); break;
      case 'fbfilter': S.fbFilter = a.dataset.v; shell(); break;
      case 'fbreview': updateList('feedback', id, { status: 'reviewed' }); toast(t('reviewed_toast')); shell(); break;
      case 'fbdel': updateList('feedback', id, null); toast(t('deleted_toast')); shell(); break;
      case 'fakeplay': {
        const w = a.closest('.fakewave'); w.classList.add('playing'); a.innerHTML = icon('pause');
        setTimeout(() => { w.classList.remove('playing'); a.innerHTML = icon('play'); }, 2500);
        break;
      }
      case 'qtab': S.qTab = a.dataset.v; shell(); break;
      case 'qpick': { const d = document.getElementById('doc-' + id).value; updateList('questions', id, { status: 'selected', doctor: d }); toast(t('picked_toast')); S.qTab = 'selected'; shell(); break; }
      case 'qdismiss': updateList('questions', id, { status: 'dismissed' }); toast(t('dismissed_toast')); shell(); break;
      case 'qpublish': {
        const url = document.getElementById('url-' + id).value.trim(), sum = document.getElementById('sum-' + id).value.trim();
        updateList('questions', id, { status: 'published', videoUrl: url, summary: sum, publishedAt: Date.now(), week: isoWeek(new Date()) });
        toast(t('published_toast')); S.qTab = 'published'; shell(); break;
      }
      case 'addfaq': openAddFaq(); break;
      case 'csv': exportCsv(); break;
      case 'qrset': { const v = document.getElementById('qrUrl').value.trim(); Store.set('qr_url', v === defaultUrl() ? '' : v); shell(); break; }
      case 'qrdl': {
        const el = document.getElementById('qrMain'), c = el.querySelector('canvas'), img = el.querySelector('img');
        const link = document.createElement('a'); link.download = 'portal-qr.png';
        link.href = c ? c.toDataURL('image/png') : img.src; link.click(); break;
      }
      case 'qrprint': {
        const pa = document.getElementById('printArea'); pa.innerHTML = posterHtml('qrPrint');
        makeQr(document.getElementById('qrPrint'), 600);
        setTimeout(() => window.print(), 250); break;
      }
    }
  });
  root.addEventListener('change', e => {
    const a = e.target.closest('[data-act="doctoggle"]'); if (!a) return;
    const h = Store.get('doc_hidden', []), id = a.dataset.id;
    Store.set('doc_hidden', a.checked ? h.filter(x => x !== id) : h.concat(id));
    shell();
  });

  /* live updates when the portal (another tab or the presenter iframe) saves something */
  function refreshLive() {
    if (!Store.get('admin_in', false)) return;
    const n = events().length;
    if (n === S.lastEvents) return;
    S.lastEvents = n;
    const typing = document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    if (typing || document.querySelector('.sheet-wrap')) return;
    shell();
    document.querySelectorAll('.kpi').forEach(k => { if (k.querySelector('.live').textContent) k.classList.add('flash'); });
  }
  window.addEventListener('storage', e => { if (e.key && e.key.indexOf('qrp_') === 0) refreshLive(); });
  setInterval(refreshLive, 2500);
  setInterval(() => { if (S.page === 'overview' && Store.get('admin_in', false) && !document.querySelector('.sheet-wrap')) shell(); }, 30000);

  document.addEventListener('langchange', () => start());
  window.addEventListener('hashchange', () => { const h = location.hash.replace('#', ''); if (h !== S.page && PAGES.some(p => p[0] === h)) start(); });
  window.addEventListener('storage', e => { if (e.key === 'qrp_lang' && e.newValue) Q.setLang(JSON.parse(e.newValue)); });

  function start() {
    const h = location.hash.replace('#', '');
    if (PAGES.some(p => p[0] === h)) S.page = h;
    if (Store.get('admin_in', false)) shell(); else vLogin();
  }
  Q.applyLang();
})();
