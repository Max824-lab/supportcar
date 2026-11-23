/* =====================================================================
   SUPPORT CAR — RÉGLAGES (à modifier ici uniquement)
   ===================================================================== */
const CONFIG = {
  // Lien de la plateforme de prise de rendez-vous. Laisse vide ('') tant qu'elle n'est pas prête :
  // les boutons « Réserver » descendent alors vers la section Réservation du site.
  BOOKING_URL: '',
  PHONE: '+33768831448',
  PHONE_LABEL: '07 68 83 14 48',
  WHATSAPP: '33768831448',
  PRICES: { nettoyage: 149, complet: 189, polissage: 450, ceramique: 300 },
  // Service qui envoie les demandes de devis (avec photos) par e-mail.
  // Après la 1re demande, FormSubmit envoie un e-mail d'activation à cette adresse : il suffit de cliquer « Activate ».
  QUOTE_ENDPOINT: 'https://formsubmit.co/contact@supportcar.fr'
};

(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- Liens « Réserver » ---------- */
  const goBook = () => {
    if (CONFIG.BOOKING_URL) window.open(CONFIG.BOOKING_URL, '_blank', 'noopener');
    else $('#reservation').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };
  if (CONFIG.BOOKING_URL) {
    $$('[data-book]').forEach(a => { a.href = CONFIG.BOOKING_URL; a.target = '_blank'; a.rel = 'noopener'; });
    const alt = $('.booking__alt');
    if (alt) alt.insertAdjacentHTML('afterbegin', `<a href="${esc(CONFIG.BOOKING_URL)}" target="_blank" rel="noopener" class="btn btn--blue">📅 Réserver en ligne</a>`);
  }

  /* ---------- Réservation Klinter : message de secours si le module ne s'affiche pas ---------- */
  const kw = $('[data-kltr-widget="booking"]'), fb = $('#bookingFallback');
  if (kw && fb) {
    const check = () => { const ok = kw.children.length > 0 || kw.shadowRoot || kw.offsetHeight > 40; fb.hidden = !!ok; return ok; };
    const o = new IntersectionObserver(([e]) => { if (!e.isIntersecting) return; o.disconnect(); setTimeout(check, 6000); });
    o.observe(kw);
    new MutationObserver(check).observe(kw, { childList: true, subtree: true });
  }

  /* ---------- Onde au clic sur les boutons ---------- */
  if (!reduce) document.addEventListener('pointerdown', e => {
    const el = e.target.closest('.btn, .bar__cta, .bar__btn, .choice, .contact-fab, .helper, .gbadge, a.hs');
    if (!el) return;
    const r = el.getBoundingClientRect(), size = Math.max(r.width, r.height) * 2.2;
    const s = document.createElement('span'); s.className = 'ripple';
    s.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left}px;top:${e.clientY - r.top}px`;
    el.appendChild(s); setTimeout(() => s.remove(), 700);
  }, { passive: true });

  /* ---------- Schéma nettoyage : points ↔ liste, intérieur / extérieur ---------- */
  const EXT_HOTS = [ // positions en % sur assets/exterieur.jpg
    ['e1', 'Nettoyage des jantes', 70.9, 66, 'l'], ['e2', 'Shampoing de la carrosserie', 87.8, 52, 'l'], ['e4', 'Vitres extérieures', 55.1, 41, 'l']
  ];
  const initSchema = sc => {
    const so = new IntersectionObserver(([e]) => { if (e.isIntersecting) { sc.classList.add('in'); so.disconnect(); } }, { threshold: .35 });
    so.observe(sc);
    $$('.hot', sc).forEach(el => {
      const y = parseFloat(el.style.getPropertyValue('--y')) || 0;
      el.style.setProperty('--d', (0.15 + y / 100 * 0.9).toFixed(2) + 's');
    });
  };
  const extPane = $('.schema--ext');
  if (extPane) {
    const im = new Image();
    im.onload = () => {
      extPane.classList.add('has-photo');
      extPane.innerHTML = '<img src="assets/exterieur.jpg" alt="Extérieur après nettoyage : les zones traitées sont indiquées" width="' + im.naturalWidth + '" height="' + im.naturalHeight + '">' +
        EXT_HOTS.map(([n, lab, x, y, side]) => `<button type="button" class="hot hot--${side}" style="--x:${x}%;--y:${y}%" data-hot="${n}" aria-label="${lab}"><i></i><span>${lab}</span></button>`).join('');
      initSchema(extPane); bindHots();
    };
    im.src = 'assets/exterieur.jpg';
  }
  $$('.schema').forEach(initSchema);
  const bindHots = () => {
    const items = $$('[data-hot]');
    const on = n => items.forEach(el => el.classList.toggle('is-on', el.dataset.hot === n));
    items.forEach(el => {
      if (el.dataset.bound) return; el.dataset.bound = 1;
      el.addEventListener('mouseenter', () => on(el.dataset.hot));
      el.addEventListener('mouseleave', () => on(null));
      el.addEventListener('click', () => on(el.classList.contains('is-on') ? null : el.dataset.hot));
    });
  };
  bindHots();
  const sw = $('#iosSwitch');
  if (sw) {
    const tog = $('.ios__sw', sw);
    const setPane = k => {
      tog.setAttribute('aria-checked', k === 'ext');
      $$('.offer[data-offer]').forEach(o => { const on = o.dataset.offer === k; o.classList.toggle('is-on', on); o.setAttribute('aria-checked', on); });
      const cta = $('#offerCta'); if (cta) cta.textContent = k === 'ext' ? 'Réserver le nettoyage complet' : 'Réserver le nettoyage intérieur';
      $$('.ios__lbl', sw).forEach(l => l.classList.toggle('is-on', l.dataset.seg === k));
      $$('[data-pane]').forEach(p => {
        const show = p.dataset.pane === k;
        if (p.hidden === !show) return;
        p.hidden = !show;
        if (show) { p.classList.remove('pane-in'); void p.offsetWidth; p.classList.add('pane-in', 'in'); }
      });
    };
    tog.addEventListener('click', () => setPane(tog.getAttribute('aria-checked') === 'true' ? 'int' : 'ext'));
    $$('.ios__lbl', sw).forEach(l => l.addEventListener('click', () => setPane(l.dataset.seg)));
    $$('.offer[data-offer]').forEach(o => o.addEventListener('click', () => setPane(o.dataset.offer)));
  }

  /* ---------- Services sur devis : déplié ---------- */
  $$('.card--svc').forEach(card => {
    const t = $('.svc__toggle', card), more = $('.svc__more', card);
    t.addEventListener('click', () => {
      const open = more.hidden; more.hidden = !open; t.setAttribute('aria-expanded', open);
      t.firstChild.textContent = open ? 'Masquer le détail ' : 'Découvrir le service ';
    });
  });

  /* Accueil : ouvrir le détail du service visé */
  $$('a.hs[data-open]').forEach(l => l.addEventListener('click', () => {
    const card = $(`.card--svc[data-svc="${l.dataset.open}"]`); if (!card) return;
    const t = $('.svc__toggle', card), more = $('.svc__more', card);
    if (more.hidden) setTimeout(() => t.click(), 450);
  }));

  /* ---------- Formulaire de devis ---------- */
  const Q = $('#quote'), QF = $('#quoteForm');
  let qStep = 1; const Q_STEPS = 4;
  const qShow = n => {
    qStep = n;
    $$('.qstep', QF).forEach(s => { s.hidden = +s.dataset.step !== n; });
    $('#quoteBar').style.width = (Math.min(n, Q_STEPS) / Q_STEPS * 100) + '%';
    $('#quoteStepLbl').textContent = n <= Q_STEPS ? `Étape ${n} sur ${Q_STEPS}` : 'Récapitulatif';
    $('#quotePrev').hidden = n === 1;
    $('#quoteNext').hidden = n > Q_STEPS;
    $('#quoteNext').textContent = n === Q_STEPS ? 'Voir ma demande' : 'Continuer';
    QF.scrollTop = 0;
  };
  const qValid = () => {
    const step = $(`.qstep[data-step="${qStep}"]`, QF); let ok = true;
    $$('[required]', step).forEach(inp => {
      if (inp.type === 'radio') {
        const grp = $$(`input[name="${inp.name}"]`, step), good = grp.some(r => r.checked);
        const box = inp.closest('.qchips') || step; box.classList.toggle('err', !good); if (!good) ok = false;
      } else {
        const good = inp.value.trim() !== '' && inp.checkValidity();
        inp.closest('.qfield').classList.toggle('err', !good); if (!good) ok = false;
      }
    });
    return ok;
  };
  const qRecap = () => {
    const fd = new FormData(QF), g = k => (fd.getAll(k).join(', ') || '—');
    return `Demande de devis Support Car
Prestation : ${g('prestation')}
Véhicule : ${g('marque')} ${fd.get('modele') || ''} · ${g('annee')} · ${g('couleur')} · ${g('gabarit')}
État : ${g('defauts')}
Protection existante : ${g('protection')}
Nom : ${g('nom')}
Téléphone : ${g('tel')}
E-mail : ${g('email')}
Ville : ${g('ville')}
Précisions : ${g('message')}`;
  };
  /* Photos jointes à la demande de devis */
  let qPhotos = [];
  const MAX_PHOTOS = 6;
  const drawThumbs = () => {
    const box = $('#qThumbs'); box.innerHTML = '';
    qPhotos.forEach((f, i) => {
      const d = document.createElement('div'); d.className = 'qthumb';
      const im = document.createElement('img'); im.alt = ''; im.src = URL.createObjectURL(f); im.onload = () => URL.revokeObjectURL(im.src);
      const x = document.createElement('button'); x.type = 'button'; x.textContent = '✕'; x.setAttribute('aria-label', 'Retirer la photo');
      x.addEventListener('click', e => { e.preventDefault(); qPhotos.splice(i, 1); drawThumbs(); });
      d.append(im, x); box.appendChild(d);
    });
  };
  const addPhotos = list => {
    [...list].filter(f => f.type.startsWith('image/')).forEach(f => { if (qPhotos.length < MAX_PHOTOS) qPhotos.push(f); });
    drawThumbs();
  };
  const qDrop = $('#qDrop'), qFiles = $('#qFiles');
  qFiles.addEventListener('change', () => { addPhotos(qFiles.files); qFiles.value = ''; });
  ['dragenter', 'dragover'].forEach(ev => qDrop.addEventListener(ev, e => { e.preventDefault(); qDrop.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach(ev => qDrop.addEventListener(ev, e => { e.preventDefault(); qDrop.classList.remove('is-over'); }));
  qDrop.addEventListener('drop', e => addPhotos(e.dataTransfer.files));
  const canShareFiles = files => { try { return !!(navigator.canShare && navigator.canShare({ files })); } catch (e) { return false; } };

  const openQuote = key => {
    QF.reset(); $$('.err', QF).forEach(e => e.classList.remove('err'));
    qPhotos = []; drawThumbs();
    const v = key === 'ceramique' ? 'Traitement céramique' : key === 'polissage-ceramique' ? 'Polissage + traitement céramique' : null;
    if (v) { const r = $(`input[name="prestation"][value="${v}"]`, QF); if (r) r.checked = true; }
    Q.hidden = false; document.body.style.overflow = 'hidden';
    qShow(v ? 2 : 1);
    setTimeout(() => { const f = $(`.qstep[data-step="${qStep}"] input`, QF); if (f) f.focus({ preventScroll: true }); }, 300);
  };
  const closeQuote = () => { Q.hidden = true; document.body.style.overflow = ''; };
  $('#quoteNext').addEventListener('click', () => {
    if (!qValid()) return;
    if (qStep === Q_STEPS) {
      const txt = qRecap();
      $('#quoteRecap').textContent = txt;
      const n = qPhotos.length, info = $('#qPhotosInfo');
      info.hidden = !n; info.textContent = `📸 ${n} photo${n > 1 ? 's' : ''} jointe${n > 1 ? 's' : ''}`;
    }
    qShow(qStep + 1);
  });
  $('#quotePrev').addEventListener('click', () => qShow(Math.max(1, qStep - 1)));

  /* Envoi direct de la demande (texte + photos) par e-mail via FormSubmit */
  const shrink = file => new Promise(res => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const max = 1600, k = Math.min(1, max / Math.max(img.width, img.height));
      const cv = document.createElement('canvas'); cv.width = Math.round(img.width * k); cv.height = Math.round(img.height * k);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); URL.revokeObjectURL(url);
      cv.toBlob(b => res(b ? new File([b], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' }) : file), 'image/jpeg', .82);
    };
    img.onerror = () => { URL.revokeObjectURL(url); res(file); };
    img.src = url;
  });
  $('#quoteSend').addEventListener('click', async () => {
    const btn = $('#quoteSend'); btn.disabled = true; $('#quoteSending').hidden = false;
    const fd = new FormData(QF), g = k => (fd.getAll(k).filter(Boolean).join(', ') || '—');
    const f = document.createElement('form');
    f.method = 'POST'; f.action = CONFIG.QUOTE_ENDPOINT; f.enctype = 'multipart/form-data'; f.style.display = 'none';
    const add = (name, value) => { const i = document.createElement('input'); i.type = 'hidden'; i.name = name; i.value = value; f.appendChild(i); };
    add('_subject', `Demande de devis — ${g('prestation')} — ${g('nom')}`);
    add('_template', 'table'); add('_captcha', 'false'); add('_honey', '');
    add('_next', location.href.split('#')[0].split('?')[0] + '?devis=envoye');
    add('Prestation', g('prestation'));
    add('Véhicule', `${g('marque')} ${fd.get('modele') || ''}`.trim());
    add('Année', g('annee')); add('Couleur', g('couleur')); add('Gabarit', g('gabarit'));
    add('Défauts constatés', g('defauts')); add('Protection existante', g('protection'));
    add('Nom', g('nom')); add('Téléphone', g('tel')); add('email', fd.get('email') || ''); add('Ville', g('ville'));
    add('Précisions', g('message'));
    const files = await Promise.all(qPhotos.map(shrink));
    files.forEach((file, i) => {
      const inp = document.createElement('input'); inp.type = 'file'; inp.name = `Photo ${i + 1}`;
      const dt = new DataTransfer(); dt.items.add(file); inp.files = dt.files; f.appendChild(inp);
    });
    document.body.appendChild(f); f.submit();
  });

  /* Retour après envoi : message de confirmation */
  if (/[?&]devis=envoye/.test(location.search)) {
    const t = $('#toast'); t.hidden = false;
    $('button', t).addEventListener('click', () => { t.hidden = true; });
    setTimeout(() => { t.hidden = true; }, 8000);
    history.replaceState(null, '', location.pathname + location.hash);
  }
  $$('[data-qclose]', Q).forEach(b => b.addEventListener('click', closeQuote));
  addEventListener('keydown', e => { if (e.key === 'Escape' && !Q.hidden) closeQuote(); });
  QF.addEventListener('change', e => { const b = e.target.closest('.err'); if (b) b.classList.remove('err'); });
  $$('[data-quote]').forEach(b => b.addEventListener('click', () => openQuote(b.dataset.quote)));

  /* ---------- Liens de la bannière ---------- */
  const navEl = $('#nav'), burger = $('#navBurger');
  const setMenu = o => { navEl.classList.toggle('menu-open', o); burger.setAttribute('aria-expanded', o); };
  burger.addEventListener('click', e => { e.stopPropagation(); setMenu(!navEl.classList.contains('menu-open')); });
  $$('#navLinks a').forEach(l => l.addEventListener('click', () => setMenu(false)));
  document.addEventListener('click', e => { if (!navEl.contains(e.target)) setMenu(false); });
  const navMap = $$('#navLinks a').map(l => [l, $(l.getAttribute('href'))]).filter(([, s]) => s);
  const markNav = () => {
    const y = innerHeight * .35; let cur = null;
    navMap.forEach(([l, s]) => { const r = s.getBoundingClientRect(); if (r.top <= y && r.bottom > y) cur = l; });
    navMap.forEach(([l]) => l.classList.toggle('is-on', l === cur));
  };
  addEventListener('scroll', markNav, { passive: true }); markNav();

  /* ---------- Compteur « + de 500 véhicules nettoyés » ---------- */
  $$('.countup').forEach(el => {
    const to = +el.dataset.to;
    if (reduce) { el.textContent = to; return; }
    el.textContent = '0';
    const o = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; o.disconnect();
      const t0 = performance.now(), d = 1800;
      const step = now => { const p = Math.min(1, (now - t0) / d); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
      setTimeout(() => requestAnimationFrame(step), 450);
    }, { threshold: .5 });
    o.observe(el);
  });

  /* ---------- Bannière + barre mobile ---------- */
  const nav = $('#nav'), bar = $('.bar');
  const onScroll = () => {
    nav.classList.toggle('scrolled', scrollY > 10);
    if (bar) bar.classList.toggle('show', scrollY > 350);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- Apparitions ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .15, rootMargin: '0px 0px -40px 0px' });
  $$('.rv').forEach((el, i) => { el.style.transitionDelay = `${(i % 3) * 80}ms`; io.observe(el); });

  /* ---------- Vidéos : lecture seulement quand visibles ---------- */
  const vio = new IntersectionObserver(es => es.forEach(e => { e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause(); }), { threshold: .1 });
  $$('video').forEach(v => vio.observe(v));

  /* ---------- Avant / après ---------- */
  const initBA = (ba, k) => {
    const r = $('.ba__range', ba); if (!r) return;
    const set = v => ba.style.setProperty('--pos', v + '%');
    r.addEventListener('input', () => set(r.value));
    const o = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || reduce) return; o.disconnect();
      let t = 0;
      const tick = () => { t += .02; const v = 50 + Math.sin(t * Math.PI) * 30; set(v); r.value = v; if (t < 2) requestAnimationFrame(tick); else { set(50); r.value = 50; } };
      setTimeout(tick, 400 + k * 300);
    }, { threshold: .5 });
    o.observe(ba);
  };
  $$('[data-ba]').forEach((ba, k) => {
    // emplacement vide : devient un comparateur dès que les deux photos existent
    if (ba.dataset.srcBefore) {
      const a = new Image(), b = new Image(); let n = 0;
      const ok = () => {
        if (++n < 2) return;
        ba.classList.remove('ba--empty');
        ba.innerHTML = `<img class="ba__img" src="${ba.dataset.srcAfter}" alt="Après"><div class="ba__before"><img class="ba__img" src="${ba.dataset.srcBefore}" alt="Avant"></div><span class="ba__tag">Avant</span><span class="ba__tag ba__tag--r">Après</span><div class="ba__handle"><span>⟷</span></div><input type="range" min="0" max="100" value="50" class="ba__range" aria-label="Comparer avant et après">`;
        initBA(ba, k);
      };
      a.onload = ok; b.onload = ok; a.src = ba.dataset.srcBefore; b.src = ba.dataset.srcAfter;
      return;
    }
    initBA(ba, k);
  });

  /* ---------- Avis : mur en quinconce alimenté en direct par Trustindex ---------- */
  const wall = $('#wall');
  if (wall) {
    const ago = ts => { if (!ts) return ''; const d = Math.floor((Date.now() / 1e3 - ts) / 86400); if (d < 1) return 'aujourd’hui'; if (d < 7) return `il y a ${d} j`; if (d < 30) return `il y a ${Math.floor(d / 7)} sem.`; if (d < 365) return `il y a ${Math.floor(d / 30)} mois`; return `il y a ${Math.floor(d / 365)} an(s)`; };
    const colors = ['#306FDB', '#1d1d1f', '#5AC8FA', '#FF9F0A', '#7a5cff', '#34C759'];
    const card = (r, i) => `<article class="rcard"><div class="stars">${'★'.repeat(r.stars || 5)}</div><p>${esc(r.text).replace(/\n+/g, ' ')}</p><footer><i style="background:${colors[i % colors.length]}">${esc((r.name.trim()[0] || '?').toUpperCase())}</i><div><b>${esc(r.name)}</b><small>${ago(r.time)}${r.time ? ' · ' : ''}Google</small></div></footer></article>`;
    const render = list => {
      list = list.filter(r => r.text && r.text.trim()); if (!list.length) return;
      const half = Math.ceil(list.length / 2);
      const fill = (el, l, off) => { const html = l.map((r, k) => card(r, k + off)).join(''); el.innerHTML = html + html; };
      fill($('#wall1'), list.slice(0, half), 0); fill($('#wall2'), list.slice(half), half);
    };
    render(window.SUPPORTCAR_REVIEWS || []);
    const grab = () => {
      const items = $$('.reviews__widget .ti-review-item'); if (!items.length) return false;
      render(items.map(it => ({
        name: (($('.ti-name', it) || {}).textContent || '').trim() || 'Client Google',
        text: (($('.ti-review-content', it) || {}).textContent || '').trim(),
        stars: Math.round(parseFloat(it.dataset.rating || '5')),
        time: +(it.dataset.time || 0)
      })));
      return true;
    };
    const mo = new MutationObserver(() => { if (grab()) mo.disconnect(); });
    mo.observe($('.reviews__widget'), { childList: true, subtree: true });
  }

  /* ---------- Nous contacter : panneau ---------- */
  const ct = $('#contact'), fab = $('#contactFab');
  const toggleContact = force => { const o = ct.classList.toggle('open', force); fab.setAttribute('aria-expanded', o); };
  $$('[data-contact]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); toggleContact(); }));
  $$('.contact__opt').forEach(a => a.addEventListener('click', () => toggleContact(false)));
  document.addEventListener('click', e => { if (!ct.contains(e.target)) toggleContact(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape') toggleContact(false); });

  $('#year').textContent = new Date().getFullYear();
})();
