(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const frame = $("app"), screen = $("screen"), spot = $("spot"), cur = $("cursor"), say = $("say");
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const qs = new URLSearchParams(location.search), DEV = qs.has("dev");
  const S = { stopped: false, app: null, caso: null, i: 0, mode: "paso", token: 0, busy: false, pick: false };

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const doc = () => frame.contentDocument;
  /* Atrás del visor: navega el historial de la app sin reiniciar el caso. */
  const bBack = document.getElementById("bBack");
  if (bBack) bBack.addEventListener("click", () => { try { frame.contentWindow.history.back(); } catch (e) { /* sin acceso */ } });
  /* Esc también debe salir de la vista plana cuando el foco está dentro de la app (el iframe no propaga teclas). */
  const hookKeys = () => {
    const d = doc(); if (!d || d.__escHook) return; d.__escHook = true;
    d.addEventListener("keydown", (e) => { if (e.key === "Escape" && document.body.classList.contains("solo")) $("planaBtn").click(); });
  };
  /* El teléfono dibuja barras transparentes: la app reserva su alto con --bc-safe-top/bot (0 en escritorio). */
  const reservar = () => { const d = doc(); if (!d) return; const m = SUP === "movil"; d.documentElement.style.setProperty("--bc-safe-top", m ? $("sbar").offsetHeight + "px" : "0px"); d.documentElement.style.setProperty("--bc-safe-bot", m ? $("hbar").offsetHeight + "px" : "0px"); try { d.defaultView.__tintSafe && d.defaultView.__tintSafe(); } catch (e) { /* app aún sin cargar */ } };
  const base = () => "apps/" + S.app.id + "/";
  const load = (url) => new Promise((ok) => { frame.onload = () => { hookKeys(); reservar(); if (DEV) armPicker(); ok(); }; frame.src = fresh(base() + url); });
  /* Un cambio solo de #hash no recarga el iframe y conservaría el estado del caso anterior: se añade un parámetro único. */
  const fresh = (u) => { const [a, h] = u.split("#"); return a + (a.includes("?") ? "&" : "?") + "_r=" + Date.now() + (h != null ? "#" + h : ""); };

  /* Coordenadas del elemento dentro del iframe a coordenadas de .screen (el marco puede estar escalado). */
  /* El teléfono va escalado (ajuste + zoom): el recuadro y el cursor viven dentro de .screen, así que se
     expresan en píxeles locales de .screen (sin escalar). El elemento ya viene en píxeles locales del iframe. */
  const rectOf = (el) => {
    const r = el.getBoundingClientRect(), f = frame.getBoundingClientRect(), s = screen.getBoundingClientRect(), k = s.width / screen.offsetWidth || 1;
    return { x: (f.left - s.left) / k + r.left, y: (f.top - s.top) / k + r.top, w: r.width, h: r.height };
  };
  /* La app pinta navegación distinta por ancho (sidebar o pestañas): se usa la coincidencia visible. */
  const q = (sel) => { const all = [...doc().querySelectorAll(sel)]; return all.find((x) => x.getClientRects().length) || all[0] || null; };
  /* La app simula cargas (esqueleto al navegar, botón ocupado al guardar): se espera a que termine. */
  const listo = () => !doc().querySelector(".bc-carga") && !doc().body.classList.contains("bc-ocupado");
  const find = async (sel) => {
    for (let n = 0; n < 40 && !(q(sel) && listo()); n++) await sleep(100);
    const el = q(sel);
    if (!el) throw new Error("No se encontró «" + sel + "» en la pantalla.");
    return el;
  };
  const focus = async (el) => {
    el.scrollIntoView({ block: "center", behavior: RM ? "auto" : "smooth" });
    await sleep(RM ? 0 : 350);
    /* La app anima sus pantallas y listas: se espera a que el elemento deje de moverse para marcarlo donde queda. */
    let r = rectOf(el);
    for (let n = 0; !RM && n < 10; n++) { await sleep(60); const r2 = rectOf(el); const quieto = Math.abs(r2.x - r.x) < 1 && Math.abs(r2.y - r.y) < 1 && Math.abs(r2.w - r.w) < 1 && Math.abs(r2.h - r.h) < 1; r = r2; if (quieto) break; }
    const p = 6;
    Object.assign(spot.style, { left: r.x - p + "px", top: r.y - p + "px", width: r.w + 2 * p + "px", height: r.h + 2 * p + "px" });
    spot.hidden = false; S.fxEl = el; S.fxClick = false;
    return r;
  };
  /* Pista: la app avisa cuando abre un formulario con relleno al 2.º clic; cerrada, no vuelve hasta otra pantalla. */
  const pistaEl = $("pista"); let pistaCerrada = null, pistaDada = false;
  /* Una sola vez por flujo: al cargar un caso nuevo vuelve a poder salir. */
  frame.addEventListener("load", () => { pistaDada = false; });
  window.addEventListener("message", (e) => {
    if (e.data && e.data.type === "demo-estatus" && e.source === frame.contentWindow) { setEstatus(e.data.color, e.data.bot); return; }
    if (!e.data || e.data.type !== "demo-pista" || e.source !== frame.contentWindow) return;
    if (e.data.clave !== pistaCerrada) pistaCerrada = null;
    const quiere = !!e.data.texto && pistaCerrada !== e.data.clave && (!pistaDada || pistaEl.dataset.clave === e.data.clave);
    if (e.data.texto) { const t = $("pistaTxt"), b = document.createElement("b"); b.textContent = "Demo: "; t.textContent = ""; t.append(b, e.data.texto); }
    if (quiere && pistaEl.dataset.clave === e.data.clave && pistaEl.classList.contains("on")) return;
    pistaEl.dataset.clave = e.data.clave;
    if (quiere) pistaDada = true;
    verPista(quiere);
  });
  /* Como un toast de la app: baja, dura 4 s con una barra que se vacía y se quita; cerrada o vencida, no vuelve hasta otra pantalla. */
  let pistaT = 0, pistaOcultar = 0;
  /* En escritorio la pista se centra sobre el contenido de la app (no sobre toda la ventana) y queda bajo la barra del navegador. */
  const centrarPista = () => {
    const st = pistaEl.style;
    if (holder.dataset.dev !== "desk") { st.left = st.right = st.top = st.translate = ""; return; }
    try {
      const pg = frame.contentDocument.querySelector(".cz-pg, .bc-page, main"), r = pg && pg.getBoundingClientRect();
      const bb = document.querySelector(".bbar"), top = (bb ? bb.offsetHeight : 0) + 2;
      if (r && r.width) { st.left = (r.left + r.width / 2) + "px"; st.right = "auto"; st.translate = "-50% 0"; st.top = top + "px"; }
    } catch (e) { /* sin acceso al marco */ }
  };
  const verPista = (on) => {
    clearTimeout(pistaT); clearTimeout(pistaOcultar);
    if (on) {
      /* Espera 1,5 s antes de aparecer, entra despacio y se queda 5 s para dar tiempo de leerla. */
      pistaT = setTimeout(() => {
        pistaEl.hidden = false; document.body.classList.add("con-pista"); layout();
        centrarPista();
        pistaEl.classList.remove("on"); void pistaEl.offsetWidth; pistaEl.classList.add("on");
        pistaT = setTimeout(() => { pistaCerrada = pistaEl.dataset.clave; verPista(false); }, 5000);
      }, 1500);
    } else {
      pistaEl.classList.remove("on");
      pistaOcultar = setTimeout(() => { pistaEl.hidden = true; document.body.classList.remove("con-pista"); layout(); }, 850);
    }
  };
  $("pistaX").addEventListener("click", () => { pistaCerrada = pistaEl.dataset.clave; verPista(false); });
  const hideFx = () => { S.fxEl = null; spot.hidden = true; cur.hidden = true; spot.classList.remove("hint"); };

  /* Guía en modo manual: antes de pulsar «Siguiente», marca dónde va a actuar el próximo paso y dice qué hará. */
  async function hint() {
    const st = S.caso && S.caso.steps[S.i];
    if (S.mode !== "paso" || S.busy || !st || st.t === "goto" || !st.sel) return;
    const my = S.token;
    try {
      /* La pantalla puede estar aún pintándose tras el paso anterior: se espera un poco a que aparezca el elemento. */
      let el = listo() && q(st.sel);
      for (let n = 0; !el && n < 20; n++) { await sleep(150); if (my !== S.token || S.busy || S.mode !== "paso") return; el = listo() && q(st.sel); }
      if (!el) return;
      const r = await focus(el);
      if (my !== S.token || S.busy || S.mode !== "paso") return;
      spot.classList.add("hint");
      if (st.t === "click") { S.fxClick = true; cur.hidden = false; cur.style.transform = "translate(" + (r.x + r.w / 2) + "px," + (r.y + r.h / 2) + "px)"; }
    } catch (e) { /* sin guía: el paso mostrará su error al ejecutarse */ }
  }

  async function runStep(st) {
    if (st.t === "goto") { hideFx(); await load(st.url || S.app.inicio || "index.html"); return; }
    const el = await find(st.sel), r = await focus(el);
    if (st.t === "click") {
      S.fxClick = true; cur.hidden = false;
      cur.style.transform = "translate(" + (r.x + r.w / 2) + "px," + (r.y + r.h / 2) + "px)";
      await sleep(RM ? 0 : 650);
      cur.classList.add("press"); await sleep(RM ? 0 : 300); cur.classList.remove("press");
      const nav = new Promise((ok) => { frame.onload = () => { hookKeys(); reservar(); if (DEV) armPicker(); ok(); }; });
      el.click(); hideFx();
      /* Con hash routing el iframe no recarga: no esperar a un onload que no llega. Solo se espera si de verdad está cargando. */
      await Promise.race([nav, sleep(RM ? 0 : 350)]);
      if (doc().readyState !== "complete") await Promise.race([nav, sleep(1500)]);
    }
  }

  const paint = () => {
    const n = S.caso.steps.length;
    const hecho = Math.min(S.i, n), cnt = $("cnt");
    cnt.hidden = hecho === 0 && !S.busy; /* el avance aparece al iniciar el recorrido */
    cnt.innerHTML = Array.from({ length: n }, (_, k) => "<i" + (k < hecho ? ' class="on"' : "") + "></i>").join("");
    cnt.setAttribute("aria-valuemin", 0); cnt.setAttribute("aria-valuemax", n); cnt.setAttribute("aria-valuenow", hecho);
    $("next").textContent = (S.i >= n ? "Terminado" : "Siguiente") + " ▸";
    $("next").disabled = S.i >= n || S.busy;
    $("stop").disabled = !(S.busy || S.mode === "auto");
    document.querySelectorAll(".case").forEach((b) => b.classList.toggle("on", b.dataset.id === S.caso.id));
  };

  async function next() {
    if (!S.caso || S.busy || S.i >= S.caso.steps.length) return;
    const my = S.token; S.busy = true; paint();
    try { await runStep(S.caso.steps[S.i]); S.i++; }
    catch (e) { say.innerHTML = '<b style="color:#B3261E">' + esc(e.message) + "</b>"; hideFx(); }
    S.busy = false; paint();
    if (S.i >= S.caso.steps.length) setTimeout(hideFx, RM ? 0 : 1200);
    if (S.i >= S.caso.steps.length && S.caso.falta) say.innerHTML += '<span class="falta"><b>Pendiente:</b> ' + esc(S.caso.falta) + "</span>";
    if (S.mode === "paso" && (my === S.token || S.stopped)) { S.stopped = false; hint(); }
    if (S.mode === "auto" && my === S.token && S.i < S.caso.steps.length) { await sleep(RM ? 0 : 1400); if (my === S.token) next(); }
  }

  /* Detener: corta el encadenado del modo automático y vuelve a paso a paso; el paso en curso termina solo. */
  function stop() {
    S.token++; S.stopped = S.busy; S.mode = "paso";
    document.querySelectorAll(".seg button").forEach((x) => x.classList.toggle("on", x.dataset.mode === "paso"));
    paint(); if (!S.busy) hint();
  }

  function pick(id) {
    S.token++; S.stopped = false; S.busy = false; S.i = 0; hideFx();
    S.caso = window.CASOS.find((c) => c.id === id) || window.CASOS[0];
    const g = S.caso.steps[0]; /* el caso puede arrancar en otra pantalla (goto con url): se ve ya ahí, no en el login */
    load((g && g.t === "goto" && g.url) || S.app.inicio || "index.html"); say.textContent = "";
    paint();
    if (S.mode === "auto") next();
  }

  /* ── Modo dev: elegir un elemento del teléfono y obtener su selector ── */
  function selectorOf(el) {
    const d = el.ownerDocument, uniq = (s) => { try { return d.querySelectorAll(s).length === 1; } catch (e) { return false; } };
    const attr = (n) => el.getAttribute(n) && "[" + n + '="' + el.getAttribute(n).replace(/"/g, '\\"') + '"]';
    if (el.id && uniq("#" + CSS.escape(el.id))) return "#" + CSS.escape(el.id);
    for (const n of ["data-testid", "aria-label", "name"]) { const s = attr(n); if (s && uniq(el.tagName.toLowerCase() + s)) return el.tagName.toLowerCase() + s; }
    const parts = [];
    for (let n = el; n && n.nodeType === 1 && n !== d.body && parts.length < 5; n = n.parentElement) {
      const cls = [].filter.call(n.classList, (c) => !/^(is-|has-|active|hover|focus)/.test(c)).slice(0, 2).map((c) => "." + CSS.escape(c)).join("");
      const sib = n.parentElement && [].filter.call(n.parentElement.children, (x) => x.tagName === n.tagName);
      parts.unshift(n.tagName.toLowerCase() + cls + (sib && sib.length > 1 && !cls ? ":nth-of-type(" + (sib.indexOf(n) + 1) + ")" : ""));
      if (uniq(parts.join(" > "))) break;
    }
    return parts.join(" > ");
  }
  let lastHover = null;
  function armPicker() {
    const d = doc(); if (!d || d.__dlArmed) return; d.__dlArmed = true;
    const st = d.createElement("style"); st.textContent = ".__dl-pick{outline:2px dashed #B3261E!important;outline-offset:2px}"; d.head.appendChild(st);
    d.addEventListener("mouseover", (e) => { if (!S.pick) return; if (lastHover) lastHover.classList.remove("__dl-pick"); lastHover = e.target; e.target.classList.add("__dl-pick"); }, true);
    d.addEventListener("click", (e) => {
      if (!S.pick) return;
      e.preventDefault(); e.stopPropagation();
      if (lastHover) lastHover.classList.remove("__dl-pick");
      const line = '{ t: "click", sel: ' + JSON.stringify(selectorOf(e.target)) + ', body: "" },';
      $("log").value += line + "\n";
      navigator.clipboard.writeText(line).catch(() => { /* sin permiso: queda en el cuadro */ });
    }, true);
  }
  function setSize(v) {
    const [w, h] = v.split("x");
    holder.style.setProperty("--w", w); holder.style.setProperty("--h", h);
    holder.dataset.dev = +w <= 375 ? "se" : +w >= 412 ? "pixel" : "ios";
    layout();
  }

  /* ── Marco: ajuste al espacio, zoom, panel de casos, vista plana ── */
  const holder = $("holder"), device = $("device"), body = document.body;
  const ZMIN = 0.5, ZMAX = 2, ZSTEP = 0.25;
  let zoom = 1;
  const isSolo = () => body.classList.contains("solo");
  /* Sombra en lo que queda fijo (encabezado y controles del panel) solo cuando la lista corre por detrás. */
  function shade() {
    const c = $("cases");
    document.querySelector(".phd").classList.toggle("sh", c.scrollTop > 1);
    document.querySelector(".ctrl").classList.toggle("sh", c.scrollTop + c.clientHeight < c.scrollHeight - 1);
  }
  $("cases").addEventListener("scroll", shade);
  function layout() {
    shade();
    document.documentElement.style.setProperty("--hdr", $("top").offsetHeight + "px");
    if (isSolo()) return;
    const cs = getComputedStyle($("scroller")), pad = parseFloat(cs.paddingLeft) || 0;
    const W = +holder.style.getPropertyValue("--w") || 390, H = +holder.style.getPropertyValue("--h") || 844, desk = holder.dataset.dev === "desk";
    const padV = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
    const fit = Math.min((device.clientWidth - 2 * pad) / (desk ? W : W + 24), (device.clientHeight - padV) / (desk ? H + 40 : H + 24), 1);
    holder.style.setProperty("--k", Math.max(0.2, fit * zoom).toFixed(4));
    $("zOut").disabled = zoom <= ZMIN; $("zIn").disabled = zoom >= ZMAX;
    realign();
  }
  /* Tras cambiar escala o ancho: vuelve a colocar recuadro y cursor sobre el mismo elemento. */
  function realign() {
    const el = S.fxEl; if (!el || spot.hidden) return;
    try {
      const r = rectOf(el), p = 6;
      Object.assign(spot.style, { left: r.x - p + "px", top: r.y - p + "px", width: r.w + 2 * p + "px", height: r.h + 2 * p + "px" });
      if (S.fxClick && !cur.hidden) cur.style.transform = "translate(" + (r.x + r.w / 2) + "px," + (r.y + r.h / 2) + "px)";
    } catch (e) { /* el elemento ya no existe */ }
  }
  const setZoom = (z) => { zoom = Math.min(ZMAX, Math.max(ZMIN, Math.round(z * 100) / 100)); layout(); };
  $("zOut").addEventListener("click", () => setZoom(zoom - ZSTEP));
  $("zIn").addEventListener("click", () => setZoom(zoom + ZSTEP));
  if (window.ResizeObserver) new ResizeObserver(layout).observe(device); else addEventListener("resize", layout);

  function setPanel(open) {
    body.classList.toggle("panel-open", open);
    $("casosBtn").setAttribute("aria-expanded", open);
    layout();
  }
  $("casosBtn").addEventListener("click", () => setPanel(!body.classList.contains("panel-open")));
  $("closePanel").addEventListener("click", () => { setPanel(false); $("casosBtn").focus(); });
  setPanel(false);

  function setSolo(on) {
    body.classList.toggle("solo", on);
    $("planaBtn").setAttribute("aria-checked", on);
    if (on) hideFx();
    layout();
  }
  $("planaBtn").addEventListener("click", () => setSolo(!isSolo()));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && isSolo()) setSolo(false); });

  /* `estatus` (app.json): color de las franjas de estado e indicador de inicio; el texto se vuelve claro u oscuro según el fondo. */
  function setEstatus(c, bot) {
    const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(c || "#fff"), hex = m ? (m[1].length === 3 ? m[1].replace(/./g, "$&$&") : m[1]) : "ffffff";
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
    holder.style.setProperty("--est", "#" + hex);
    const claro = (0.299 * r + 0.587 * g + 0.114 * b) > 150;
    holder.style.setProperty("--estfg", claro ? "#14162A" : "#fff");
    holder.style.setProperty("--halo", claro ? "rgba(255,255,255,.85)" : "rgba(20,22,42,.55)");
    const mb = /^#([0-9a-f]{6})$/i.exec(bot || "");
    if (mb) { const [r2, g2, b2] = [0, 2, 4].map((i) => parseInt(mb[1].slice(i, i + 2), 16)); holder.style.setProperty("--estb", "#" + mb[1]); holder.style.setProperty("--estbfg", (0.299 * r2 + 0.587 * g2 + 0.114 * b2) > 150 ? "#14162A" : "#fff"); }
  }

  /* ── Superficie: el mismo caso en el teléfono o en una ventana de escritorio ── */
  let SUP = "movil";
  function setSup(sup, recargar) {
    SUP = sup === "escritorio" ? "escritorio" : "movil";
    if (SUP === "escritorio") { holder.style.setProperty("--w", 1280); holder.style.setProperty("--h", 800); holder.dataset.dev = "desk"; }
    else { holder.style.setProperty("--w", 390); holder.style.setProperty("--h", 844); holder.dataset.dev = "ios"; }
    document.querySelectorAll("[data-sup]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.sup === SUP)));
    $("appSub").textContent = (S.app.subtitulo || "Demo") + " · " + (SUP === "escritorio" ? "Escritorio" : "Móvil");
    $("device").setAttribute("aria-label", SUP === "escritorio" ? "Ventana de escritorio" : "Teléfono");
    try { history.replaceState(null, "", "?app=" + encodeURIComponent(S.app.id) + "&sup=" + SUP + (DEV ? "&dev=1" : "")); } catch (e) { /* sin historial */ }
    layout(); reservar();
    if (recargar && S.caso) pick(S.caso.id);
  }
  document.querySelector(".supsel").addEventListener("click", (e) => { const b = e.target.closest("[data-sup]"); if (b && b.dataset.sup !== SUP) setSup(b.dataset.sup, true); });

  /* ── Arranque: la app sale de ?app=, y sus casos se cargan al vuelo ── */
  function openApp(id) {
    S.app = window.APPS.find((a) => a.id === id) || window.APPS[0];
    $("appSel").value = S.app.id;
    $("appNombre").textContent = S.app.nombre || S.app.id;
    $("appSub").textContent = S.app.subtitulo || "Demo móvil";
    document.title = (S.app.nombre || S.app.id) + " · Brújula Ciudadana · Naowee";
    setEstatus(S.app.estatus);
    setSup(qs.get("sup") || S.app.superficie);
    const s = document.createElement("script");
    s.src = base() + "casos.js?t=" + Date.now();
    s.onload = () => {
      const fila = (c) => '<li><button type="button" class="case" data-id="' + esc(c.id) + '"><b>' + esc(c.id) + "</b>" + esc(c.titulo) + "</button></li>";
      const gs = window.CASOS_GRUPOS;
      if (!gs) $("cases").innerHTML = window.CASOS.map(fila).join("");
      else {
        const tomados = new Set(gs.flatMap((g) => g.ids || []));
        $("cases").innerHTML = gs.map((g) => {
          const cs = g.resto ? window.CASOS.filter((c) => !tomados.has(c.id)) : g.ids.map((i) => window.CASOS.find((c) => c.id === i)).filter(Boolean);
          const enlace = g.url ? ' <a href="' + esc(g.url) + '" target="_blank" rel="noopener">' + esc(g.ref) + " ↗</a>" : "";
          return '<li class="grp"><span class="k">' + esc(g.titulo) + "</span>" + enlace + (g.nota ? "<small>" + esc(g.nota) + "</small>" : "") + "</li>" + cs.map(fila).join("");
        }).join("");
      }
      pick(window.CASOS[0].id); shade();
    };
    s.onerror = () => { say.innerHTML = '<b style="color:#B3261E">Falta ' + esc(base()) + "casos.js</b>"; };
    document.head.appendChild(s);
  }

  $("appSel").innerHTML = window.APPS.map((a) => '<option value="' + esc(a.id) + '">' + esc(a.nombre || a.id) + "</option>").join("");
  $("appSel").addEventListener("change", () => { history.replaceState(null, "", "?app=" + $("appSel").value + (DEV ? "&dev=1" : "")); openApp($("appSel").value); });
  $("cases").addEventListener("click", (e) => { const b = e.target.closest(".case"); if (b) pick(b.dataset.id); });
  $("next").addEventListener("click", next);
  $("stop").addEventListener("click", stop);
  $("restart").addEventListener("click", () => S.caso && pick(S.caso.id));
  /* Los datos los comparten todos los roles: se vuelve a la semilla solo cuando se pide. */
  $("resetDatos").addEventListener("click", () => { try { frame.contentWindow.DEMO.restablecer(); } catch (e) { /* app sin contrato */ } if (S.caso) pick(S.caso.id); });
  document.querySelectorAll(".seg button").forEach((b) => b.addEventListener("click", () => {
    S.mode = b.dataset.mode;
    document.querySelectorAll(".seg button").forEach((x) => x.classList.toggle("on", x === b));
    paint();
    if (S.mode === "auto") next(); else hint();
  }));
  if (DEV) {
    $("dev").hidden = false; $("devtag").hidden = false;
    $("size").addEventListener("change", (e) => setSize(e.target.value));
    $("reload").addEventListener("click", () => { if (frame.src) frame.contentWindow.location.reload(); });
    $("pickBtn").addEventListener("click", (e) => { S.pick = !S.pick; e.currentTarget.setAttribute("aria-pressed", S.pick); if (!frame.src) say.textContent = "Carga la app con «Siguiente» (primer paso goto) y luego elige un elemento."; });
  }
  if (!window.APPS.length) {
    document.querySelector(".panel").classList.add("vacio");
    $("appSel").hidden = true;
    say.innerHTML = "Aún no hay demos. Crea una con <code>npm run nueva-app -- &lt;id&gt; --desde &lt;build&gt;</code>; la guía está en <code>docs/MONTAR-DEMO-MOBILE.md</code>.";
  }
  else openApp(qs.get("app"));
})();
