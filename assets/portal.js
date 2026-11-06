/* Patient portal: the page the QR code opens. */
(function () {
  const { Store, L, t, esc, icon, spec, doctor, avatar, track, fmtDate, fmtNum, ref, toast, modal } = Q;
  const B = APP.brand;
  const view = document.getElementById('view');
  const tabbar = document.getElementById('tabbar');
  document.getElementById('logo').innerHTML = Q.LOGO;

  const VOICE = APP.voice !== false;
  const freshFb = () => ({ rating: 0, clinic: '', mode: VOICE ? 'voice' : 'text', consent: false, anon: true, name: '', phone: '', text: '', audio: null, dur: 0, simulated: false, micError: false, sent: null });
  const freshAsk = () => ({ text: '', spec: '', notify: false, phone: '', consent: false, sent: null });
  const S = { route: 'home', clinicSpec: 'all', clinicQ: '', bodySpec: 'all', bodyQ: '', open: {}, ask: freshAsk(), fb: freshFb() };

  const TABS = [['home', 'home', 'nav_home'], ['clinics', 'steth', 'nav_clinics'], ['body', 'book', 'nav_body'], ['weekly', 'video', 'nav_weekly'], ['feedback', VOICE ? 'mic' : 'chat', 'nav_feedback']];

  /* ---------- data helpers ---------- */
  const visibleDoctors = () => { const hidden = Store.get('doc_hidden', []); return APP.doctors.filter(d => !hidden.includes(d.id)); };
  const allFaqs = () => APP.faqs.concat(Store.get('faqs_custom', []));
  function weeklyItems() {
    const live = Store.get('questions', []).filter(q => q.status === 'published').map(q => ({
      id: q.id, week: q.week || 44, t: q.publishedAt || q.t, spec: q.spec || (doctor(q.doctor) || {}).spec || 'cardio', doctor: q.doctor,
      dur: '—', views: 0, fresh: true, videoUrl: q.videoUrl, q: { ar: q.text, en: q.text }, summary: { ar: q.summary || '', en: q.summary || '' }
    }));
    return live.concat(APP.weekly).sort((a, b) => new Date(b.t) - new Date(a.t));
  }

  /* ---------- small builders ---------- */
  const FACE_COL = ['#D9434B', '#E8743B', '#D9A21B', '#5FA846', '#1F8A55'];
  const MOUTH = ['M8 17.2c1.6-2.2 6.4-2.2 8 0', 'M8.5 16.4c1.6-1.1 5.4-1.1 7 0', 'M8.5 15.6h7', 'M8.5 14.6c1.6 1.4 5.4 1.4 7 0', 'M7.6 13.8c1.6 3.2 7.2 3.2 8.8 0'];
  function face(i) {
    const c = FACE_COL[i];
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.5" fill="' + c + '" fill-opacity=".14" stroke="' + c + '" stroke-width="1.5"/><circle cx="8.8" cy="10" r="1.3" fill="' + c + '"/><circle cx="15.2" cy="10" r="1.3" fill="' + c + '"/><path d="' + MOUTH[i] + '" fill="none" stroke="' + c + '" stroke-width="1.8" stroke-linecap="round"/></svg>';
  }
  function fmtHour(h) {
    const d = new Date(); d.setHours(h, 0, 0, 0);
    return fmtDate(d, { hour: 'numeric', minute: '2-digit' });
  }
  function openStatus() {
    if (!B.hours) return { open: true, text: L(B.statusText) };
    const now = new Date(), day = now.getDay(), h = now.getHours() + now.getMinutes() / 60;
    const opensAt = d => (d === 5 ? B.hours.friOpen : B.hours.open);
    const isOpen = h >= opensAt(day) && h < B.hours.close;
    if (isOpen) return { open: true, text: t('open_now', { t: fmtHour(B.hours.close) }) };
    const next = h < opensAt(day) ? opensAt(day) : opensAt((day + 1) % 7);
    return { open: false, text: t('closed_now', { t: fmtHour(next) }) };
  }
  function vcard(w) {
    const s = spec(w.spec), d = doctor(w.doctor);
    return '<button class="vcard" data-act="wvideo" data-id="' + esc(w.id) + '">' +
      '<span class="thumb" style="--c:' + s.color + '">' + avatar(d) + '<span class="dur">' + esc(w.dur) + '</span><span class="playb">' + icon('play') + '</span></span>' +
      '<span class="meta"><span class="wq-top"><span class="tag">' + t('week', { n: w.week }) + '</span>' + (w.fresh ? '<span class="tag warn">' + t('is_new') + '</span>' : '<span class="tag gray">' + esc(L(s.name)) + '</span>') + '</span>' +
      '<b>' + esc(L(w.q)) + '</b><small>' + esc(L(d.name)) + (w.views ? ' · ' + t('views', { n: fmtNum(w.views) }) : '') + '</small></span></button>';
  }
  function specChips(active, act) {
    return '<div class="chips" role="tablist"><button class="chip ' + (active === 'all' ? 'on' : '') + '" data-act="' + act + '" data-spec="all">' + t('all') + '</button>' +
      APP.specialties.map(s => '<button class="chip ' + (active === s.id ? 'on' : '') + '" data-act="' + act + '" data-spec="' + s.id + '" style="--c:' + s.color + '"><span class="dot"></span>' + esc(L(s.name)) + '</button>').join('') + '</div>';
  }
  const specOptions = sel => APP.specialties.map(s => '<option value="' + s.id + '"' + (sel === s.id ? ' selected' : '') + '>' + esc(L(s.name)) + '</option>').join('');

  /* ---------- views ---------- */
  function vHome() {
    const st = openStatus(), latest = weeklyItems()[0];
    const qa = (route, ic, c, bg, title, desc, cls) =>
      '<button class="qa ' + (cls || '') + '" data-go="' + route + '" style="--c:' + c + ';--bg-c:' + bg + '"><span class="ico">' + icon(ic) + '</span><span><b>' + t(title) + '</b><small>' + t(desc) + '</small></span>' + (cls ? '<span class="go">' + icon('chevron', 'flip') + '</span>' : '') + '</button>';
    return '<section class="view">' +
      '<div class="hero"><span class="status ' + (st.open ? '' : 'closed') + '"><i class="pulse"></i>' + esc(st.text) + '</span>' +
      '<small>' + t('hero_hi') + '</small><h1>' + esc(L(B.name)) + '</h1><p>' + t('hero_sub') + '</p>' +
      '<div class="stats">' + (B.stats || [{ n: B.clinics, label: { ar: t('st_clinics'), en: t('st_clinics') } }, { n: B.doctors, label: { ar: t('st_doctors'), en: t('st_doctors') } }, { n: B.since, label: { ar: t('st_since'), en: t('st_since') } }]).map(x => '<div class="stat"><b>' + esc(x.n) + '</b><span>' + esc(L(x.label)) + '</span></div>').join('') + '</div></div>' +
      '<div class="qa-grid">' +
        qa('body', 'book', '#B7791F', '#FBEFD9', 'qa_body', 'qa_body_d', 'feature') +
        qa('weekly', 'video', '#3E63DD', '#E8EEFC', 'qa_weekly', 'qa_weekly_d') +
        qa('feedback', VOICE ? 'mic' : 'chat', '#C2418E', '#FBE8F3', 'qa_feedback', 'qa_feedback_d') +
        qa('clinics', 'steth', 'var(--primary)', 'var(--tint)', 'qa_clinics', 'qa_clinics_d', 'wide') +
      '</div>' +
      '<div class="contact-row">' +
        '<a class="contact" href="tel:' + B.phone + '" data-track="call">' + icon('phone') + t('c_call') + '</a>' +
        '<a class="contact" href="https://wa.me/' + B.whatsapp + '" target="_blank" rel="noopener" data-track="whatsapp">' + icon('chat') + t('c_whatsapp') + '</a>' +
        '<a class="contact" href="' + B.mapsUrl + '" target="_blank" rel="noopener" data-track="map">' + icon('pin') + t('c_map') + '</a>' +
        '<a class="contact" href="' + B.bookingUrl + '" target="_blank" rel="noopener" data-track="book">' + icon('calendar') + t('c_book') + '</a>' +
      '</div>' +
      (latest ? '<div class="sec-title"><h2>' + t('latest_video') + '</h2><a href="#weekly">' + t('see_all') + '</a></div>' + vcard(latest) : '') +
      '<div class="sec-title"><h2>' + t('about_title') + '</h2></div>' +
      '<div class="card about"><p>' + (B.about ? esc(L(B.about)) : t('about_body')) + '</p><div class="svc">' +
        (B.services ? B.services.map(x => L(x)) : ['svc_lab', 'svc_rad', 'svc_pharm', 'svc_ins', 'svc_park'].map(k => t(k))).map(x => '<span class="tag gray">' + icon('check') + esc(x) + '</span>').join('') + '</div></div>' +
      '<div class="foot"><span>' + t('footer_note') + '</span><a href="' + B.website + '" target="_blank" rel="noopener">' + t('footer_link') + ' ' + icon('external') + '</a></div>' +
      '</section>';
  }

  function vClinics() {
    return '<section class="view stack">' +
      '<div class="page-head"><h1>' + t('clinics_title') + '</h1></div>' +
      '<div class="notice">' + icon('chat') + '<span>' + t('clinics_sub') + '</span></div>' +
      '<div class="notice amber">' + icon('help') + '<span>' + t('sample_docs') + '</span></div>' +
      '<div class="search">' + icon('search') + '<input class="input" id="docSearch" type="search" placeholder="' + esc(t('search_doc')) + '" value="' + esc(S.clinicQ) + '"></div>' +
      specChips(S.clinicSpec, 'cspec') +
      '<div class="stack" id="docList"></div></section>';
  }
  function renderDocList() {
    const el = document.getElementById('docList'); if (!el) return;
    const q = S.clinicQ.trim().toLowerCase();
    const list = visibleDoctors().filter(d => (S.clinicSpec === 'all' || d.spec === S.clinicSpec) &&
      (!q || [d.name.ar, d.name.en, d.title.ar, d.title.en, spec(d.spec).name.ar, spec(d.spec).name.en].join(' ').toLowerCase().includes(q)));
    el.innerHTML = list.length ? list.map(d => {
      const s = spec(d.spec);
      return '<article class="card doc"><div class="doc-top">' + avatar(d) + '<div><b>' + esc(L(d.name)) + '</b><span>' + esc(L(d.title)) + '</span></div></div>' +
        '<div class="wq-top"><span class="tag" style="background:color-mix(in srgb,' + s.color + ' 12%,#fff);color:' + s.color + '">' + icon(s.icon) + esc(L(s.name)) + '</span><span class="tag gray">' + t('years', { n: d.years }) + '</span></div>' +
        '<div class="doc-info"><div><small>' + t('clinic_days') + '</small><b>' + esc(L(d.days)) + '</b></div><div><small>' + t('languages') + '</small><b>' + esc(L(d.langs)) + '</b></div></div>' +
        '<div class="doc-actions"><a class="btn sm" href="' + B.bookingUrl + '" target="_blank" rel="noopener" data-track="book">' + icon('calendar') + t('book_site') + '</a>' +
        '<button class="btn sm ghost" data-act="specqa" data-spec="' + d.spec + '">' + icon('help') + t('spec_qa') + '</button></div></article>';
    }).join('') : '<p class="hint" style="text-align:center;padding:24px">' + t('no_results') + '</p>';
  }

  function vBody() {
    return '<section class="view">' +
      '<div class="page-head"><h1>' + t('body_title') + '</h1><p>' + t('body_sub') + '</p></div>' +
      '<div class="stack"><div class="search">' + icon('search') + '<input class="input" id="faqSearch" type="search" placeholder="' + esc(t('search_q')) + '" value="' + esc(S.bodyQ) + '"></div>' +
      specChips(S.bodySpec, 'bspec') + '</div>' +
      '<div id="vidRow"></div>' +
      '<div style="margin-top:16px" id="faqList"></div>' +
      '<div class="notice amber" style="margin-top:16px">' + icon('shield') + '<span>' + t('body_disclaimer') + '</span></div></section>';
  }
  function renderFaqs() {
    const el = document.getElementById('faqList'); if (!el) return;
    const q = S.bodyQ.trim().toLowerCase();
    const list = allFaqs().filter(f => (S.bodySpec === 'all' || f.spec === S.bodySpec) &&
      (!q || [f.q.ar, f.q.en, f.a.ar, f.a.en].join(' ').toLowerCase().includes(q)));
    const vids = list.filter(f => f.video);
    document.getElementById('vidRow').innerHTML = vids.length ? '<div class="sec-title"><h2>' + t('videos_title') + '</h2></div><div class="hscroll">' + vids.map(f => {
      const s = spec(f.spec), d = doctor(f.doctor);
      return '<button class="vtile" data-act="faqvideo" data-id="' + f.id + '"><span class="thumb" style="--c:' + s.color + '">' + avatar(d) + '<span class="dur">' + f.video + '</span><span class="playb">' + icon('play') + '</span></span><b>' + esc(L(f.q)) + '</b></button>';
    }).join('') + '</div>' : '';
    el.innerHTML = list.length ? list.map(f => {
      const s = spec(f.spec), d = doctor(f.doctor), open = !!S.open[f.id];
      return '<div class="faq ' + (open ? 'open' : '') + '"><button class="faq-q" data-act="faq" data-id="' + f.id + '" aria-expanded="' + open + '">' +
        '<span class="sp" style="--c:' + s.color + '">' + icon(s.icon) + '</span><span>' + esc(L(f.q)) + (f.video ? ' <span class="tag blue" style="margin-inline-start:4px">' + icon('video') + t('video') + '</span>' : '') + '</span>' + icon('down', 'chev') + '</button>' +
        '<div class="faq-a"><div><div class="inner"><p>' + esc(L(f.a)) + '</p>' +
        (f.video ? '<button class="btn sm soft" style="justify-self:start" data-act="faqvideo" data-id="' + f.id + '">' + icon('play') + t('watch') + ' · ' + f.video + '</button>' : '') +
        (d ? '<div class="reviewer">' + avatar(d, 30) + '<span>' + t('reviewed_by', { d: esc(L(d.name)) }) + '</span></div>' : '') +
        '</div></div></div></div>';
    }).join('') : '<p class="hint" style="text-align:center;padding:24px">' + t('no_results') + '</p>';
  }

  function vWeekly() {
    const A = S.ask, items = weeklyItems();
    const form = A.sent
      ? '<div class="card done"><span class="badge">' + icon('check') + '</span><h2>' + t('q_sent_title') + '</h2><p>' + t('q_sent_body', { id: '<span class="refno">' + A.sent + '</span>' }) + '</p><button class="btn ghost" data-act="askagain">' + t('ask_another') + '</button></div>'
      : '<form class="card form" id="askForm" novalidate>' +
        '<div class="field"><label for="qText">' + t('q_label') + '</label><textarea class="textarea" id="qText" maxlength="300" placeholder="' + esc(t('q_ph')) + '">' + esc(A.text) + '</textarea>' +
        '<div class="counter"><span id="qCount">' + A.text.length + '</span>/300</div><p class="hint">' + icon('lock') + ' ' + t('no_personal') + '</p></div>' +
        '<div class="field"><label for="qSpec">' + t('spec_label') + '</label><select class="select" id="qSpec"><option value="">' + t('spec_unknown') + '</option>' + specOptions(A.spec) + '</select></div>' +
        '<label class="switch"><span>' + t('notify_label') + '</span><input type="checkbox" id="qNotify"' + (A.notify ? ' checked' : '') + '></label>' +
        '<div id="qPhoneWrap"' + (A.notify ? '' : ' hidden') + '><input class="input" id="qPhone" type="tel" inputmode="numeric" dir="ltr" maxlength="10" placeholder="' + esc(t('phone_ph')) + '" value="' + esc(A.phone) + '"></div>' +
        '<div class="consent-box"><label class="check"><input type="checkbox" id="qConsent"' + (A.consent ? ' checked' : '') + '><span>' + t('consent_pub') + '</span></label><button type="button" class="linkbtn" data-act="consent" data-for="ask">' + t('read_consent') + '</button></div>' +
        '<p class="err" id="qErr" hidden></p>' +
        '<button class="btn block" type="submit">' + icon('send', 'flip') + t('send_q') + '</button></form>';
    return '<section class="view">' +
      '<div class="page-head"><h1>' + t('weekly_title') + '</h1><p>' + t('weekly_sub') + '</p></div>' +
      '<div class="steps">' + ['step1', 'step2', 'step3'].map((k, i) => '<div class="step"><span class="n">' + (i + 1) + '</span>' + t(k) + '</div>').join('') + '</div>' +
      '<div class="sec-title" id="askAnchor"><h2>' + t('ask_title') + '</h2></div>' + form +
      '<div class="sec-title"><h2>' + t('answered') + '</h2></div><div class="stack">' + items.map(vcard).join('') + '</div></section>';
  }

  function vFeedback() {
    const F = S.fb;
    if (F.sent) {
      return '<section class="view"><div class="card done" style="margin-top:12px"><span class="badge">' + icon('check') + '</span><h2>' + t('fb_sent_title') + '</h2><p>' + t('fb_sent_body', { id: '<span class="refno">' + F.sent + '</span>' }) + '</p>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center"><button class="btn" data-go="home">' + t('back_home') + '</button><button class="btn ghost" data-act="fbagain">' + t('fb_again') + '</button></div></div></section>';
    }
    const units = APP.specialties.concat(APP.otherUnits);
    return '<section class="view">' +
      '<div class="page-head"><h1>' + t('fb_title') + '</h1><p>' + t('fb_sub') + '</p></div>' +
      '<form class="card form" id="fbForm" novalidate>' +
        '<div class="field"><span class="label">' + t('rate_label') + '</span><div class="rating" role="radiogroup">' +
          [0, 1, 2, 3, 4].map(i => '<button type="button" role="radio" aria-checked="' + (F.rating === i + 1) + '" class="rate ' + (F.rating === i + 1 ? 'on' : '') + '" style="--rc:' + FACE_COL[i] + '" data-act="rate" data-v="' + (i + 1) + '">' + face(i) + t('r' + (i + 1)) + '</button>').join('') +
        '</div></div>' +
        '<div class="field"><label for="fbClinic">' + t('clinic_label') + '</label><select class="select" id="fbClinic"><option value="">' + t('choose') + '</option>' +
          units.map(u => '<option value="' + u.id + '"' + (F.clinic === u.id ? ' selected' : '') + '>' + esc(L(u.name)) + '</option>').join('') + '</select></div>' +
        (VOICE ? '<div class="seg" role="tablist"><button type="button" class="' + (F.mode === 'voice' ? 'on' : '') + '" data-act="mode" data-v="voice">' + icon('mic') + t('tab_voice') + '</button><button type="button" class="' + (F.mode === 'text' ? 'on' : '') + '" data-act="mode" data-v="text">' + icon('pen') + t('tab_text') + '</button></div>' : '') +
        '<div class="consent-box"><h3>' + icon('shield') + t('consent_title') + '</h3><p>' + t(F.mode === 'voice' ? 'consent_short_voice' : 'consent_short_text') + '</p>' +
          '<label class="check"><input type="checkbox" id="fbConsent"' + (F.consent ? ' checked' : '') + '><span>' + t(F.mode === 'voice' ? 'consent_check_voice' : 'consent_check_text') + '</span></label>' +
          '<button type="button" class="linkbtn" data-act="consent" data-for="fb">' + t('read_consent') + '</button></div>' +
        (F.mode === 'voice' ? '<div id="recBox"></div>' : '<div class="field"><textarea class="textarea" id="fbText" maxlength="1000" placeholder="' + esc(t('text_ph')) + '">' + esc(F.text) + '</textarea></div>') +
        '<label class="switch"><span><b style="font-weight:600">' + t('anon_label') + '</b><br><span class="hint">' + t('anon_hint') + '</span></span><input type="checkbox" id="fbAnon"' + (F.anon ? ' checked' : '') + '></label>' +
        '<div class="contact-fields" id="fbContact"' + (F.anon ? ' hidden' : '') + '><input class="input" id="fbName" placeholder="' + esc(t('name_ph')) + '" value="' + esc(F.name) + '"><input class="input" id="fbPhone" type="tel" inputmode="numeric" dir="ltr" maxlength="10" placeholder="' + esc(t('phone_ph')) + '" value="' + esc(F.phone) + '"></div>' +
        '<p class="err" id="fbErr" hidden></p>' +
        '<button class="btn block" type="submit">' + icon('send', 'flip') + t('send_fb') + '</button>' +
      '</form></section>';
  }

  /* ---------- voice recorder ---------- */
  const R = { mr: null, stream: null, ctx: null, analyser: null, raf: 0, timer: 0, start: 0, sim: false, recording: false };
  const BARS = 32, MAX_SEC = 60;
  const fmtSec = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  const staticWave = () => Array.from({ length: BARS }, (_, i) => '<span style="height:' + Math.round(8 + Math.abs(Math.sin(i * 1.7) * Math.cos(i * .45)) * 24) + 'px"></span>').join('');

  function renderRecorder() {
    const box = document.getElementById('recBox'); if (!box) return;
    const F = S.fb;
    if (R.recording) {
      box.innerHTML = '<div class="recorder"><div class="wave" id="wave">' + '<span></span>'.repeat(BARS) + '</div><div class="rec-time" id="recTime">0:00</div>' +
        '<button type="button" class="mic rec" data-act="recstop" aria-label="stop">' + icon('stop') + '</button><div class="rec-label">' + t('rec_on') + '</div></div>';
      return;
    }
    if (F.audio || F.simulated) {
      box.innerHTML = '<div class="playback"><b style="display:flex;align-items:center;gap:8px;color:var(--ok)">' + icon('check') + t('rec_done') + ' · <span dir="ltr">' + fmtSec(F.dur) + '</span></b>' +
        (F.audio ? '<audio controls src="' + F.audio + '"></audio>' : '<div class="fake-player"><span class="tag warn">' + t('rec_demo') + '</span><div class="wave">' + staticWave() + '</div></div>') +
        '<button type="button" class="btn sm ghost" data-act="recredo">' + icon('reset') + t('rec_redo') + '</button></div>';
      return;
    }
    if (F.micError) {
      box.innerHTML = '<div class="notice amber">' + icon('mic') + '<span>' + t('mic_denied') + '</span></div><div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap"><button type="button" class="btn sm soft" data-act="simulate">' + icon('play') + t('simulate') + '</button><button type="button" class="btn sm ghost" data-act="mode" data-v="text">' + icon('pen') + t('write_instead') + '</button></div>';
      return;
    }
    box.innerHTML = '<div class="recorder"><div class="wave idle">' + staticWave() + '</div>' +
      '<button type="button" class="mic" data-act="recstart" aria-label="' + esc(t('rec_tap')) + '"' + (F.consent ? '' : ' disabled') + '>' + icon('mic') + '</button>' +
      '<div class="rec-label">' + (F.consent ? '<b style="color:var(--ink)">' + t('rec_tap') + '</b> · ' + t('rec_max') : icon('lock') + ' ' + t('rec_locked')) + '</div></div>';
  }

  async function startRec(simulate) {
    const F = S.fb;
    R.sim = !!simulate || !!APP.hosted;
    if (!R.sim) {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) { F.micError = true; renderRecorder(); return; }
      try { R.stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
      catch (e) { F.micError = true; renderRecorder(); return; }
      const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'].find(m => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m));
      const chunks = [];
      R.mr = new MediaRecorder(R.stream, mime ? { mimeType: mime } : undefined);
      R.mr.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
      R.mr.onstop = () => {
        const blob = new Blob(chunks, { type: R.mr.mimeType || mime || 'audio/webm' });
        const fr = new FileReader();
        fr.onload = () => { S.fb.audio = fr.result; renderRecorder(); };
        fr.readAsDataURL(blob);
        R.stream.getTracks().forEach(tr => tr.stop());
      };
      R.mr.start(250);
      try {
        R.ctx = new (window.AudioContext || window.webkitAudioContext)();
        const src = R.ctx.createMediaStreamSource(R.stream);
        R.analyser = R.ctx.createAnalyser(); R.analyser.fftSize = 64; src.connect(R.analyser);
      } catch (e) { R.analyser = null; }
    }
    R.recording = true; R.start = Date.now(); F.micError = false;
    renderRecorder();
    const data = new Uint8Array(32);
    const loop = () => {
      const bars = document.querySelectorAll('#wave span');
      if (R.analyser) R.analyser.getByteFrequencyData(data);
      const now = Date.now() / 160;
      bars.forEach((b, i) => {
        const v = R.analyser ? data[Math.min(31, Math.floor(i * .8) + 1)] / 255 : (0.25 + 0.6 * Math.abs(Math.sin(now + i * .6) * Math.sin(now * .7 + i * .25)));
        b.style.height = Math.round(6 + v * 38) + 'px';
      });
      R.raf = requestAnimationFrame(loop);
    };
    loop();
    R.timer = setInterval(() => {
      const s = (Date.now() - R.start) / 1000;
      const el = document.getElementById('recTime'); if (el) el.textContent = fmtSec(s);
      if (s >= MAX_SEC) stopRec();
    }, 200);
    track('click', { f: 'record' });
  }
  function stopRec() {
    if (!R.recording) return;
    R.recording = false;
    cancelAnimationFrame(R.raf); clearInterval(R.timer);
    S.fb.dur = Math.max(1, Math.round((Date.now() - R.start) / 1000));
    if (R.sim) { S.fb.simulated = true; renderRecorder(); }
    else { renderRecorder(); if (R.mr && R.mr.state !== 'inactive') R.mr.stop(); }
    if (R.ctx) { try { R.ctx.close(); } catch (e) {} R.ctx = null; }
  }

  /* ---------- sheets ---------- */
  function openConsent(onAgree) {
    const items = [['cf_what', 'inbox'], ['cf_why', 'help'], ['cf_who', 'lock'], ['cf_keep', 'clock'], ['cf_rights', 'shield'], ['cf_pub', 'eye']];
    const m = modal('<div class="cform"><h2>' + t('cf_title') + '</h2><ol>' +
      items.map(([k, ic]) => '<li><span class="n">' + icon(ic) + '</span><div><b>' + t(k + '_t') + '</b><p>' + t(k) + '</p></div></li>').join('') +
      '</ol><p class="ver">' + t('cf_version') + '</p><p class="demo">' + t('cf_demo') + '</p>' +
      '<button class="btn block" data-agree>' + icon('check') + t('cf_agree') + '</button></div>');
    m.el.querySelector('[data-agree]').addEventListener('click', () => { onAgree(); m.close(); });
  }

  function openVideo(item) {
    const s = spec(item.spec), d = doctor(item.doctor), yt = APP.hosted ? null : Q.youtubeId(item.videoUrl);
    const summary = L(item.summary || item.a);
    const caption = summary.split(/(?<=[.؟?])\s/)[0];
    const m = modal('<div class="vsheet">' +
      '<div class="player" id="player" style="--c:' + s.color + '">' +
        (yt ? '<iframe src="https://www.youtube-nocookie.com/embed/' + yt + '?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="video"></iframe>'
            : '<div class="center">' + avatar(d) + '<button class="bigplay" data-act="fakeplay" aria-label="play">' + icon('play') + '</button><div class="eq">' + '<span></span>'.repeat(5).replace(/<span>/g, (x, i) => '<span style="animation-delay:' + (Math.random() * .8).toFixed(2) + 's">') + '</div></div>' +
              '<div class="caption">' + esc(caption) + '</div><div class="bar"><i id="pbar"></i></div>') +
      '</div>' +
      '<h3>' + esc(L(item.q)) + '</h3>' +
      '<div class="docline">' + avatar(d) + '<div><b>' + esc(L(d.name)) + '</b><small>' + esc(L(d.title)) + '</small></div></div>' +
      (summary ? '<div class="summary"><b>' + t('answer_summary') + '</b><p>' + esc(summary) + '</p></div>' : '') +
      (!yt && item.videoUrl ? '<a class="btn sm soft" style="margin-top:12px" href="' + esc(item.videoUrl) + '" target="_blank" rel="noopener">' + icon('external') + t('watch_ext') + '</a>' : '') +
      (yt || item.videoUrl ? '' : '<p class="demo-note">' + icon('video') + t('video_note') + '</p>') +
      (item.sample ? '<p class="demo-note">' + icon('video') + t('video_sample') + '</p>' : '') +
      '</div>');
    const btn = m.el.querySelector('[data-act="fakeplay"]');
    if (btn) btn.addEventListener('click', e => {
      e.stopPropagation();
      const p = m.el.querySelector('#player'), bar = m.el.querySelector('#pbar');
      p.classList.add('playing');
      bar.style.transition = 'none'; bar.style.width = '0';
      requestAnimationFrame(() => { bar.style.transition = 'width 12s linear'; bar.style.width = '100%'; });
      setTimeout(() => p.classList.remove('playing'), 12000);
    });
    track('click', { f: 'video' });
  }

  /* ---------- submit handlers ---------- */
  function showErr(id, key) { const el = document.getElementById(id); el.textContent = t(key); el.hidden = false; el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  const phoneOk = p => /^05\d{8}$/.test(p.trim());

  function submitAsk(e) {
    e.preventDefault();
    const A = S.ask;
    if (!A.text.trim()) return showErr('qErr', 'err_q');
    if (A.notify && !phoneOk(A.phone)) return showErr('qErr', 'err_phone');
    if (!A.consent) return showErr('qErr', 'err_consent');
    const id = ref('Q'), now = Date.now(), lang = Q.getLang();
    Store.push('questions', { id, t: now, text: A.text.trim(), spec: A.spec, notify: A.notify, phone: A.notify ? A.phone.trim() : '', consentPub: true, status: 'pending', lang });
    Store.push('consents', { id: 'C-' + id.slice(2), kind: 'question', ref: id, version: '1.0', t: now, lang, contact: A.notify });
    track('submit_question', { id });
    S.ask = freshAsk(); S.ask.sent = id;
    render();
    const a = document.getElementById('askAnchor'); if (a) a.scrollIntoView({ behavior: 'smooth' });
  }

  function submitFb(e) {
    e.preventDefault();
    const F = S.fb;
    if (!F.rating) return showErr('fbErr', 'err_rating');
    if (!F.consent) return showErr('fbErr', 'err_fb_consent');
    if (F.mode === 'voice' && !(F.audio || F.simulated)) return showErr('fbErr', R.recording ? 'rec_on' : 'err_audio');
    if (F.mode === 'text' && !F.text.trim()) return showErr('fbErr', 'err_text');
    if (!F.anon && !phoneOk(F.phone)) return showErr('fbErr', 'err_contact');
    const id = ref('FB'), now = Date.now(), lang = Q.getLang();
    const item = { id, t: now, rating: F.rating, clinic: F.clinic, type: F.mode, dur: F.dur, audio: F.mode === 'voice' ? F.audio : null, simulated: F.simulated,
      text: F.mode === 'text' ? F.text.trim() : '', anon: F.anon, name: F.anon ? '' : F.name.trim(), phone: F.anon ? '' : F.phone.trim(), status: 'new', lang };
    if (!Store.push('feedback', item)) { item.audio = null; item.audioDropped = true; Store.push('feedback', item); }
    Store.push('consents', { id: 'C-' + id.slice(3), kind: F.mode, ref: id, version: '1.0', t: now, lang, contact: !F.anon });
    track('submit_feedback', { id, type: F.mode });
    S.fb = freshFb(); S.fb.sent = id;
    render(); window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- render & routing ---------- */
  function renderTabs() {
    tabbar.innerHTML = TABS.map(([r, ic, k]) => '<button class="tab ' + (S.route === r ? 'on' : '') + '" data-go="' + r + '"' + (S.route === r ? ' aria-current="page"' : '') + '><span class="ic">' + icon(ic) + '</span>' + t(k) + '</button>').join('');
  }
  function render() {
    if (R.recording) stopRec();
    const V = { home: vHome, clinics: vClinics, body: vBody, weekly: vWeekly, feedback: vFeedback }[S.route] || vHome;
    view.innerHTML = V();
    renderTabs();
    if (S.route === 'clinics') renderDocList();
    if (S.route === 'body') renderFaqs();
    if (S.route === 'feedback') renderRecorder();
    document.getElementById('langBtn').textContent = t('lang_switch');
  }
  function fromHash() {
    const [r, p] = (location.hash.replace('#', '') || 'home').split('/');
    const route = TABS.some(x => x[0] === r) ? r : 'home';
    if (route === 'body' && p) S.bodySpec = p;
    const changed = route !== S.route;
    S.route = route;
    render();
    if (changed) { window.scrollTo(0, 0); track('view', { route }); }
  }
  function go(route) { if (location.hash === '#' + route) fromHash(); else location.hash = route; }

  /* ---------- events ---------- */
  document.addEventListener('click', e => {
    const tr = e.target.closest('[data-track]'); if (tr) track('click', { f: tr.dataset.track });
    const g = e.target.closest('[data-go]'); if (g) { e.preventDefault(); go(g.dataset.go); return; }
    const a = e.target.closest('[data-act]'); if (!a) return;
    const act = a.dataset.act, F = S.fb;
    switch (act) {
      case 'cspec': S.clinicSpec = a.dataset.spec; view.querySelectorAll('[data-act="cspec"]').forEach(c => c.classList.toggle('on', c === a)); renderDocList(); break;
      case 'bspec': S.bodySpec = a.dataset.spec; view.querySelectorAll('[data-act="bspec"]').forEach(c => c.classList.toggle('on', c === a)); renderFaqs(); break;
      case 'specqa': S.bodySpec = a.dataset.spec; go('body'); break;
      case 'faq': S.open[a.dataset.id] = !S.open[a.dataset.id]; a.closest('.faq').classList.toggle('open'); a.setAttribute('aria-expanded', S.open[a.dataset.id]); if (S.open[a.dataset.id]) track('click', { f: 'faq' }); break;
      case 'faqvideo': { const f = allFaqs().find(x => x.id === a.dataset.id); openVideo(Object.assign({}, f, { summary: f.a })); break; }
      case 'wvideo': openVideo(weeklyItems().find(x => x.id === a.dataset.id)); break;
      case 'consent': openConsent(() => {
        if (a.dataset.for === 'ask') { S.ask.consent = true; const c = document.getElementById('qConsent'); if (c) c.checked = true; }
        else { F.consent = true; const c = document.getElementById('fbConsent'); if (c) c.checked = true; renderRecorder(); }
      }); break;
      case 'askagain': S.ask = freshAsk(); render(); break;
      case 'fbagain': S.fb = freshFb(); render(); break;
      case 'rate': F.rating = +a.dataset.v; view.querySelectorAll('.rate').forEach(r => { const on = +r.dataset.v === F.rating; r.classList.toggle('on', on); r.setAttribute('aria-checked', on); }); break;
      case 'mode': if (R.recording) stopRec(); F.mode = a.dataset.v; render(); break;
      case 'recstart': startRec(false); break;
      case 'recstop': stopRec(); break;
      case 'simulate': startRec(true); break;
      case 'recredo': F.audio = null; F.simulated = false; F.dur = 0; renderRecorder(); break;
    }
  });

  view.addEventListener('input', e => {
    const el = e.target, A = S.ask, F = S.fb;
    switch (el.id) {
      case 'docSearch': S.clinicQ = el.value; renderDocList(); break;
      case 'faqSearch': S.bodyQ = el.value; renderFaqs(); break;
      case 'qText': A.text = el.value; document.getElementById('qCount').textContent = el.value.length; break;
      case 'qPhone': A.phone = el.value.replace(/\D/g, ''); el.value = A.phone; break;
      case 'fbText': F.text = el.value; break;
      case 'fbName': F.name = el.value; break;
      case 'fbPhone': F.phone = el.value.replace(/\D/g, ''); el.value = F.phone; break;
    }
    const err = view.querySelector('.err'); if (err) err.hidden = true;
  });
  view.addEventListener('change', e => {
    const el = e.target, A = S.ask, F = S.fb;
    switch (el.id) {
      case 'qSpec': A.spec = el.value; break;
      case 'qNotify': A.notify = el.checked; document.getElementById('qPhoneWrap').hidden = !el.checked; break;
      case 'qConsent': A.consent = el.checked; break;
      case 'fbClinic': F.clinic = el.value; break;
      case 'fbConsent': F.consent = el.checked; renderRecorder(); break;
      case 'fbAnon': F.anon = el.checked; document.getElementById('fbContact').hidden = el.checked; break;
    }
  });
  view.addEventListener('submit', e => {
    if (e.target.id === 'askForm') submitAsk(e);
    if (e.target.id === 'fbForm') submitFb(e);
  });

  document.getElementById('langBtn').addEventListener('click', () => Q.setLang(Q.getLang() === 'ar' ? 'en' : 'ar'));
  document.addEventListener('langchange', render);
  window.addEventListener('hashchange', fromHash);
  window.addEventListener('storage', e => { if (e.key === 'qrp_lang' && e.newValue) Q.setLang(JSON.parse(e.newValue)); });
  window.addEventListener('storage', e => { if (e.key && e.key.startsWith('qrp_') && !['qrp_events', 'qrp_lang'].includes(e.key) && ['weekly', 'body', 'clinics', 'home'].includes(S.route)) render(); });

  Q.trackVisit();
  Q.applyLang();
  S.route = '__init';
  fromHash();
})();
