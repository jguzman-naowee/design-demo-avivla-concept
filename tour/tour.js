/* Motor del recorrido: lee window.ESCENAS y maneja tour/index.html. */
(function () {
  'use strict';

  var ESC = window.ESCENAS || [];
  if (!ESC.length) return;

  var DIM = { movil: { w: 390, h: 844 }, escritorio: { w: 1280, h: 800 } };
  var DUR = 9000, ESPERA_MAX = 4000, MARGEN = 24;

  function $(id) { return document.getElementById(id); }
  var el = {
    card: $('trCard'), rol: $('trRol'), titulo: $('trTitulo'), texto: $('trTexto'), cnt: $('trCnt'),
    stage: $('trStage'), dev: $('trDev'), screen: $('trScreen'), frame: $('trFrame'), ring: $('trRing'),
    hero: $('trHero'), heroRol: $('trHeroRol'), heroTitulo: $('trHeroTitulo'), heroTexto: $('trHeroTexto'),
    cta: $('trCta'), prev: $('trPrev'), play: $('trPlay'), next: $('trNext'), prog: $('trProg')
  };
  if (!el.frame || !el.dev || !el.prog) return;

  var reducido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var S = { i: -1, token: 0, paused: !!reducido, ended: false, ready: false, rem: 0, t0: 0, timer: 0, k: 1, sup: 'movil' };

  /* Barra de progreso */
  var segs = ESC.map(function (e, n) {
    var li = document.createElement('li');
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Escena ' + (n + 1) + ': ' + (e.titulo || ''));
    b.addEventListener('click', function () { ir(n); });
    li.appendChild(b);
    el.prog.appendChild(li);
    return li;
  });

  function dur(e) { return e.duracion > 0 ? e.duracion : DUR; }

  /* Escala del dispositivo */
  function ajustar() {
    var d = DIM[S.sup] || DIM.movil;
    var sw = el.stage.clientWidth || window.innerWidth;
    var sh = el.stage.clientHeight;
    if (sh < 160) sh = Math.round(window.innerHeight * 0.6);
    var k = Math.min(1, (sw - MARGEN) / d.w, (sh - MARGEN) / d.h);
    S.k = Math.max(0.1, k);
    el.dev.style.setProperty('--w', d.w + 'px');
    el.dev.style.setProperty('--h', d.h + 'px');
    el.dev.style.setProperty('--k', String(S.k));
  }

  /* Anillo sobre el elemento resaltado */
  function anillo(sel) {
    el.ring.hidden = true;
    if (!sel) return;
    try {
      var doc = el.frame.contentDocument;
      var t = doc && doc.querySelector(sel);
      if (!t) return;
      var r = t.getBoundingClientRect();
      var x0 = Math.max(0, r.left), y0 = Math.max(0, r.top);
      var x1 = Math.min(el.frame.clientWidth, r.right), y1 = Math.min(el.frame.clientHeight, r.bottom);
      if (x1 - x0 < 2 || y1 - y0 < 2) return;
      el.ring.hidden = false;
      var fr = el.frame.getBoundingClientRect();
      var esc = el.frame.clientWidth ? fr.width / el.frame.clientWidth : S.k;
      var base = (el.ring.offsetParent || el.dev).getBoundingClientRect();
      el.ring.style.left = (fr.left - base.left + x0 * esc) + 'px';
      el.ring.style.top = (fr.top - base.top + y0 * esc) + 'px';
      el.ring.style.width = ((x1 - x0) * esc) + 'px';
      el.ring.style.height = ((y1 - y0) * esc) + 'px';
    } catch (err) { el.ring.hidden = true; }
  }

  /* Acciones dentro del iframe */
  function esperaMs(ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); }

  function esperarSel(sel, tok) {
    return new Promise(function (ok) {
      var t0 = Date.now();
      (function sondeo() {
        if (tok !== S.token) return ok(null);
        var n = null;
        try { n = el.frame.contentDocument.querySelector(sel); } catch (e) { n = null; }
        if (n || Date.now() - t0 >= ESPERA_MAX) return ok(n);
        setTimeout(sondeo, 100);
      })();
    });
  }

  async function correr(e, tok) {
    var lista = e.acciones || [];
    for (var n = 0; n < lista.length; n++) {
      if (tok !== S.token) return;
      var a = lista[n];
      try {
        var nodo = a.sel ? await esperarSel(a.sel, tok) : null;
        if (tok !== S.token) return;
        if (nodo) {
          if (a.t === 'click') nodo.click();
          else if (a.t === 'scroll') nodo.scrollIntoView({ block: 'center' });
        }
        if (a.espera) await esperaMs(a.espera);
        else if (a.t === 'click' || a.t === 'scroll') await esperaMs(150);
      } catch (err) { /* una acción fallida no corta la escena */ }
    }
    if (tok !== S.token) return;
    if (e.resalta) {
      await esperarSel(e.resalta, tok);
      if (tok !== S.token) return;
    }
    anillo(e.resalta);
    setTimeout(function () { if (tok === S.token) anillo(e.resalta); }, 450);
  }

  /* Temporizador de avance */
  function arrancar() {
    clearTimeout(S.timer);
    if (S.paused || !S.ready) return;
    S.t0 = Date.now();
    S.timer = setTimeout(fin, Math.max(0, S.rem));
  }
  function detener() {
    if (S.t0 && S.ready && !S.paused) S.rem = Math.max(0, S.rem - (Date.now() - S.t0));
    S.t0 = 0;
    clearTimeout(S.timer);
  }
  function fin() {
    if (S.i < ESC.length - 1) ir(S.i + 1);
    else { S.ended = true; S.paused = true; marcarPausa(); }
  }
  function marcarPausa() {
    document.body.classList.toggle('paused', S.paused);
    el.play.setAttribute('aria-label', S.paused ? 'Reanudar' : 'Pausar');
    el.play.setAttribute('aria-pressed', S.paused ? 'true' : 'false');
  }
  function alternar() {
    if (S.ended) { S.ended = false; S.paused = false; marcarPausa(); ir(0); return; }
    if (S.paused) { S.paused = false; marcarPausa(); arrancar(); }
    else { detener(); S.paused = true; marcarPausa(); }
  }

  /* Marcar la escena lista: pone el relleno y arranca el tiempo */
  function listo(tok) {
    if (tok !== S.token) return;
    S.ready = true;
    var li = segs[S.i];
    var f = document.createElement('i');
    f.className = 'tr-fill';
    f.style.setProperty('--dur', S.rem + 'ms');
    li.firstChild.appendChild(f);
    arrancar();
  }

  /* Cargar una escena */
  function ir(n) {
    if (n < 0 || n >= ESC.length) return;
    var e = ESC[n];
    S.token++;
    var tok = S.token;
    clearTimeout(S.timer);
    S.i = n; S.ready = false; S.t0 = 0; S.rem = dur(e);
    if (S.ended) { S.ended = false; }

    segs.forEach(function (li, m) {
      li.classList.toggle('on', m === n);
      li.classList.toggle('done', m < n);
      var v = li.querySelector(".tr-fill");
      if (v) v.parentNode.removeChild(v);
      var b = li.firstChild;
      if (m === n) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    el.rol.textContent = e.rol || '';
    el.titulo.textContent = e.titulo || '';
    el.texto.textContent = e.texto || '';
    el.cnt.textContent = (n + 1) + ' / ' + ESC.length;
    el.prev.disabled = n === 0;
    el.next.disabled = n === ESC.length - 1;
    try { history.replaceState(null, '', '#' + (n + 1)); } catch (err) { /* sin historial */ }
    el.ring.hidden = true;

    if (e.tipo === 'hero') {
      el.dev.hidden = true;
      el.card.hidden = true;
      el.hero.hidden = false;
      el.heroRol.textContent = e.rol || '';
      el.heroTitulo.textContent = e.titulo || '';
      el.heroTexto.textContent = e.texto || '';
      el.cta.hidden = !e.cta;
      try { el.frame.contentWindow.location.replace('about:blank'); } catch (err) { /* nada */ }
      listo(tok);
      return;
    }

    el.hero.hidden = true;
    el.card.hidden = false;
    el.dev.hidden = false;
    S.sup = e.sup === 'escritorio' ? 'escritorio' : 'movil';
    el.dev.classList.toggle('tr-dev--movil', S.sup === 'movil');
    el.dev.classList.toggle('tr-dev--escritorio', S.sup === 'escritorio');
    ajustar();

    var u = String(e.url || '');
    var h = u.indexOf('#');
    var base = h < 0 ? u : u.slice(0, h);
    var hash = h < 0 ? '' : u.slice(h);
    if (!/[?&]semilla=/.test(base)) base += (base.indexOf('?') < 0 ? '?' : '&') + 'semilla=1';
    var destino = new URL('../' + base + hash, location.href).href;

    var yaCargo = false;
    function alCargar() {
      if (yaCargo || tok !== S.token) return;
      yaCargo = true;
      el.frame.removeEventListener('load', alCargar);
      try {
        el.frame.contentDocument.addEventListener('keydown', teclas);
      } catch (err) { /* sin acceso */ }
      /* La isla del teléfono tapa la cabecera de la app: se reserva su alto como lo hace el marco de la demo. */
      try {
        var movil = S.sup === 'movil', raiz = el.frame.contentDocument.documentElement;
        raiz.style.setProperty('--bc-safe-top', movil ? '40px' : '0px');
        raiz.style.setProperty('--bc-safe-bot', movil ? '16px' : '0px');
        if (el.frame.contentWindow.__tintSafe) el.frame.contentWindow.__tintSafe();
      } catch (err) { /* sin acceso */ }
      correr(e, tok).then(function () { listo(tok); }, function () { listo(tok); });
    }
    el.frame.addEventListener('load', alCargar);
    var actual = '';
    try { actual = el.frame.contentWindow.location.href; } catch (err) { actual = ''; }
    var mismaBase = actual.split('#')[0] === destino.split('#')[0];
    try {
      el.frame.contentWindow.location.replace(destino);
      if (mismaBase) el.frame.contentWindow.location.reload();
    } catch (err) { el.frame.src = destino; }
  }

  /* Teclado */
  function teclas(ev) {
    if (ev.altKey || ev.ctrlKey || ev.metaKey) return;
    var tag = ev.target && ev.target.tagName;
    if (ev.key === 'ArrowRight') { ev.preventDefault(); ir(S.i + 1); }
    else if (ev.key === 'ArrowLeft') { ev.preventDefault(); ir(S.i - 1); }
    else if (ev.key === ' ' || ev.code === 'Space') {
      if (tag === 'BUTTON' || tag === 'A' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      ev.preventDefault();
      alternar();
    }
  }

  el.prev.addEventListener('click', function () { ir(S.i - 1); });
  el.next.addEventListener('click', function () { ir(S.i + 1); });
  el.play.addEventListener('click', alternar);
  document.addEventListener('keydown', teclas);

  window.addEventListener('resize', function () {
    ajustar();
    requestAnimationFrame(function () { var e = ESC[S.i]; if (e && e.tipo !== 'hero') anillo(e.resalta); });
  });

  function desdeHash() {
    var n = parseInt((location.hash || '').replace('#', ''), 10);
    return n >= 1 && n <= ESC.length ? n - 1 : 0;
  }
  window.addEventListener('hashchange', function () {
    var n = desdeHash();
    if (n !== S.i) ir(n);
  });

  marcarPausa();
  ir(desdeHash());
})();
