(() => {
  "use strict";
  const CAT = window.BC_CATALOGO, KEY = "brujula.demo.v2";
  const qs = new URLSearchParams(location.search);
  const ROL = ["ciudadano", "conector", "entidad"].includes(qs.get("rol")) ? qs.get("rol") : "ciudadano";
  document.body.classList.add("rol-" + ROL);
  /* Sesión simulada por rol: no hay cambio de usuario dentro de la app. */
  const ENT = "e1", YO = "c1";

  let S, D = null;
  const guardar = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* sin almacenamiento */ } };
  const sembrar = () => { S = window.BC_SEMILLA(); S.ciudadano = null; guardar(); };
  try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; }
  if (!S || qs.has("semilla")) sembrar();
  if (qs.has("sinsesion") && S.ciudadano) { S.ciudadano = null; guardar(); }
  window.DEMO = { restablecer() { sembrar(); D = null; } };

  /* ── utilidades ── */
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ent = (id) => S.entidades.find((x) => x.id === id) || { nombre: "—" };
  const con = (id) => S.conectores.find((x) => x.id === id);
  const rec = (id) => S.recursos.find((x) => x.id === id);
  const per = (id) => S.personas.find((x) => x.id === id);
  const solsDe = (pid) => S.solicitudes.filter((s) => s.persona === pid);
  const nom = (p) => p.nombre + " " + p.apellidos;
  const ini = (n) => n.split(/\s+/).map((x) => x[0]).slice(0, 2).join("").toUpperCase();
  const fecha = (f) => { const d = new Date(f.length === 10 ? f + "T00:00" : f.replace(" ", "T")); return isNaN(d) ? f : d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }); };
  const ahora = () => { const d = new Date(), p = (n) => String(n).padStart(2, "0"); return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes()); };
  const hoy = () => ahora().slice(0, 10);
  const cuando = (f) => fecha(f.slice(0, 10)) + " · " + esc(f.slice(11));
  const nuevoId = () => "BC-2026-" + String(Math.max(...S.personas.map((p) => +p.id.slice(-4))) + 1).padStart(4, "0");
  const propias = (p) => solsDe(p.id).filter((s) => s.por === ENT || rec(s.recurso).entidad === ENT);
  const ajenas = (p) => solsDe(p.id).filter((s) => s.por !== ENT && rec(s.recurso).entidad !== ENT);
  const plazo = (r) => r.urg === "Urgente" ? "Urgente · respuesta en 24 h" : "Normal · 5 días hábiles";

  /* ── piezas con el marcado de los componentes Nwt del SDK ── */
  const ic = (n, cls) => '<div class="nwt-icon' + (cls ? " " + cls : "") + '"><i class="naotech-icon-' + n + '"></i></div>';
  const attrs = (o) => Object.entries(o || {}).map(([k, v]) => " " + k + '="' + esc(v) + '"').join("");
  const btn = (label, o = {}) => {
    const a = Object.assign({ class: "nwt-button", "nwt-variant": o.v || "loud", "nwt-size": o.size || "medium" }, o.theme ? { "nwt-theme": o.theme } : {}, o.act ? { "data-act": o.act } : {}, o.a || {});
    const inner = '<span class="nwt-button__content">' + (o.icon ? ic(o.icon, "nwt-button__icon") : "") + esc(label) + (o.iconEnd ? ic(o.iconEnd, "nwt-button__icon") : "") + "</span>";
    return o.href ? "<a" + attrs(a) + ' href="' + o.href + '">' + inner + "</a>" : '<button type="button"' + attrs(a) + ">" + inner + "</button>";
  };
  /* Estados y semáforo van en NwtBadge: NwtTag es un filtro clicable, no una etiqueta de estado. */
  const tag = (t, theme, size, dot) => '<span class="nwt-badge' + (dot ? " nwt-badge--vignette" : "") + '" role="status" nwt-theme="' + (theme || "neutral") + '" nwt-size="' + (size === "medium" ? "medium" : "small") + '" nwt-variant="quiet"><div class="nwt-badge__content"><div class="nwt-badge__label">' + esc(t) + "</div></div></span>";
  const avatar = (t, color, size) => '<div class="nwt-avatar" nwt-color="' + (color || "blue") + '" nwt-size="' + (size || "medium") + '" nwt-variant="loud"><div class="nwt-avatar__content"><span>' + esc(t) + "</span></div></div>";
  const alerta = (html, theme) => '<div class="nwt-alert nwt-alert--visible" nwt-theme="' + (theme || "informative") + '" nwt-variant="quiet"><div class="nwt-alert__content"><span class="nwt-alert__label">' + html + "</span></div></div>";
  const card = (body, o = {}) => '<div class="nwt-card' + (o.cls ? " " + o.cls : "") + '" nwt-variant="quiet" nwt-size="medium"' + (o.id ? ' id="' + o.id + '"' : "") + attrs(o.a) + '><div class="nwt-card__body"><div class="nwt-card__content">' + body + "</div></div></div>";
  const cardH = (titulo, extra) => '<div class="bc-card-h"><h2>' + titulo + "</h2>" + (extra || "") + "</div>";
  const stat = (label, value, href, id) => '<a class="nwt-stat-card" href="' + href + '"' + (id ? ' id="' + id + '"' : "") + ' style="text-decoration:none;color:inherit"><div class="nwt-stat-card__content"><span class="nwt-stat-card__label">' + esc(label) + '</span><span class="nwt-stat-card__value">' + esc(value) + "</span></div></a>";
  const SEM = { v: ["Estable", "positive"], a: ["En proceso", "warning"], r: ["Necesita apoyo", "negative"] };
  const sem = (v) => v ? tag(SEM[v][0], SEM[v][1], "small", true) : tag("Sin evaluar", "neutral");
  const ST = { "Pendiente": "warning", "Aprobada": "positive", "Rechazada": "negative", "En lista de espera": "informative", "Falta información": "caution" };
  const st = (e) => tag(e, ST[e] || "neutral");
  const mini = (m) => {
    const c = { r: 0, a: 0, v: 0 }; Object.values(m || {}).forEach((v) => { if (c[v] != null) c[v]++; });
    if (!c.r && !c.a && !c.v) return '<span class="bc-mini vacio">Sin evaluar</span>';
    return '<span class="bc-mini" role="img" aria-label="' + c.r + " necesitan apoyo, " + c.a + " en proceso, " + c.v + ' estables">' + ["r", "a", "v"].filter((k) => c[k]).map((k) => '<i class="' + k + '" style="flex:' + c[k] + '"></i>').join("") + "</span>";
  };
  const stepper = (labels, pos) => '<div class="bc-prog"><div class="bc-prog__bar" role="progressbar" aria-valuemin="1" aria-valuemax="' + labels.length + '" aria-valuenow="' + (pos + 1) + '">' + labels.map((l, i) => '<i class="' + (i <= pos ? "on" : "") + '"></i>').join("") +
    '</div><span>Paso ' + (pos + 1) + " de " + labels.length + " · <b>" + esc(labels[pos]) + "</b></span></div>";
  const selNative = (id, opts, val, extra) => '<select id="' + id + '" class="bc-sel"' + (extra || "") + ">" + opts + "</select>";

  /* Campos: misma estructura que NwtTextField / NwtSelect (nwt-input-box). */
  const fld = (k, label, o = {}) => {
    const v = D.datos[k] || "", e = D.err[k], id = "f-" + k;
    const ctl = o.opts
      ? '<div class="nwt-select__content"><select id="' + id + '" class="nwt-select__input" data-f="' + k + '"><option value="">Selecciona…</option>' + o.opts.map((x) => "<option" + (x === v ? " selected" : "") + ">" + esc(x) + "</option>").join("") + "</select>" + '<div class="nwt-select__chevron" aria-hidden="true">' + ic("chevron-down") + "</div></div>"
      : '<input id="' + id + '" class="nwt-text-field__input" data-f="' + k + '" type="' + (o.type || "text") + '" value="' + esc(v) + '"' + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : "") + (o.mode ? ' inputmode="' + o.mode + '"' : "") + (e ? ' aria-invalid="true" aria-describedby="' + id + '-m"' : "") + ">";
    const msg = e ? '<div class="nwt-input-box__message" id="' + id + '-m"><div class="nwt-avatar-icon" nwt-theme="negative">' + ic("caution") + "</div><span>" + esc(e) + "</span></div>" : o.h ? '<div class="nwt-input-box__message"><span>' + esc(o.h) + "</span></div>" : "";
    return '<div class="' + (o.opts ? "nwt-select" : "nwt-text-field") + '" nwt-size="medium"><div class="nwt-input-box' + (e ? " nwt-input-box--error" : "") + '"><div class="nwt-input-box__content"><label class="nwt-input-box__label" for="' + id + '">' + esc(label) + (o.opc ? " (opcional)" : "") + '</label><div class="nwt-input-box__control">' + ctl + "</div>" + msg + "</div></div></div>";
  };
  const checkbox = (id, on, label, help, dataAttr) => '<div class="bc-opt' + (on ? " on" : "") + '" data-act="chk" ' + dataAttr + '="' + id + '"><div class="nwt-checkbox' + (on ? " nwt-checkbox--checked" : "") + '" role="checkbox" nwt-size="medium" aria-checked="' + on + '" tabindex="0"><div class="nwt-checkbox__control">' + ic("positive") + '</div><span class="nwt-checkbox__label">' + label + (help ? '<span class="bc-help">' + help + "</span>" : "") + "</span></div></div>";
  const radio = (on, label, data) => '<div class="bc-opt' + (on ? " on" : "") + '" ' + data + '><div class="nwt-radio-button' + (on ? " nwt-radio-button--checked" : "") + '" role="radio" aria-checked="' + on + '" tabindex="0"><div class="nwt-radio-button__control"><div class="nwt-radio-button__dot"></div></div><span class="nwt-radio-button__label">' + label + "</span></div></div>";

  function toast(t) { const el = $("#toast"); el.textContent = t; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { el.hidden = true; }, 3200); }
  const ir = (h) => { if (location.hash === h) render(); else location.hash = h; };
  const salir = () => { try { top.location.href = new URL("../../index.html", location.href).href; } catch (e) { location.href = "../../index.html"; } };

  /* ── borrador de registro ── */
  const nuevo = (tipo) => ({ tipo, consent: {}, datos: {}, mapa: {}, auto: {}, recursos: [], entidad: ENT, err: {}, busqueda: null, q: "", notas: "" });
  const EJEMPLO = {
    yo: { nombre: "Amina", apellidos: "Belkadi", nac: "1994-05-19", docTipo: "En trámite", doc: "", tel: "+34 612 448 901", email: "", municipio: "Madrid", cp: "28026", idioma: ["Árabe", "Español"], canal: "WhatsApp" },
    con: { nombre: "Jorge Luis", apellidos: "Paredes", nac: "1990-08-07", docTipo: "No", doc: "", tel: "+34 600 123 456", email: "jl.paredes@correo.es", municipio: "Madrid", cp: "28041", idioma: "Español", canal: "Teléfono" }
  };
  const MAPA_EJ = { vivienda: "r", ingresos: "a", alimentacion: "a", salud: "v", documentacion: "r", red: "a", familia: "v", menores: "v", cuidados: "v", empleo: "r", formacion: "a", movilidad: "v", digital: "a", autonomia: "v", direccion: "a", comunidad: "a" };
  const REQ = ["nombre", "apellidos", "nac", "docTipo", "tel", "municipio", "cp", "idioma", "canal"];
  const validarDatos = () => {
    D.err = {};
    REQ.forEach((k) => { if (!String(D.datos[k] || "").trim()) D.err[k] = "Este dato es obligatorio."; });
    if (D.datos.cp && !/^\d{5}$/.test(D.datos.cp)) D.err.cp = "Escribe los 5 dígitos del código postal.";
    return !Object.keys(D.err).length;
  };

  const vDatos = (yo) =>
    '<div class="stack">' +
    '<fieldset class="bc-fs"><legend>Datos personales</legend><div class="grid2">' + fld("nombre", "Nombre") + fld("apellidos", "Apellidos") + fld("nac", "Fecha de nacimiento", { type: "date" }) + fld("docTipo", yo ? "¿Tienes documento nacional?" : "¿Tiene documento nacional?", { opts: CAT.documento }) + fld("doc", "DNI / NIE / Pasaporte", { opc: true, h: "No es necesario para empezar." }) + "</div></fieldset>" +
    '<fieldset class="bc-fs"><legend>Contacto</legend><div class="grid2">' + fld("tel", "Teléfono", { type: "tel", mode: "tel", ph: "+34 600 000 000", h: "Es el canal principal de contacto." }) + fld("email", "Email", { type: "email", opc: true }) + "</div></fieldset>" +
    '<fieldset class="bc-fs"><legend>Ubicación</legend><div class="grid2">' + fld("municipio", "Municipio") + fld("cp", "Código postal", { mode: "numeric", ph: "28000", h: (yo ? "No pedimos tu" : "No se pide la") + " dirección exacta." }) + "</div></fieldset>" +
    '<fieldset class="bc-fs"><legend>Idioma y canal</legend><div class="grid2">' + fld("idioma", "Idioma preferente", { opts: CAT.idiomas }) + fld("canal", "Canal preferido", { opts: CAT.canales }) + "</div></fieldset></div>";

  const vConsent = (yo) => '<div class="stack-s">' + CAT.consentimientos.map((c) =>
    checkbox(c.id, !!D.consent[c.id], "<b>" + esc(c.txt) + "</b> " + (c.obligatorio ? tag("Obligatorio", "negative") : tag("Opcional", "neutral")), c.ayuda ? esc(c.ayuda) : "", "data-c")).join("") +
    (D.err.consent ? alerta(esc(D.err.consent), "negative") : "") +
    '<p class="mut" style="font-size:13px">' + (yo ? "Puedes retirar tu consentimiento cuando quieras. Cada vez que alguien vea tus datos, queda registrado." : "Lee los consentimientos con la persona. Los dos obligatorios son bloqueantes: sin ellos no se crea expediente.") + "</p></div>";

  const vMapa = (dims) => dims.map((d) =>
    '<div class="bc-dim" data-dim="' + d.id + '"><h3>' + esc(d.n) + (d.opcional ? ' <span class="mut" style="font-weight:400">(opcional)</span>' : "") + '</h3><p class="mut">' + esc(d.q) + '</p><div class="stack-s" role="radiogroup" aria-label="' + esc(d.n) + '">' +
    d.o.map((t, i) => { const v = "var"[i]; return radio(D.mapa[d.id] === v, esc(t) + " " + sem(v), 'data-act="sem" data-d="' + d.id + '" data-v="' + v + '"'); }).join("") + "</div></div>").join("") +
    (D.err.mapa ? '<div style="margin-top:12px">' + alerta(esc(D.err.mapa), "negative") + "</div>" : "");

  const wiz = (o) =>
    '<div class="bc-page narrow stack"><div class="stack-s"><span class="bc-eyebrow">' + esc(o.eyebrow) + "</span><h1>" + esc(o.titulo) + "</h1>" + (o.sub ? '<p class="mut">' + o.sub + "</p>" : "") + "</div>" +
    stepper(o.pasos, o.pos) +
    (o.ejemplo ? '<div class="bc-ejemplo">' + btn("Completar con datos de ejemplo", { v: "quiet", size: "small", icon: "sparkles", act: "ejemplo", a: { "data-k": o.ejemplo } }) + "</div>" : "") +
    card(o.cuerpo) +
    '<div class="bc-wiz-f">' + btn("Atrás", { v: "mute", href: o.atras }) + (o.extra || "") + btn(o.sig || "Continuar", { act: o.act, iconEnd: o.sigIcon || "arrow-right", a: { id: "btn-sig" } }) + "</div></div>";

  const bloquesMapa = (m, compacto) => CAT.bloques.map((b) => {
    const ds = CAT.dimensiones.filter((d) => d.b === b.id && m[d.id]);
    return ds.length ? '<div class="bc-bl"><h3><i style="--c:var(--bc-rb' + (CAT.bloques.indexOf(b) + 1) + ')"></i>' + esc(b.nombre) + "</h3>" + ds.map((d) => compacto ? '<div class="bc-d"><i class="bc-dd bc-dd--' + m[d.id] + '" role="img" aria-label="' + SEM[m[d.id]][0] + '"></i><span class="grow">' + esc(d.n) + "</span></div>" : '<div class="bc-d"><span class="grow">' + esc(d.n) + "</span>" + sem(m[d.id]) + "</div>").join("") + "</div>" : "";
  }).join("");

  /* Radar de 4 ejes (uno por bloque), como en la presentación: r=0, a=.5, v=1; el centro es «sin evaluar». */
  const RB = [["b1", 0, -1, "m"], ["b2", 1, 0, "s"], ["b3", 0, 1, "m"], ["b4", -1, 0, "e"]], VSC = { r: 0, a: 0.5, v: 1 };
  const mapaRadar = (m) => {
    const cx = 220, cy = 124, R = 92, pt = (dx, dy, f) => [cx + dx * R * f, cy + dy * R * f];
    const val = RB.map(([b]) => { const v = CAT.dimensiones.filter((d) => d.b === b && m[d.id]).map((d) => VSC[m[d.id]]); return v.length ? 0.2 + 0.8 * (v.reduce((x, y) => x + y, 0) / v.length) : 0.1; });
    const ring = (f) => RB.map(([, dx, dy]) => pt(dx, dy, f).join(",")).join(" ");
    const lbl = RB.map(([b, dx, dy, an], i) => { const [x, y] = pt(dx, dy, 1.0), n = esc(CAT.bloques.find((k) => k.id === b).nombre); return '<text class="bc-rd-ax' + (an === "s" ? " s" : an === "e" ? " e" : "") + '" x="' + (x + dx * 10) + '" y="' + (dy < 0 ? y - 10 : dy > 0 ? y + 17 : y + 4) + '">' + n + "</text>"; }).join("");
    const dots = RB.map(([, dx, dy], i) => { const [x, y] = pt(dx, dy, val[i]); return '<circle class="bc-rd-d" style="--c:var(--bc-rb' + (i + 1) + ')" r="7.5" cx="' + x + '" cy="' + y + '"/>'; }).join("");
    return '<svg class="bc-radar" viewBox="0 0 440 250" role="img" aria-label="Mapa de Vida por bloque"><g class="bc-rd-g"><polygon points="' + ring(1) + '"/><polygon points="' + ring(0.66) + '"/><polygon points="' + ring(0.33) + '"/><path d="M' + cx + " " + (cy - R) + "V" + (cy + R) + "M" + (cx - R) + " " + cy + "H" + (cx + R) + '"/></g><polygon class="bc-rd-p" points="' + RB.map(([, dx, dy], i) => pt(dx, dy, val[i]).join(",")).join(" ") + '"/>' + dots + lbl + "</svg>";
  };
  const mapaBloques = (m) => '<div class="bc-rd-leg">' + CAT.bloques.map((b, i) => {
    const c = { r: 0, a: 0, v: 0 }; CAT.dimensiones.filter((d) => d.b === b.id && m[d.id]).forEach((d) => c[m[d.id]]++);
    return '<div class="bc-rd-row"><i style="--c:var(--bc-rb' + (i + 1) + ')"></i><span class="grow">' + esc(b.nombre) + "</span>" + mini(c.r + c.a + c.v ? Object.fromEntries(CAT.dimensiones.filter((d) => d.b === b.id && m[d.id]).map((d) => [d.id, m[d.id]])) : {}) + "</div>";
  }).join("") + "</div>";
  const perfilMapa = (m) => '<div class="bc-rd">' + mapaRadar(m) + mapaBloques(m) + "</div>";

  /* ════════ CIUDADANO ════════ */
  const yoP = () => S.ciudadano && per(S.ciudadano);
  /* Piezas propias del Ciudadano (cz-*): lo que el SDK no trae. */
  const BRUJULA_SVG = '<svg class="cz-brujula" width="300" height="300" viewBox="0 0 300 300" aria-hidden="true"><circle cx="150" cy="150" r="140" fill="none" stroke="#2B2D45" stroke-width="1.5"/><circle cx="150" cy="150" r="100" fill="none" stroke="#2B2D45" stroke-width="1.5"/><circle cx="150" cy="150" r="60" fill="none" stroke="#33354F" stroke-width="1.5"/><circle cx="150" cy="150" r="7" fill="#FF9A5C"/><circle cx="78" cy="88" r="9" fill="#17B26A"/><circle cx="232" cy="190" r="9" fill="#F79009"/><circle cx="120" cy="246" r="9" fill="#5B8DEF"/><path d="M150 150 78 88M150 150l82 40M150 150l-30 96" stroke="#4A4D6A" stroke-width="1.5" stroke-dasharray="4 5"/></svg>';
  const CZ_ICO = { vivienda: "home", ingresos: "banknote", alimentacion: "basket", salud: "favorite", documentacion: "file-text", red: "users", familia: "users-group", menores: "user-circle", cuidados: "hands-heart", empleo: "employees", formacion: "learning", movilidad: "car", digital: "laptop", autonomia: "accessibility", direccion: "target", comunidad: "handshake" };
  const CZ_CAT = { "Vivienda": "home", "Alimentación": "basket", "Salud y Bienestar": "favorite", "Empleo": "employees", "Formación": "learning", "Documentación y Trámites": "file-text", "Red de Apoyo": "users", "Competencias Digitales": "laptop" };
  const CZ_ST = { "Pendiente": ["Revisando", 2, "a"], "Aprobada": ["Aprobado", 3, "v"], "En lista de espera": ["En lista", 2, "b"], "Falta información": ["Falta info", 2, "a"], "Rechazada": ["Rechazado", 3, "r"] };
  const czSt = (e) => tag((CZ_ST[e] || [e])[0], ST[e] || "neutral");
  const czCuenta = (m) => { const c = { r: 0, a: 0, v: 0 }; Object.values(m || {}).forEach((v) => { if (c[v] != null) c[v]++; }); return c; };
  let czFiltro = "todos";
  function cBienvenida() {
    return '<div class="cz-bienv"><div class="bc-hero cz-hero"><div class="cz-marca">' + ic("globe-pin") + "Brújula Ciudadana</div>" + BRUJULA_SVG + "<h1>Toda tu ayuda,<br><span>en un solo sitio</span></h1></div>" +
      '<h2 class="cz-pasos-t" id="cz-como">Cómo funciona</h2><ul class="cz-pasos" aria-labelledby="cz-como">' + [["user-plus", "Te registras", "5 min"], ["phone", "Un conector te llama", "24–72 h"], ["map-pin", "Recibes tu ruta", "En tu zona"]].map(([i, t, n]) => '<li><span class="cz-pi">' + ic(i) + "</span><b>" + t + "</b><span>" + n + "</span></li>").join("") + "</ul>" +
      '<div class="cz-cta">' + btn("Empezar", { iconEnd: "arrow-right", act: "empezar-yo", a: { id: "btn-registrarme" } }) + btn("Ya tengo expediente", { v: "quiet", act: "entrar-ejemplo", a: { id: "btn-ejemplo" } }) + '<div class="cz-lock">' + ic("lock") + "Solo con tu permiso</div></div></div>";
  }
  const PASOS_YO = ["Consentimiento", "Tus datos", "Cómo estás", "Dónde te atienden"];
  const AUTO = CAT.autoevaluacion;
  const AUTO_EJ = { a1: "a", a2: "a", a3: "r", a4: "v", a5: "a", a6: "a", a7: "r", a8: "a" };
  function cRegistro(paso, n) {
    if (!D || D.tipo !== "yo") D = nuevo("yo");
    const b = { pos: paso - 1 };
    if (paso === 1) return czWiz(Object.assign(b, { titulo: "Tus permisos", cuerpo: czConsent(), atras: "#/inicio", act: "yo-1" }));
    if (paso === 2) return czWiz(Object.assign(b, { titulo: "Sobre ti", cuerpo: czDatos(), atras: "#/registro/1", act: "yo-2", ejemplo: "datos" }));
    if (paso === 3) {
      const q = AUTO[Math.min(Math.max(n || 1, 1), AUTO.length) - 1], i = AUTO.indexOf(q);
      return czWiz(Object.assign(b, { titulo: q.q, icono: q.icono, eyebrow: "¿Cómo estás hoy? · " + q.sistema, sub: (i + 1) + "/" + AUTO.length, cuerpo: czPregunta(q), atras: i ? "#/registro/3/" + i : "#/registro/2", act: "yo-3", ejemplo: i ? "" : "mapa", sig: i < AUTO.length - 1 ? "Siguiente" : "Continuar" }));
    }
    const urg = Object.values(D.auto).includes("r");
    return czWiz(Object.assign(b, {
      titulo: "Elige dónde te atienden", atras: "#/registro/3/" + AUTO.length, act: "yo-crear", sig: "Crear mi expediente", sigIcon: "check", cuerpo: czEntidades(),
      pie: '<div class="cz-plazo">' + ic("clock") + (urg ? "Te llamamos en menos de 24 h" : "Te llamamos en 5 días hábiles como máximo") + "</div>"
    }));
  }
  /* Asistente del ciudadano: cabecera con atrás y progreso, cuerpo y botón fijo abajo. */
  const czWiz = (o) => '<div class="bc-page cz-pg cz-wiz"><div class="cz-cab' + (o.eyebrow ? "" : " cz-cab--t") + '"><a class="cz-atras" href="' + o.atras + '" aria-label="Atrás">' + ic("chevron-left") + "</a>" + (o.eyebrow ? "" : '<h1 class="cz-tit">' + esc(o.titulo) + "</h1>") + '<span class="cz-pn">' + (o.pos + 1) + "/" + PASOS_YO.length + '</span><div class="cz-prog" role="img" aria-label="Paso ' + (o.pos + 1) + ' de ' + PASOS_YO.length + '">' + PASOS_YO.map((x, i) => '<i class="' + (i <= o.pos ? "on" : "") + '"></i>').join("") + "</div></div>" +
    '<div class="cz-cuerpo">' + (o.icono ? '<div class="cz-ico">' + ic(o.icono) + "</div>" : "") + (o.eyebrow ? "<h1>" + esc(o.titulo) + '</h1><span class="cz-qk">' + esc(o.eyebrow) + (o.sub ? ' <b class="cz-qn">' + o.sub + "</b>" : "") + "</span>" : "") +
    (o.ejemplo ? '<div class="bc-ejemplo">' + btn("Completar con datos de ejemplo", { v: "quiet", size: "small", icon: "sparkles", act: "ejemplo", a: { "data-k": o.ejemplo } }) + "</div>" : "") + o.cuerpo + "</div>" +
    '<div class="cz-pie">' + (o.pie || "") + btn(o.sig || "Continuar", { act: o.act, iconEnd: o.sigIcon || "arrow-right", a: { id: "btn-sig" } }) + "</div></div>";
  const CZ_PERM = { privacidad: ["Política de privacidad", "Necesario"], tratamiento: ["Tratar mis datos", "Necesario"], entidades: ["Compartir mi itinerario", "Nunca tu diagnóstico"], comunicaciones: ["Recibir avisos", "Por tu canal preferido"] };
  const czConsent = () => '<div class="cz-card cz-perm">' + CAT.consentimientos.map((c) => { const t = CZ_PERM[c.id] || [c.txt, c.obligatorio ? "Necesario" : ""]; return checkbox(c.id, !!D.consent[c.id], '<span class="cz-pt">' + esc(t[0]) + '</span><span class="cz-ps' + (c.obligatorio ? " req" : "") + '">' + esc(t[1]) + "</span>", "", "data-c"); }).join("") + "</div>" +
    (D.err.consent ? alerta(esc(D.err.consent), "negative") : "") + '<div class="cz-nota">' + ic("eye") + "Verás quién consulta tus datos</div>";
  /* Opciones únicas (documento, canal, idioma): botones que escriben en D.datos igual que el select. */
  const czOpt = (k, v, cls, inner) => '<button type="button" role="radio" class="' + cls + '" aria-checked="' + (D.datos[k] === v) + '" data-act="c-set" data-k="' + k + '" data-v="' + esc(v) + '">' + (inner || esc(v)) + "</button>";
  const czGrupo = (k, label, cls, opts, inner) => '<div class="cz-grupo"><span class="cz-gl" id="g-' + k + '">' + label + '</span><div class="' + cls + '" role="radiogroup" aria-labelledby="g-' + k + '">' + opts.map((v) => czOpt(k, v, cls + "-o", inner && inner(v))).join("") + "</div>" + (D.err[k] ? '<p class="cz-err" id="e-' + k + '">' + esc(D.err[k]) + "</p>" : "") + "</div>";
  /* Idioma admite varios: lista en el borrador (D.datos.idioma), texto "A, B" al crear la persona. */
  const czLista = (v) => (Array.isArray(v) ? v : v ? String(v).split(", ") : []);
  const czMulti = (k, label, cls, opts) => '<div class="cz-grupo"><span class="cz-gl" id="g-' + k + '">' + label + '</span><div class="' + cls + '" role="group" aria-labelledby="g-' + k + '">' + opts.map((v) => '<button type="button" role="checkbox" class="' + cls + '-o" aria-checked="' + czLista(D.datos[k]).includes(v) + '" data-act="c-multi" data-k="' + k + '" data-v="' + esc(v) + '">' + esc(v) + "</button>").join("") + "</div>" + (D.err[k] ? '<p class="cz-err" id="e-' + k + '">' + esc(D.err[k]) + "</p>" : "") + "</div>";
  const CZ_CANAL = { "WhatsApp": "message-circle", "Teléfono": "phone", "Email": "mail" };
  const czDatos = () => '<div class="cz-card cz-datos"><div class="cz-g2">' + fld("nombre", "Nombre") + fld("apellidos", "Apellidos") + "</div>" + fld("tel", "Teléfono", { type: "tel", mode: "tel", ph: "+34 600 000 000" }) +
    '<div class="cz-g2">' + fld("nac", "Nacimiento", { type: "date" }) + fld("cp", "Código postal", { mode: "numeric", ph: "28000" }) + "</div>" + fld("municipio", "Municipio") + fld("email", "Email", { type: "email", opc: true }) + "</div>" +
    czGrupo("docTipo", "¿Documento nacional?", "cz-seg", ["Sí", "En trámite", "No"].filter((x) => CAT.documento.includes(x))) +
    czGrupo("canal", "¿Cómo te contactamos?", "cz-fichas", CAT.canales, (v) => ic(CZ_CANAL[v] || "message-text") + "<span>" + esc(v) + "</span>") +
    czMulti("idioma", "Idiomas que hablas", "cz-chips", CAT.idiomas);
  /* Cada pregunta del Mapa de Vida: ícono, pregunta grande y tres respuestas con el color del semáforo. */
  const czPreguntas = (dims) => '<div class="cz-qs">' + dims.map((d) => '<section class="bc-dim cz-q" data-dim="' + d.id + '"><div class="cz-qh"><div class="cz-qi">' + ic(CZ_ICO[d.id] || "target") + '</div><div><span class="cz-qk">' + esc(d.n) + "</span><h2>" + esc(d.q) + '</h2></div></div><div class="cz-qo" role="radiogroup" aria-label="' + esc(d.n) + '">' +
    d.o.map((t, i) => { const v = "var"[i]; return radio(D.mapa[d.id] === v, '<i class="cz-dot cz-' + v + '"></i>' + esc(t), 'data-act="sem" data-d="' + d.id + '" data-v="' + v + '"'); }).join("") + "</div></section>").join("") + "</div>" +
    (D.err.mapa ? alerta(esc(D.err.mapa), "negative") : "");
  /* Una pregunta por pantalla: la respuesta va a D.auto y se traduce al Mapa de Vida al crear el expediente. */
  const czPregunta = (q) => '<section class="bc-dim cz-q cz-q1" data-q="' + q.id + '"><div class="cz-qo" role="radiogroup" aria-label="' + esc(q.q) + '">' +
    q.o.map((t, i) => { const v = "var"[i]; return radio(D.auto[q.id] === v, '<i class="cz-dot cz-' + v + '"></i>' + esc(t), 'data-act="c-auto" data-q="' + q.id + '" data-v="' + v + '"'); }).join("") + "</div></section>" +
    (D.err.auto ? alerta(esc(D.err.auto), "negative") : "");
  /* Mini-mapa ilustrativo: los pines están en posiciones fijas, no son coordenadas reales. */
  const CZ_PIN = [[92, 52], [270, 40], [230, 128]];
  const czEntidades = () => '<div class="cz-map" role="img" aria-label="Mapa con ' + S.entidades.length + ' entidades cerca de ti"><svg viewBox="0 0 350 168" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><path d="M-10 120 C 80 90, 140 150, 220 110 S 340 60, 370 80" stroke="#fff" stroke-width="14" fill="none"/><path d="M60 -10 L 110 180" stroke="#fff" stroke-width="10"/><path d="M250 -10 L 230 180" stroke="#fff" stroke-width="8"/><rect x="140" y="20" width="60" height="40" rx="8" fill="#D6EBDD"/><circle cx="175" cy="96" r="22" fill="rgba(91,141,239,.18)"/><circle cx="175" cy="96" r="7" fill="#2E6BE6" stroke="#fff" stroke-width="3"/></svg>' +
    S.entidades.map((e, i) => { const q = CZ_PIN[i % 3]; return '<span class="cz-pin' + (D.entidad === e.id ? " on" : "") + '" style="left:' + (q[0] / 3.5).toFixed(1) + "%;top:" + (q[1] / 1.68).toFixed(1) + '%" aria-hidden="true">' + (i + 1) + "</span>"; }).join("") + "</div>" +
    '<div class="cz-ents" role="radiogroup" aria-label="Entidad">' + S.entidades.map((e, i) => '<button type="button" role="radio" class="cz-ent" aria-checked="' + (D.entidad === e.id) + '" data-act="ent" data-e="' + e.id + '"><span class="cz-en">' + (i + 1) + '</span><span class="cz-et"><b>' + esc(e.nombre) + "</b><span>" + esc(e.zona) + "</span></span></button>").join("") + "</div>";
  function cInicio() {
    const p = yoP(); if (!p) return cBienvenida();
    const sols = solsDe(p.id), c = p.conector && con(p.conector), pend = sols.filter((s) => s.estado === "Pendiente");
    const pasos = [];
    if (!c) pasos.push(["phone", "Espera la llamada de tu conector", ent(p.entidad).nombre + " te contactará por " + p.canal + (Object.values(p.mapa).includes("r") ? " en menos de 24 horas." : " en un máximo de 5 días hábiles.")]);
    if (p.mapaTipo === "corto") pasos.push(["clipboard-list", "Completa tu Mapa de Vida", "En la entrevista con tu conector completas las " + (CAT.dimensiones.length - Object.keys(p.mapa).length) + " áreas que faltan."]);
    pend.forEach((s) => { const r = rec(s.recurso); pasos.push(["clock", ent(r.entidad).nombre + " está revisando tu solicitud", r.nombre + " · " + plazo(r)]); });
    if (!pasos.length) pasos.push(["check-circle", "Todo al día", "Tu conector te avisará si hay algo nuevo."]);
    const cn = czCuenta(p.mapa), tot = cn.r + cn.a + cn.v, L = 163.4;
    let off = 0;
    const arcos = ["v", "a", "r"].map((k) => { const l = tot ? cn[k] / tot * L : 0, s = l ? '<circle class="cz-sv ' + k + '" cx="32" cy="32" r="26" stroke-dasharray="' + l.toFixed(1) + " " + L + '" stroke-dashoffset="' + (-off).toFixed(1) + '" transform="rotate(-90 32 32)"/>' : ""; off += l; return s; }).join("");
    const hdr = c ? '<div class="cz-cn">' + avatar(ini(c.nombre), "blue", "large") + '<div class="grow"><span class="cz-k">Tu conector</span><b>' + esc(c.nombre) + '</b></div><button type="button" class="cz-rb" data-act="c-contacto" aria-label="Escribir a ' + esc(c.nombre) + '">' + ic("message-circle") + '</button><button type="button" class="cz-rb acc" data-act="c-contacto" aria-label="Llamar a ' + esc(c.nombre) + '">' + ic("phone") + "</button></div>"
      : '<div class="cz-cn">' + avatar("?", "amber", "large") + '<div class="grow"><span class="cz-k">Tu conector</span><b>Te estamos asignando uno</b></div></div>';
    return '<div class="bc-page cz-pg cz-inicio">' + (S.recienCreado === p.id ? alerta("<b>Tu expediente está creado.</b> Número " + esc(p.id) + ".", "positive") : "") +
      '<div class="cz-hola"><div><span>Hola,</span><h1>' + esc(p.nombre) + '</h1></div><a class="cz-me" href="#/privacidad" aria-label="Mi privacidad">' + avatar(ini(nom(p)), "orange", "large") + "</a></div>" +
      '<div class="cz-dark" id="mi-conector">' + hdr + pasos.slice(0, 2).map(([i, t, d]) => '<div class="cz-pr"><span class="cz-pi">' + ic(i) + '</span><div class="grow"><b>' + esc(t) + "</b><span>" + esc(d) + "</span></div></div>").join("") + "</div>" +
      '<a class="cz-ring" href="#/mapa"><svg width="64" height="64" viewBox="0 0 64 64" role="img" aria-label="Mapa de Vida: ' + cn.r + " necesitan apoyo, " + cn.a + " en proceso, " + cn.v + ' estables"><circle class="cz-pista" cx="32" cy="32" r="26"/>' + arcos + '</svg><div class="grow"><b>Mi Mapa de Vida</b><div class="cz-cuentas"><span><b class="r">' + cn.r + "</b> apoyo</span><span><b class=\"a\">" + cn.a + "</b> proceso</span><span><b class=\"v\">" + cn.v + "</b> bien</span></div></div>" + ic("chevron-right") + "</a>" +
      '<div class="cz-sh"><h2>Mis recursos</h2>' + (sols.length ? '<a href="#/recursos">Ver todos</a>' : "") + "</div>" +
      (sols.length ? '<div class="cz-minis">' + sols.slice(0, 3).map((s) => { const r = rec(s.recurso); return '<div class="cz-mini cz-e-' + CZ_ST[s.estado][2] + '"><span class="cz-ri">' + ic(CZ_CAT[r.cat] || "hands-heart") + "</span><b>" + esc(r.nombre) + "</b>" + czSt(s.estado) + "</div>"; }).join("") + "</div>" : '<p class="cz-vacio">Aún no tienes recursos.</p>') + "</div>";
  }
  function cRecursos() {
    const p = yoP(); if (!p) return cBienvenida();
    const sols = solsDe(p.id);
    const FIL = [["todos", "Todos · " + sols.length, () => true], ["activos", "Activos", (s) => s.estado === "Aprobada"], ["tramite", "En trámite", (s) => ["Pendiente", "En lista de espera", "Falta información"].includes(s.estado)]];
    const lista = sols.filter((FIL.find((f) => f[0] === czFiltro) || FIL[0])[2]);
    return '<div class="bc-page cz-pg cz-recursos"><h1>Mis recursos</h1>' +
      '<div class="cz-tabs" role="tablist" aria-label="Filtro">' + FIL.map(([k, t]) => '<button type="button" role="tab" aria-selected="' + (k === czFiltro) + '" data-act="c-filtro" data-v="' + k + '">' + t + "</button>").join("") + "</div>" +
      '<div class="cz-lista" id="mis-recursos">' + (lista.length ? lista.map((s) => {
        const r = rec(s.recurso), [fin, n, k] = CZ_ST[s.estado];
        return '<article class="cz-rec cz-e-' + k + '"><div class="cz-rh"><span class="cz-ri">' + ic(CZ_CAT[r.cat] || "hands-heart") + '</span><div class="grow"><b>' + esc(r.nombre) + "</b><span>" + esc(ent(r.entidad).nombre) + "</span></div>" + czSt(s.estado) + "</div>" +
          '<div class="cz-etapas" role="img" aria-label="' + esc(r.nombre) + ": " + s.estado.toLowerCase() + '"><div class="cz-barra"><i></i><i class="' + (n >= 2 ? "" : "off") + '"></i><i class="' + (n >= 3 ? "" : "off") + '"></i></div><div class="cz-et3"><span>Solicitado</span><span>Revisión</span><span class="' + (n >= 3 ? "fin" : "") + '">' + (n >= 3 ? fin : "Resultado") + "</span></div></div>" +
          (s.estado === "Rechazada" && s.motivo ? '<p class="cz-mot">' + esc(s.motivo) + "</p>" : "") + "</article>";
      }).join("") : '<p class="cz-vacio">' + (sols.length ? "Nada en esta lista." : "Aún no tienes recursos. Tu conector te los propondrá.") + "</p>") + "</div></div>";
  }
  function cMapa() {
    const p = yoP(); if (!p) return cBienvenida();
    const cn = czCuenta(p.mapa), BL = [["Básico", ["vivienda", "ingresos", "alimentacion", "salud"]], ["Entorno", ["documentacion", "red", "familia", "menores"]], ["Autonomía", ["cuidados", "empleo", "formacion", "movilidad"]], ["Participación", ["digital", "autonomia", "direccion", "comunidad"]]];
    const CORTO_D = { alimentacion: "Comida", salud: "Salud", documentacion: "Trámites", menores: "Infancia", formacion: "Formación", digital: "Digital", autonomia: "Autonomía", direccion: "Gestión", comunidad: "Comunidad", ingresos: "Ingresos", vivienda: "Vivienda", red: "Red", familia: "Familia", cuidados: "Cuidados", empleo: "Empleo", movilidad: "Movilidad" };
    const SM = { r: "necesita apoyo", a: "en proceso", v: "estable" }, falta = 16 - cn.r - cn.a - cn.v;
    const chip = (k, t, n) => '<span class="cz-chip"><i class="cz-dot cz-' + k + '"></i>' + t + " · " + n + "</span>";
    return '<div class="bc-page cz-pg cz-mapa"><h1>Mi Mapa de Vida</h1><div class="cz-chips-r">' + chip("r", "Apoyo", cn.r) + chip("a", "Proceso", cn.a) + chip("v", "Bien", cn.v) + (falta ? chip("n", "Por completar", falta) : "") + "</div>" +
      BL.map(([t, ids]) => '<section class="cz-bl"><h2>' + t + '</h2><div class="cz-tiles">' + ids.map((id) => { const v = p.mapa[id]; return '<div class="cz-tile cz-' + (v || "n") + '" role="img" aria-label="' + CORTO_D[id] + ": " + (v ? SM[v] : "sin evaluar") + '">' + ic(CZ_ICO[id]) + "<span>" + CORTO_D[id] + "</span></div>"; }).join("") + "</div></section>").join("") + "</div>";
  }
  function cPrivacidad() {
    const p = yoP(); if (!p) return cBienvenida();
    const acc = S.accesos.filter((a) => a.persona === p.id).sort((x, y) => y.cuando.localeCompare(x.cuando));
    const on = !!p.consent.entidades, ents = [...new Set([p.entidad].concat(solsDe(p.id).map((s) => rec(s.recurso).entidad)))];
    const sw = (c, lbl, on2) => '<button type="button" class="cz-sw" role="switch" aria-checked="' + on2 + '" data-act="consent" data-c="' + c + '" aria-label="' + lbl + '"><i></i></button>';
    const sig = (t) => { const x = ini(t); return x.length < 2 ? t.slice(0, 2).toUpperCase() : x; };
    const corta = (f) => f.slice(0, 10) === hoy() ? "Hoy" : new Date(f.slice(0, 10) + "T00:00").toLocaleDateString("es-ES", { day: "numeric", month: "short" }).replace(".", "");
    const COL = { e1: "blue", e2: "teal", e3: "orange" };
    return '<div class="bc-page cz-pg cz-priv"><h1>Privacidad</h1><div class="cz-stack" id="consentimientos"><div class="cz-dark"><div class="cz-cn"><div class="grow"><b class="cz-g">Compartir mi itinerario</b><span class="cz-sub' + (on ? " on" : "") + '">' + (on ? ents.length + (ents.length > 1 ? " entidades ven" : " entidad ve") + " recurso y estado" : "Solo tu entidad ve tu expediente") + "</span></div>" + sw("entidades", "Compartir mi itinerario con otras entidades", on) + "</div>" +
      '<div class="cz-cadena" aria-hidden="true">' + avatar(ini(nom(p)), "orange", "medium") + ents.map((e, i) => '<span class="cz-lin' + (i && !on ? " off" : "") + '"></span><span class="cz-nodo' + (i && !on ? " off" : "") + '">' + avatar(sig(ent(e).nombre), COL[e] || "blue", "medium") + "</span>").join("") + "</div></div>" +
      '<div class="cz-card cz-aviso"><div class="grow"><b>Recibir avisos</b><span>Por tu canal preferido</span></div>' + sw("comunicaciones", "Recibir avisos sobre mi expediente", !!p.consent.comunicaciones) + "</div></div>" +
      '<div class="cz-card cz-accesos" id="accesos"><h2>' + ic("eye") + "Quién vio tus datos</h2>" + acc.map((a) => '<div class="cz-ac">' + avatar(a.quien === "Sistema" ? "SI" : sig(a.quien), a.quien === "Sistema" ? "purple" : COL[a.entidad] || "blue", "medium") + '<div class="grow"><b>' + esc(a.quien) + "</b><span>" + esc(a.para) + "</span></div><time>" + corta(a.cuando) + "</time></div>").join("") + "</div></div>";
  }

  /* ════════ CONECTOR ════════ */
  const filaTh = () => '<div class="bc-tr bc-th"><span>Persona</span><span>Origen</span><span>Conector</span><span>Mapa de Vida</span><span>Estado</span><span>En otras entidades</span></div>';
  function otrasTxt(p) {
    const a = ajenas(p);
    if (!p.consent.entidades) return a.length || p.entidad === ENT ? '<span class="mut">No autorizado</span>' : "—";
    if (!a.length) return '<span class="mut">—</span>';
    const ents = [...new Set(a.map((s) => ent(rec(s.recurso).entidad).nombre))];
    return a.length + " recurso" + (a.length > 1 ? "s" : "") + ' · <span class="mut">' + esc(ents.join(", ")) + "</span>";
  }
  const fila = (p) => '<a class="bc-tr" href="#/persona/' + esc(p.id) + '" data-p="' + esc(p.id) + '"><span><b>' + esc(nom(p)) + '</b><br><span class="mut" style="font-size:13px">' + esc(p.id) + "</span></span>" +
    "<span>" + tag(p.origen === "autorregistro" ? "Autorregistro" : "Conector", p.origen === "autorregistro" ? "caution" : "neutral") + "</span>" +
    '<span data-l="Conector">' + (p.conector ? esc(con(p.conector).nombre) : '<span class="bc-pend">Por asignar</span>') + "</span>" +
    '<span data-l="Mapa">' + mini(p.mapa) + (p.mapaTipo === "corto" ? ' <span class="mut" style="font-size:12px">corto</span>' : "") + "</span>" +
    '<span data-l="Estado">' + esc(p.estado) + '</span><span data-l="Otras entidades">' + otrasTxt(p) + "</span></a>";

  /* Barra r/a/v del Mapa de Vida; sin datos es un trazo gris. */
  const kzBarra = (m) => {
    const c = { r: 0, a: 0, v: 0 }; Object.values(m || {}).forEach((v) => { if (c[v] != null) c[v]++; });
    if (!c.r && !c.a && !c.v) return '<span class="kz-bar kz-bar--vacio" role="img" aria-label="Mapa sin evaluar"></span>';
    return '<span class="kz-bar" role="img" aria-label="' + c.r + " necesitan apoyo, " + c.a + " en proceso, " + c.v + ' estables">' + ["r", "a", "v"].filter((k) => c[k]).map((k) => '<i class="' + k + '" style="flex:' + c[k] + '"></i>').join("") + "</span>";
  };
  const kFila = (p) => {
    const pend = solsDe(p.id).filter((s) => s.estado === "Pendiente").length, corto = p.mapaTipo === "corto";
    const sub = corto ? "Mapa por completar" : pend ? pend + (pend > 1 ? " solicitudes pendientes" : " solicitud pendiente") : p.estado;
    return '<a class="bc-tr kz-row" href="#/persona/' + esc(p.id) + '" data-p="' + esc(p.id) + '">' + avatar(ini(nom(p)), p.origen === "autorregistro" ? "amber" : "blue", "medium") +
      '<span class="kz-row__t"><b>' + esc(nom(p)) + '</b><span class="kz-sub' + (corto || pend ? " kz-hot" : "") + '">' + esc(sub) + "</span></span>" + kzBarra(p.mapa) + "</a>";
  };
  function kPersonas() {
    const mias = S.personas.filter((p) => p.conector === YO), ids = new Set(mias.map((p) => p.id));
    const porAsignar = S.personas.filter((p) => p.entidad === ENT && !p.conector).length;
    const pend = S.solicitudes.filter((s) => s.estado === "Pendiente" && ids.has(s.persona)).length;
    const apoyo = mias.filter((p) => Object.values(p.mapa || {}).includes("r")).length;
    const q = busca.trim().toLowerCase(), lista = mias.filter((p) => !q || (nom(p) + " " + p.id).toLowerCase().includes(q));
    const cifra = (n, l, cls) => '<div class="kz-stat' + (cls ? " " + cls : "") + '"><b>' + n + "</b><span>" + l + "</span></div>";
    return '<div class="bc-page kz-page kz-lista"><div class="kz-head"><div><span class="kz-eyebrow">' + esc(ent(ENT).nombre) + "</span><h1>Mis personas</h1></div>" +
      '<a class="kz-fab" id="btn-registrar" href="#/registrar/1" aria-label="Registrar persona">' + ic("plus") + '<span class="kz-fab__t">Registrar persona</span></a></div>' +
      '<div class="kz-stats">' + cifra(mias.length, "Activas", "kz-stat--dark") + cifra(pend, "Pendientes") + cifra(apoyo, "Necesitan apoyo", apoyo ? "kz-stat--alert" : "") + "</div>" +
      (porAsignar ? '<div class="kz-aviso">' + ic("bell") + "<span>" + porAsignar + (porAsignar > 1 ? " autorregistros esperan" : " autorregistro espera") + " conector.</span></div>" : "") +
      '<label class="kz-search kz-search--s">' + ic("search") + '<span class="sr">Buscar persona</span><input id="f-busca" type="search" data-busca placeholder="Buscar" value="' + esc(busca) + '" autocomplete="off"></label>' +
      '<div class="kz-list">' + (lista.length ? lista.map(kFila).join("") : '<p class="kz-vacio">Nadie coincide con la búsqueda.</p>') + "</div></div>";
  }
  const PASOS_CON = ["Búsqueda", "Consentimiento", "Perfil", "Mapa de Vida", "Recursos"];
  /* Cabecera de app nativa del registro: cerrar o atrás, cinco segmentos y contador. */
  const kzTop = (pos, atras) => '<div class="kz-top"><a class="kz-round" href="' + (pos ? atras : "#/personas") + '" aria-label="' + (pos ? "Atrás" : "Cerrar") + '">' + ic(pos ? "chevron-left" : "close") + "</a>" +
    '<div class="kz-seg" role="img" aria-label="Paso ' + (pos + 1) + ' de 5">' + PASOS_CON.map((x, i) => '<i class="' + (i <= pos ? "on" : "") + '"></i>').join("") + '</div><span class="kz-cnt">' + (pos + 1) + "/5</span></div>";
  const kzW = (paso, html) => '<div class="kz-wizwrap">' + kzTop(paso <= 3 ? paso - 1 : 3, "#/registrar/" + (paso - 1)) + html + "</div>";
  function kzBuscar() {
    const r = D.busqueda, p = r && r.p;
    const res = !r ? "" : p
      ? '<div class="kz-match">' + alerta("Ya existe · no se duplica", "warning") + '<div class="kz-match__p">' + avatar(ini(nom(p)), "amber", "large") + '<div class="grow"><b>' + esc(nom(p)) + '</b><span class="kz-id">' + esc(p.id) + "</span></div></div>" +
        '<div class="kz-tiles"><div><span>Entidad</span><b>' + esc(ent(p.entidad).nombre) + "</b></div><div><span>Conector</span><b>" + (p.conector ? esc(con(p.conector).nombre) : "Por asignar") + "</b></div></div>" +
        (p.entidad === ENT ? "" : '<p class="kz-nota">Es de otra entidad: debe autorizar compartirlo.</p>') + "</div>"
      : '<div class="kz-match">' + alerta("Sin coincidencias. Puedes crear el expediente.", "positive") + "</div>";
    const pie = p ? btn("Abrir su ficha", { href: "#/persona/" + p.id, size: "large" }) + btn("Es otra persona", { v: "mute", size: "large", act: "con-1", a: { id: "btn-sig" } })
      : btn("Continuar", { size: "large", act: "con-1", iconEnd: "arrow-right", a: { id: "btn-sig" } });
    return '<div class="kz-wizwrap kz-buscar">' + kzTop(0) + "<h1>¿Ya tiene expediente?</h1>" +
      '<label class="kz-search kz-search--l">' + ic("search") + '<span class="sr">Teléfono o documento</span><input id="f-q" type="text" inputmode="tel" data-q value="' + esc(D.q) + '" placeholder="+34 600 000 000" autocomplete="off">' +
      (D.q ? '<button type="button" class="kz-clear" data-act="k-borrar" aria-label="Borrar">' + ic("close") + "</button>" : "") + "</label>" + res +
      '<div class="kz-try">' + btn("Probar con un número nuevo", { v: "mute", size: "small", icon: "sparkles", act: "probar", a: { "data-v": "nuevo" } }) + btn("Probar con uno que ya existe", { v: "mute", size: "small", icon: "sparkles", act: "probar", a: { "data-v": "+34 688 219 774" } }) + "</div>" +
      '<div class="kz-foot">' + pie + "</div></div>";
  }
  const KZ_ICO = { "Vivienda": "home", "Documentación y Trámites": "file-text", "Alimentación": "cart", "Ingresos": "wallet", "Movilidad": "car", "Competencias Digitales": "laptop", "Empleo": "hand-money", "Formación": "checklist-pen" };
  function kzRecursos() {
    const sug = sugeridos().filter((x, i, a) => a.findIndex((y) => y.r.id === x.r.id) === i), nec = [];
    sug.forEach(({ d }) => { if (!nec.some((x) => x.n === d.n)) nec.push(d); });
    const tarjeta = ({ r, d }) => {
      const on = D.recursos.includes(r.id), mio = r.entidad === ENT;
      return '<div class="bc-opt kz-rec' + (on ? " on" : "") + '" data-act="chk" data-rec="' + r.id + '"><div class="nwt-checkbox' + (on ? " nwt-checkbox--checked" : "") + '" role="checkbox" nwt-size="medium" aria-checked="' + on + '" tabindex="0">' +
        '<span class="kz-rec__ico' + (mio ? "" : " kz-rec__ico--der") + '">' + ic(KZ_ICO[r.cat] || "hands-heart") + '</span><span class="nwt-checkbox__label kz-rec__t">' + esc(r.nombre) + '<span class="kz-rec__m"><span class="kz-who' + (mio ? "" : " kz-who--der") + '">' + (mio ? "Tu entidad" : "Derivación") + "</span>" +
        (r.urg === "Urgente" ? "Urgente · 24 h" : esc(r.modo) + (r.modo === "Solicitud" ? " · 5 días" : "")) + '</span><span class="sr">Necesidad: ' + esc(d.n) + "</span></span>" +
        '<div class="nwt-checkbox__control">' + ic("positive") + "</div></div></div>";
    };
    return '<div class="kz-wizwrap kz-sugs">' + kzTop(4, "#/registrar/7") + "<h1>Recursos para " + esc(D.datos.nombre || "la persona") + "</h1>" +
      (nec.length ? '<div class="kz-chips">' + nec.sort((x, y) => (x.v === "r" ? 0 : 1) - (y.v === "r" ? 0 : 1)).slice(0, 4).map((d) => '<span class="kz-chip kz-chip--' + d.v + '"><i></i>' + esc(d.n) + "</span>").join("") + (nec.length > 4 ? '<span class="kz-chip kz-chip--n">+' + (nec.length - 4) + "</span>" : "") + "</div>" : "") +
      '<div class="bc-ejemplo">' + btn("Completar con datos de ejemplo", { v: "quiet", size: "small", icon: "sparkles", act: "ejemplo", a: { "data-k": "recursos" } }) + "</div>" +
      '<div class="kz-reclist">' + (sug.length ? sug.map(tarjeta).join("") : '<p class="kz-vacio">Sin necesidades marcadas: no hay recursos.</p>') + "</div>" +
      '<details class="kz-det"><summary>Añadir nota interna</summary><div class="nwt-text-area" nwt-size="medium"><div class="nwt-input-box"><div class="nwt-input-box__content"><label class="nwt-input-box__label" for="f-notas">Solo la ve tu entidad</label><div class="nwt-input-box__control"><textarea id="f-notas" class="nwt-text-area__input" rows="2" data-notas>' + esc(D.notas) + "</textarea></div></div></div></div></details>" +
      '<div class="kz-foot">' + btn("Asignar itinerario", { size: "large", act: "con-crear", a: { id: "btn-sig" } }) + "</div></div>";
  }
  function kRegistrar(paso) {
    if (!D || D.tipo !== "con") D = nuevo("con");
    return paso === 1 ? kzBuscar() : paso >= 8 ? kzRecursos() : kzW(paso, kRegistrarWiz(paso));
  }
  function kRegistrarWiz(paso) {
    const pos = paso <= 3 ? paso - 1 : paso <= 7 ? 3 : 4;
    const b = { eyebrow: "Registrar persona", pasos: PASOS_CON, pos };
    if (paso === 2) return wiz(Object.assign(b, { titulo: "Consentimientos", sub: "Sin los dos obligatorios el proceso termina y no se registra nada.", cuerpo: vConsent(false), atras: "#/registrar/1", act: "con-2", extra: btn("La persona no acepta", { v: "quiet", theme: "negative", act: "no-acepta" }) }));
    if (paso === 3) return wiz(Object.assign(b, { titulo: "Perfil básico", sub: "El número de expediente, la fecha de alta, la entidad y el conector los pone el sistema.", cuerpo: vDatos(false), atras: "#/registrar/2", act: "con-3", ejemplo: "datos" }));
    if (paso >= 4 && paso <= 7) {
      const bl = CAT.bloques[paso - 4];
      return wiz(Object.assign(b, { titulo: "Mapa de Vida · " + bl.nombre, sub: "Bloque " + (paso - 3) + " de 4. Lee la pregunta y marca la respuesta de la persona.", cuerpo: vMapa(CAT.dimensiones.filter((d) => d.b === bl.id)), atras: "#/registrar/" + (paso - 1), act: "con-mapa", ejemplo: "mapa" }));
    }
    return "";
  }
  function sugeridos() {
    const out = [];
    CAT.dimensiones.forEach((d) => { const v = D.mapa[d.id]; if (v === "r" || v === "a") S.recursos.filter((r) => r.cat === d.cat && !r.pausado).forEach((r) => out.push({ r, d: { n: d.n, v } })); });
    const peso = (x) => (x.d.v === "r" ? 0 : 10) + (x.r.urg === "Urgente" ? 0 : 2) + (x.r.entidad === ENT ? 0 : 1);
    return out.sort((a, b) => peso(a) - peso(b));
  }
  function kListo(id) {
    const p = per(id); if (!p) return kPersonas();
    const sols = solsDe(p.id);
    return '<div class="kz-wizwrap kz-listo"><div class="kz-ok" role="img" aria-label="Expediente creado"><i><b>' + ic("check") + "</b></i></div>" +
      '<div class="kz-listo__t"><h1>Expediente creado</h1><p>' + esc(nom(p)) + ' · <span class="kz-id">' + esc(p.id) + "</span></p></div>" +
      card(sols.length ? sols.map((s) => { const r = rec(s.recurso); return '<div class="kz-it"><span class="kz-dot' + (r.entidad === ENT ? "" : " kz-dot--der") + '"></span><div class="grow"><b>' + esc(r.nombre) + "</b><span>" + (r.entidad === ENT ? "Tu entidad" : "Va a la bandeja de " + esc(ent(r.entidad).nombre)) + "</span></div>" + st(s.estado) + "</div>"; }).join("") : '<p class="kz-vacio">Sin recursos asignados todavía.</p>', { id: "itinerario-nuevo", cls: "kz-card" }) +
      '<div class="kz-foot">' + btn("Ver ficha", { href: "#/persona/" + p.id, size: "large" }) + btn("Registrar otra persona", { v: "mute", size: "large", act: "empezar-con" }) + "</div></div>";
  }
  function kRed() {
    return '<div class="bc-page kz-page stack"><div class="kz-head"><div><span class="kz-eyebrow">Catálogo</span><h1>Recursos de entidades</h1></div></div>' +
      S.entidades.map((e) => S.recursos.filter((r) => r.entidad === e.id && !r.pausado).map((r) => card('<span class="kz-ent">' + ic("building") + esc(e.nombre) + " · " + esc(e.zona) + '</span><div class="bc-item"><div class="grow"><div class="t">' + esc(r.nombre) + '</div><div class="s">' + esc(r.cat) + " · " + esc(r.tipo) + (r.cupo ? " · cupo " + r.cupo : "") + '</div></div><span class="row" style="gap:6px">' + tag("Acceso: " + r.modo) + tag(r.urg, r.urg === "Urgente" ? "warning" : "neutral") + "</span></div>", { cls: "kz-recurso" })).join("")).join("") + "</div>";
  }

  /* ════════ ENTIDAD ════════ */
  let filtro = "todas", busca = "", rechazando = null, btab = "asignar", asignando = null, conSel = null, ezSel = null, qL = "", fL = "todas", vL = null;
  /* Ícono y tinte por necesidad: el color solo ayuda a reconocerla, el nombre siempre va escrito. */
  const EZ_IC = { "Vivienda": "home", "Ingresos": "banknote", "Alimentación": "shopping-bag", "Salud y Bienestar": "favorite", "Documentación y Trámites": "file-text", "Red de Apoyo": "handshake", "Familia": "users-group", "Infancia y Menores": "users", "Mujer y Cuidados": "hands-heart", "Empleo": "employees", "Formación": "learning", "Movilidad": "car", "Competencias Digitales": "laptop", "Autonomía Personal y Cuidados": "accessibility", "Organización y Dirección": "clipboard-check", "Participación y Comunidad": "megaphone" };
  const EZ_AV = ["orange", "blue", "teal", "pink"];
  const ezCat = (c) => ({ ic: EZ_IC[c] || "shapes", t: Math.max(0, CATS.indexOf(c)) % 4, n: (CAT.dimensiones.find((d) => d.cat === c) || { n: c }).n });
  const ezIco = (c, nombreIc, t) => { const k = c ? ezCat(c) : { ic: nombreIc, t: t || 0 }; return '<span class="ez-ico ez-t' + k.t + '">' + ic(k.ic) + "</span>"; };
  /* Tras una acción que repinta, el foco vuelve al control pulsado para quien navega con teclado. */
  const ezRe = (sel) => { render(); const n = document.querySelector(sel); if (n) n.focus(); };
  const ezAnillo = (f, tam, trazo, texto, aria, color) => {
    const r = (tam - trazo) / 2, c = 2 * Math.PI * r, m = tam / 2;
    return '<svg class="ez-ring" width="' + tam + '" height="' + tam + '" viewBox="0 0 ' + tam + " " + tam + '" role="img" aria-label="' + esc(aria) + '"><circle cx="' + m + '" cy="' + m + '" r="' + r + '" fill="none" stroke="#ECEDF2" stroke-width="' + trazo + '"/><circle cx="' + m + '" cy="' + m + '" r="' + r + '" fill="none" style="stroke:' + (color || "var(--bc-acc)") + '" stroke-width="' + trazo + '" stroke-linecap="round" stroke-dasharray="' + (c * Math.min(1, f)).toFixed(1) + " " + c.toFixed(1) + '" transform="rotate(-90 ' + m + " " + m + ')"/><text x="' + m + '" y="' + (m + tam * 0.08) + '" text-anchor="middle" font-size="' + Math.round(tam * 0.22) + '" font-weight="700" fill="#16172B">' + esc(texto) + "</text></svg>";
  };
  function eResumen() {
    const mias = S.personas.filter((p) => p.entidad === ENT), porAsignar = mias.filter((p) => !p.conector), entrantes = entrantesDe();
    const comparten = mias.filter((p) => p.consent.entidades).length, usan = mias.filter((p) => ajenas(p).length && p.consent.entidades).length;
    const recs = S.recursos.filter((r) => r.entidad === ENT), activos = recs.filter((r) => !r.pausado);
    const hoyTxt = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" }), h = new Date().getHours();
    const cola = porAsignar.map((p) => ({ ico: ezIco(null, "user", 0), t: nom(p), s: "Autorregistro · " + fecha(p.alta), cta: "Asignar", v: "asignar", id: p.id }))
      .concat(entrantes.map((s) => { const r = rec(s.recurso); return { ico: ezIco(r.cat), t: r.nombre, s: s.por === ENT ? "Postulada por tu entidad" : "Derivación de " + ent(s.por).nombre, cta: "Decidir", v: "solicitudes", id: s.id }; })).slice(0, 5);
    const ocup = activos.filter((r) => r.cupo).slice(0, 3);
    return '<div class="bc-page stack"><div class="ez-head"><div><p class="ez-fecha">' + esc(hoyTxt[0].toUpperCase() + hoyTxt.slice(1)) + "</p><h1>" + (h < 13 ? "Buenos días" : h < 21 ? "Buenas tardes" : "Buenas noches") + '</h1></div><span class="ez-solo">' + ic("lock") + "Solo lo ve tu entidad</span></div>" +
      '<div class="kpis"><a class="ez-kpi" href="#/personas/solicitudes"><span class="ez-kpi__t">Por decidir<span class="ez-kpi__go" aria-hidden="true">' + ic("arrow-right") + '</span></span><span class="ez-kpi__n">' + (porAsignar.length + entrantes.length) + "</span></a>" +
      stat("Personas", mias.filter((p) => p.estado !== "Cerrado").length, "#/personas") + stat("Esperan conector", porAsignar.length, "#/personas/asignar", "kpi-asignar") + stat("Recursos activos", activos.length, "#/recursos", "kpi-recursos") + "</div>" +
      '<div class="cols ez-cols">' +
      card(cardH("Necesita tu decisión", '<a class="bc-back" href="#/personas/solicitudes">Solicitudes</a>') + (cola.length ? cola.map((c) => '<div class="ez-fila">' + c.ico + '<div class="grow"><div class="t">' + esc(c.t) + '</div><div class="s">' + esc(c.s) + "</div></div>" + btn(c.cta, { v: "quiet", size: "small", act: "e-ir", a: { "data-v": c.v, "data-id": c.id } }) + "</div>").join("") : '<p class="mut">Todo al día.</p>')) +
      '<div class="stack">' + card('<div class="ez-red"><div class="ez-red__r">' + ezAnillo(mias.length ? comparten / mias.length : 0, 96, 12, (mias.length ? Math.round((comparten / mias.length) * 100) : 0) + "%", comparten + " de " + mias.length + " personas comparten su itinerario") + '</div><div class="grow stack-s"><h2>En la red</h2><div class="ez-kv"><span class="mut">Usan otras entidades</span><b>' + usan + '</b></div><div class="ez-kv"><span class="mut">' + ic("lock") + "Sin permiso</span><b>" + (mias.length - comparten) + "</b></div></div></div>") +
      card(cardH("Ocupación", '<a class="bc-back" href="#/recursos">Recursos</a>') + '<div class="stack-s">' + (ocup.length ? ocup.map((r) => { const u = usoRec(r).activas; return '<div class="ez-ocu"><div class="ez-kv"><span>' + esc(r.nombre) + "</span><b>" + u + " / " + r.cupo + '</b></div><div class="bc-bar' + (u >= r.cupo ? " ez-lleno" : "") + '" aria-hidden="true"><i style="width:' + Math.min(100, Math.round((u / r.cupo) * 100)) + '%"></i></div></div>'; }).join("") : '<p class="mut">Sin plazas limitadas.</p>') + "</div>") + "</div></div></div>";
  }
  const entrantesDe = () => S.solicitudes.filter((s) => rec(s.recurso).entidad === ENT && (s.estado === "Pendiente" || s.estado === "Falta información"));
  function ePersonas() {
    const mias = S.personas.filter((p) => p.entidad === ENT);
    const F = { todas: () => true, asignar: (p) => !p.conector, apoyo: (p) => Object.values(p.mapa || {}).includes("r"), otras: (p) => ajenas(p).length && p.consent.entidades };
    if (!F[filtro]) filtro = "todas";
    const q = busca.toLowerCase(), lista = mias.filter(F[filtro]).filter((p) => !q || (nom(p) + " " + p.id).toLowerCase().includes(q));
    const EST = { "En seguimiento": "informative", "Abierto": "caution" };
    const red = (p) => { const a = ajenas(p); return !p.consent.entidades ? ic("lock") + "Sin permiso" : a.length ? a.length + " recurso" + (a.length > 1 ? "s" : "") : "—"; };
    const ezFila = (p, i) => '<a class="bc-tr ez-tr" href="#/persona/' + esc(p.id) + '" data-p="' + esc(p.id) + '"><span class="ez-per">' + avatar(ini(nom(p)), EZ_AV[i % 4], "small") + '<span><b>' + esc(nom(p)) + '</b><span class="ez-id">' + esc(p.id) + "</span></span></span>" +
      '<span data-l="Conector">' + (p.conector ? esc(con(p.conector).nombre) : '<span class="bc-pend">Por asignar</span>') + "</span><span>" + mini(p.mapa) + '</span><span class="ez-redc" data-l="En la red">' + red(p) + "</span><span>" + tag(p.estado, EST[p.estado] || "neutral") + "</span></a>";
    return '<div class="bc-page stack"><div class="ez-head"><h1>Mis personas <span class="ez-n">' + mias.length + "</span></h1></div>" +
      '<div class="row ez-filtros" role="group" aria-label="Filtro">' + [["todas", "Todas"], ["asignar", "Sin conector"], ["apoyo", "Necesitan apoyo"], ["otras", "En otras entidades"]].map(([k, t]) => '<button type="button" class="bc-chip" data-act="filtro" data-v="' + k + '" aria-pressed="' + (filtro === k) + '">' + t + (k === "todas" ? "" : " · " + mias.filter(F[k]).length) + "</button>").join("") + '<div class="nwt-searchbox ez-busca" nwt-size="medium"><div class="nwt-input-box"><div class="nwt-input-box__content"><div class="nwt-input-box__control"><div class="nwt-searchbox__container">' + ic("search") + '<label class="sr" for="f-busca">Buscar persona</label><input id="f-busca" type="text" class="nwt-searchbox__input" data-busca placeholder="Nombre o número" value="' + esc(busca) + '"></div></div></div></div></div>' + "</div>" +
      '<div class="bc-tbl"><div class="bc-tr bc-th ez-tr"><span>Persona</span><span>Conector</span><span>Mapa de Vida</span><span>En la red</span><span>Estado</span></div>' + (lista.length ? lista.map(ezFila).join("") : '<div class="bc-tr ez-tr"><span class="mut">Sin resultados.</span></div>') + "</div></div>";
  }
  function eConectores() {
    const cs = S.conectores.filter((c) => c.entidad === ENT);
    const CAP = 12; /* La semilla no trae capacidad por conector: se fija una de referencia para el anillo. */
    return '<div class="bc-page stack"><h1>Conectores <span class="ez-n">' + cs.length + '</span></h1><div class="cols ez-grid">' + cs.map((c, i) => {
      const ps = S.personas.filter((p) => p.conector === c.id), act = ps.filter((p) => p.estado !== "Cerrado");
      const pend = ps.reduce((n, p) => n + solsDe(p.id).filter((s) => s.estado === "Pendiente").length, 0), hoyOn = /^hoy/i.test(c.ultima);
      return card('<div class="ez-con"><div class="ez-con__h">' + avatar(ini(c.nombre), EZ_AV[i % 4], "large") + '<div class="grow"><b>' + esc(c.nombre) + '</b><span class="ez-sub">' + esc(c.rol) + '</span></div><span class="ez-dot' + (hoyOn ? " on" : "") + '" role="img" aria-label="Última actividad: ' + esc(c.ultima) + '"></span></div>' +
        '<div class="ez-con__m">' + ezAnillo(act.length / CAP, 88, 10, String(act.length), act.length + " personas activas de " + CAP + " de capacidad", act.length / CAP > 0.7 ? "var(--bc-acc)" : "var(--bc-ink)") +
        '<div class="grow stack-s"><div class="ez-kv"><span class="mut">Personas activas</span><b>' + act.length + '</b></div><div class="ez-kv"><span class="mut">Por decidir</span><b>' + pend + '</b></div><div class="ez-kv"><span class="mut">Última vez</span><b>' + esc(c.ultima.split(",")[0]) + "</b></div></div></div>" +
        (ps.length ? '<div class="ez-pila" role="img" aria-label="' + esc("Personas de " + c.nombre + ": " + ps.map(nom).join(", ")) + '">' + ps.slice(0, 5).map((p, k) => '<span class="ez-pila__a ez-t' + (k % 4) + '">' + esc(ini(nom(p))) + "</span>").join("") + (ps.length > 5 ? '<span class="ez-pila__a ez-t3">+' + (ps.length - 5) + "</span>" : "") + "</div>" : '<p class="mut ez-sub">Sin personas asignadas</p>') + "</div>", { a: { "data-con": c.id } });
    }).join("") + "</div></div>";
  }
  const selConector = (pid) => '<label class="sr" for="sel-' + esc(pid) + '">Conector</label>' + selNative("sel-" + esc(pid), S.conectores.filter((c) => c.entidad === ENT).map((c) => '<option value="' + c.id + '">' + esc(c.nombre) + "</option>").join(""));
  function fichaMinima(p, r) {
    const rel = CAT.dimensiones.filter((d) => d.cat === r.cat && p.mapa[d.id]), TX = { r: "apoyo", a: "en proceso", v: "estable" };
    const peor = rel.some((d) => p.mapa[d.id] === "r") ? "r" : rel.some((d) => p.mapa[d.id] === "a") ? "a" : "";
    const celda = (k, v, c) => '<div class="ez-cel' + (c ? " ez-cel--" + c : "") + '"><span>' + k + "</span><b>" + v + "</b></div>";
    return '<div class="ez-cells">' + celda("Persona", esc(p.nombre + " " + p.apellidos[0] + ".")) + celda("Zona", esc(p.municipio + " · " + p.cp)) + celda("Contacto", esc(p.canal + " · " + p.idioma)) +
      celda("Necesidad", rel.length ? rel.map((d) => esc(d.n) + " · " + TX[p.mapa[d.id]]).join(", ") : "—", peor) + '</div><div class="ez-lock">' + ic("lock") + "Ficha mínima: sin diagnóstico ni notas</div>";
  }
  function eBandeja(vista) {
    const porAsignar = S.personas.filter((p) => p.entidad === ENT && !p.conector), entrantes = entrantesDe();
    const decididas = S.solicitudes.filter((s) => rec(s.recurso).entidad === ENT && s.decidida);
    const pill = (urg) => '<span class="ez-pl' + (urg ? " ez-pl--u" : "") + '">' + (urg ? "24 h" : "5 d") + "</span>";
    const rojasDe = (p) => CAT.dimensiones.filter((d) => p.mapa[d.id] === "r").map((d) => d.n);
    if (vL !== vista) { vL = vista; qL = ""; fL = "todas"; }
    const FL = vista === "asignar"
      ? [["todas", "Todas", () => true], ["urgentes", "Necesitan apoyo", (x) => rojasDe(x).length], ["normales", "Sin urgencia", (x) => !rojasDe(x).length]]
      : [["todas", "Todas", () => true], ["urgentes", "Urgentes", (x) => rec(x.recurso).urg === "Urgente"], ["propias", "De mi entidad", (x) => x.por === ENT], ["otras", "De otras entidades", (x) => x.por !== ENT]];
    if (!FL.some(([k]) => k === fL)) fL = "todas";
    const base = vista === "asignar" ? porAsignar : entrantes, ql = qL.toLowerCase();
    const txt = (x) => (vista === "asignar" ? nom(x) + " " + x.id : rec(x.recurso).nombre + " " + per(x.persona).nombre).toLowerCase();
    const filt = base.filter(FL.find(([k]) => k === fL)[2]).filter((x) => !ql || txt(x).includes(ql));
    const barra = '<div class="row ez-filtros" role="group" aria-label="Filtro">' + FL.map(([k, t, f]) => '<button type="button" class="bc-chip" data-act="filtro2" data-v="' + k + '" aria-pressed="' + (fL === k) + '">' + t + (k === "todas" ? "" : " · " + base.filter(f).length) + "</button>").join("") +
      '<div class="nwt-searchbox ez-busca" nwt-size="medium"><div class="nwt-input-box"><div class="nwt-input-box__content"><div class="nwt-input-box__control"><div class="nwt-searchbox__container">' + ic("search") + '<label class="sr" for="f-busca2">Buscar</label><input id="f-busca2" type="text" class="nwt-searchbox__input" data-busca2 placeholder="' + (vista === "asignar" ? "Nombre o número" : "Recurso o persona") + '" value="' + esc(qL) + '"></div></div></div></div></div></div>';
    const items = vista === "asignar"
      ? filt.map((p) => ({ id: p.id, av: avatar(ini(nom(p)), "amber", "small"), t: nom(p), s: "Autorregistro · " + fecha(p.alta), pl: rojasDe(p).length ? pill(true) : "" }))
      : filt.map((s) => { const r = rec(s.recurso), p = per(s.persona); return { id: s.id, av: avatar(ini(nom(p)), "blue", "small"), t: r.nombre, s: p.nombre + " · " + (s.por === ENT ? "Tu entidad" : ent(s.por).nombre), pl: pill(r.urg === "Urgente") }; });
    const cur = items.find((i) => i.id === ezSel) || items[0];
    const lista = items.map((i) => '<button type="button" class="ez-it" aria-pressed="' + (cur && i.id === cur.id) + '" data-act="e-sel" data-id="' + esc(i.id) + '">' + i.av + '<span class="grow"><span class="ez-it__t">' + esc(i.t) + '</span><span class="ez-it__s">' + esc(i.s) + "</span></span>" + i.pl + "</button>").join("");
    const mot = (s) => '<div class="row"><label class="sr" for="mot-' + s.id + '">Motivo</label>' + selNative("mot-" + s.id, '<option value="">Motivo del rechazo (obligatorio)…</option><option>No cumple los requisitos de acceso</option><option>Fuera del territorio del recurso</option><option>El recurso no responde a la necesidad</option>') + btn("Confirmar rechazo", { theme: "negative", act: "rechazar", a: { "data-s": s.id } }) + btn("Cancelar", { v: "mute", act: "rechazar-cancel" }) + "</div>";
    let det = card('<p class="mut">' + (base.length ? "Ninguna coincide con la búsqueda." : vista === "asignar" ? "Nadie esperando conector." : "No hay solicitudes pendientes.") + "</p>");
    if (vista === "asignar" && cur) {
      const p = per(cur.id), rojas = rojasDe(p);
      det = card('<div class="ez-det"><div class="ez-det__h">' + avatar(ini(nom(p)), "amber", "large") + '<div class="grow"><p class="ez-sub">' + esc(p.id) + " · " + fecha(p.alta) + '</p><h2><a class="bc-plain" href="#/persona/' + esc(p.id) + '">' + esc(nom(p)) + "</a></h2>" + mini(p.mapa) + "</div></div>" +
        '<div class="ez-cells"><div class="ez-cel"><span>Zona</span><b>' + esc(p.municipio + " · " + p.cp) + '</b></div><div class="ez-cel"><span>Contacto</span><b>' + esc(p.canal + " · " + p.idioma) + '</b></div><div class="ez-cel' + (rojas.length ? " ez-cel--r" : "") + '"><span>Necesita apoyo</span><b>' + (rojas.length ? esc(rojas.join(", ")) : "Nada urgente") + "</b></div></div>" +
        '<div class="ez-map"><div class="ez-map__h"><h3>Mapa de Vida</h3>' + btn("Ver perfil completo", { v: "quiet", size: "small", href: "#/persona/" + encodeURIComponent(p.id) }) + "</div>" + perfilMapa(p.mapa) + "</div>" +
        
        '<div class="ez-dec">' + btn("Asignar conector", { icon: "user-plus", act: "asignar-ab", a: { "data-p": p.id, id: "btn-asignar-ab" } }) + "</div></div>", { cls: "ez-detcard", a: { "data-asignar": p.id } });
    }
    if (vista === "solicitudes" && cur) {
      const s = S.solicitudes.find((x) => x.id === cur.id), r = rec(s.recurso), p = per(s.persona);
      det = card('<div class="ez-det"><div class="ez-det__h">' + ezIco(r.cat) + '<div class="grow"><p class="ez-sub">' + esc(s.por === ENT ? "Tu entidad" : ent(s.por).nombre) + " · " + fecha(s.fecha) + "</p><h2>" + esc(r.nombre) + "</h2></div>" + st(s.estado) + "</div>" + fichaMinima(p, r) +
        '<div class="ez-map"><div class="ez-map__h"><h3>' + (p.entidad === ENT ? "Mapa de Vida" : "Perfil") + "</h3>" + btn(p.entidad === ENT ? "Ver perfil completo" : "Ver ficha mínima", { v: "quiet", size: "small", href: "#/persona/" + encodeURIComponent(p.id) }) + "</div>" +
          (p.entidad === ENT ? perfilMapa(p.mapa) : '<p class="mut">Esta persona es de ' + esc(ent(p.entidad).nombre) + ". Solo ves lo necesario para decidir; el diagnóstico completo no se comparte.</p>") + "</div>" +
        '<div class="ez-dec ez-dec--sol">' + (rechazando === s.id ? mot(s)
          : btn("Aprobar", { icon: "check", act: "decidir", a: { "data-s": s.id, "data-e": "Aprobada" } }) + btn("Lista de espera", { v: "quiet", act: "decidir", a: { "data-s": s.id, "data-e": "En lista de espera" } }) + btn("Pedir información", { v: "quiet", act: "decidir", a: { "data-s": s.id, "data-e": "Falta información" } }) + btn("Rechazar", { v: "quiet", theme: "negative", act: "rechazar-ab", a: { "data-s": s.id } })) + "</div></div>", { cls: "bc-minima ez-detcard", a: { "data-sol": s.id } });
    }
    const mAs = asignando && vista === "asignar" && per(asignando) ? '<div class="ez-mb" data-act="asignar-cancel"></div><div class="ez-modal" role="dialog" aria-modal="true" aria-labelledby="ez-mt"><h2 id="ez-mt">Asignar conector</h2><p class="mut">Elige quién acompañará a ' + esc(nom(per(asignando))) + '.</p><div class="ez-modal__l" role="radiogroup" aria-label="Conector">' + S.conectores.filter((c) => c.entidad === ENT).map((c) => radio(conSel === c.id, esc(c.nombre) + ' <span class="mut">· ' + esc(c.rol) + "</span>", 'data-act="asignar-sel" data-c="' + c.id + '"')).join("") + '</div><div class="ez-modal__f">' + btn("Cancelar", { v: "mute", act: "asignar-cancel" }) + btn("Asignar", { act: "asignar", a: { "data-p": asignando, id: "btn-asignar" } }) + "</div></div>" : "";
    return '<div class="bc-page stack"><h1>' + (vista === "asignar" ? "Por asignar" : "Solicitudes") + '</h1>' + barra + '<div class="ez-band"><div class="ez-izq"><div class="ez-lista">' + lista + "</div>" + (vista === "solicitudes" && decididas.length ? '<div class="ez-dc"><h3>Decididas</h3>' + decididas.map((x) => '<div class="ez-dc__r"><span class="grow">' + esc(rec(x.recurso).nombre) + ' <span class="mut">· ' + esc(per(x.persona).nombre) + (x.motivo ? " · " + esc(x.motivo) : "") + "</span></span>" + st(x.estado) + "</div>").join("") + "</div>" : "") + '</div><div class="ez-der">' + det + "</div></div>" + mAs + "</div>";
  }

  /* ── Mis recursos: lo que la entidad ofrece a la red ── */
  const CATS = [...new Set(CAT.dimensiones.map((d) => d.cat))];
  const REC_OPC = { tipo: ["Individual", "Grupo", "Evento"], modo: ["Libre", "Inscripción", "Solicitud"], urg: ["Normal", "Urgente"] };
  const REQ_REC = ["nombre", "cat", "tipo", "modo", "urg"];
  const EJ_REC = { nombre: "Acompañamiento en trámites de empadronamiento", cat: "Documentación y Trámites", tipo: "Individual", modo: "Solicitud", urg: "Normal", cupo: "10", desc: "Cita individual para preparar y presentar el empadronamiento.", requisitos: "Residir en Madrid" };
  const usoRec = (r) => { const ss = S.solicitudes.filter((s) => s.recurso === r.id); return { activas: ss.filter((s) => s.estado === "Aprobada").length, pend: ss.filter((s) => s.estado === "Pendiente" || s.estado === "Falta información").length, espera: ss.filter((s) => s.estado === "En lista de espera").length }; };
  function eRecursos() {
    const rs = S.recursos.filter((r) => r.entidad === ENT), activos = rs.filter((r) => !r.pausado).length;
    return '<div class="bc-page stack"><div class="bc-head"><div class="stack-s"><h1>Mis recursos</h1><p class="mut">' + activos + " de " + rs.length + " activos en la red</p></div>" + btn("Nuevo recurso", { icon: "plus", href: "#/recurso/nuevo", a: { id: "btn-nuevo-rec" } }) + "</div>" +
      '<div class="cols ez-grid">' + rs.map((r) => {
        const u = usoRec(r), on = !r.pausado, lleno = r.cupo && u.activas >= r.cupo, urg = r.urg === "Urgente";
        const estado = !on ? ["Pausado", ""] : u.pend ? [u.pend + " por decidir", "ez-uso__e--a"] : lleno ? ["Completo", ""] : ["Al día", "ez-uso__e--v"];
        return card('<div class="ez-rec__h">' + ezIco(r.cat) + '<span class="grow"></span><a class="ez-edit" href="#/recurso/' + esc(r.id) + '" aria-label="Editar ' + esc(r.nombre) + '">' + ic("edit") + "</a>" +
          '<button type="button" role="switch" class="ez-sw" aria-checked="' + on + '" aria-label="' + (on ? "Pausar " : "Reactivar ") + esc(r.nombre) + '" data-act="rec-pausa" data-r="' + esc(r.id) + '"><i></i></button></div>' +
          "<div><h2>" + esc(r.nombre) + '</h2><p class="ez-sub">' + esc(ezCat(r.cat).n) + "</p></div>" +
          '<div class="row ez-chips"><span class="ez-chip">' + esc(MODO_T[r.modo] || r.modo) + '</span><span class="ez-chip' + (urg ? " ez-chip--a" : "") + '">' + (urg ? "24 h" : "5 días") + "</span></div>" +
          '<div class="ez-uso"><div class="ez-uso__r"><span class="ez-uso__n">' + u.activas + "<small>" + (r.cupo ? " / " + r.cupo : " personas") + '</small></span><span class="ez-uso__e ' + estado[1] + '">' + estado[0] + '</span></div><div class="bc-bar' + (lleno || !on ? " ez-lleno" : "") + '" aria-hidden="true"><i style="width:' + (r.cupo ? Math.min(100, Math.round((u.activas / r.cupo) * 100)) : 100) + '%"></i></div></div>', { cls: "ez-rec" + (on ? "" : " ez-off"), a: { "data-recurso": r.id } });
      }).join("") + "</div></div>";
  }
  function eRecurso(id) {
    const r = id === "nuevo" ? null : rec(id);
    if (id !== "nuevo" && (!r || r.entidad !== ENT)) return eRecursos();
    if (!D || D.tipo !== "rec" || D.id !== id) D = { tipo: "rec", id, err: {}, datos: r ? { nombre: r.nombre, cat: r.cat, tipo: r.tipo, modo: r.modo, urg: r.urg, cupo: r.cupo ? String(r.cupo) : "", desc: r.desc || "", requisitos: r.requisitos || "" } : {} };
    const T = D.tab || "basico";
    const x = D.datos, c = x.cat ? ezCat(x.cat) : null, cupo = x.cupo ? +x.cupo : 0, nombre = (x.nombre || "").trim();
    const err = (k) => D.err[k] ? '<div class="ez-err" role="alert" data-k="' + k + '">' + ic("caution") + esc(D.err[k]) + "</div>" : "";
    const sec = (titulo, cuerpo, k, cls) => '<section class="ez-sec' + (cls ? " " + cls : "") + '"><h2>' + titulo + "</h2>" + cuerpo + (k ? err(k) : "") + "</section>";
    const segm = (k, act, opts, etiqueta) => '<div class="ez-segm" role="radiogroup" aria-label="' + etiqueta + '">' + opts.map(([v, t]) => '<button type="button" role="radio" aria-checked="' + (x[k] === v) + '" data-act="' + act + '" data-v="' + esc(v) + '">' + t + "</button>").join("") + "</div>";
    return '<div class="bc-page stack"><div class="ez-top"><a class="ez-x" href="#/recursos" aria-label="Cerrar">' + ic("close") + "</a><h1>" + (r ? "Editar recurso" : "Nuevo recurso") + "</h1>" + btn(r ? "Guardar cambios" : "Publicar en la red", { act: "rec-guardar", a: { id: "btn-sig" } }) + "</div>" +
      (r ? "" : '<div class="bc-ejemplo">' + btn("Completar con datos de ejemplo", { v: "quiet", size: "small", icon: "sparkles", act: "ejemplo", a: { "data-k": "rec" } }) + "</div>") +
      '<div class="ez-rg"><div class="stack ez-form">' +
      '<div class="nwt-tabs bc-subtabs"><div class="nwt-tabs__list" role="tablist" aria-label="Secciones">' + [["basico", "Básico"], ["acceso", "Acceso"], ["detalles", "Detalles"]].map(([k, t]) => '<button type="button" class="nwt-tabs__tab' + (k === T ? " nwt-tabs__tab--active" : "") + '" role="tab" aria-selected="' + (k === T) + '" data-act="e-tab" data-v="' + k + '"><span class="nwt-tabs__label"><span class="nwt-tabs__label-text">' + t + "</span></span></button>").join("") + "</div></div>" +
      (T === "basico" ? '<section class="ez-sec"><label class="ez-nombre" for="f-nombre"><span>Nombre</span><input id="f-nombre" data-ez-f="nombre" value="' + esc(x.nombre || "") + '" placeholder="¿Qué ofrece tu entidad?" autocomplete="off"' + (D.err.nombre ? ' aria-invalid="true"' : "") + "></label>" + err("nombre") + "</section>" +
      sec("Qué necesidad atiende", '<div class="ez-cats" role="radiogroup" aria-label="Necesidad">' + CATS.map((k) => { const m = ezCat(k); return '<button type="button" role="radio" class="ez-cat" aria-checked="' + (x.cat === k) + '" data-act="e-cat" data-v="' + esc(k) + '">' + ic(m.ic) + "<span>" + esc(m.n) + "</span></button>"; }).join("") + "</div>", "cat") : "") +
      (T === "acceso" ? sec("Cómo se accede", '<div class="ez-modos" role="radiogroup" aria-label="Acceso">' + REC_OPC.modo.map((m) => '<button type="button" role="radio" class="ez-modo" aria-checked="' + (x.modo === m) + '" data-act="e-modo" data-v="' + m + '"><b>' + esc(MODO_T[m]) + "</b><span>" + MODO_D[m] + "</span></button>").join("") + "</div>", "modo") +
      '<div class="ez-dos">' + sec("Respuesta", segm("urg", "e-urg", [["Normal", "5 días"], ["Urgente", "24 h"]], "Plazo de respuesta"), "urg") +
      sec("Plazas", '<div class="ez-cupo"><button type="button" class="ez-pm" data-act="e-cupo" data-d="-1" aria-label="Menos plazas">' + ic("minus") + '</button><span class="ez-cupo__n" aria-live="polite">' + (cupo || "Sin límite") + '</span><button type="button" class="ez-pm" data-act="e-cupo" data-d="1" aria-label="Más plazas">' + ic("plus") + "</button></div>", "cupo") + "</div>" : "") +
      (T === "detalles" ? sec("Formato", segm("tipo", "e-tipo", REC_OPC.tipo.map((t) => [t, t]), "Formato"), "tipo") +
      sec("Detalles", '<div class="grid2">' + fld("desc", "Descripción breve", { opc: true }) + fld("requisitos", "Requisito de acceso", { opc: true }) + "</div>") : "") + "</div>" +
      '<aside class="ez-prev"><span class="ez-prev__t">' + ic("eye") + 'Así lo verán los conectores</span><div class="ez-prev__c"><div class="ez-prev__h">' + (c ? ezIco(x.cat) : ezIco(null, "shapes", 0)) + "<div><span>" + esc(ent(ENT).nombre) + '</span><b class="ez-prev__nombre">' + esc(nombre || "Tu recurso") + "</b></div></div>" +
      '<div class="ez-prev__p">' + (c ? "<span>" + esc(c.n) + "</span>" : "") + (x.modo ? "<span>" + esc(MODO_T[x.modo]) + "</span>" : "") + "<span>" + (cupo ? cupo + " plazas" : "Sin límite") + "</span>" + (x.urg ? "<span>" + (x.urg === "Urgente" ? "24 h" : "5 días") + "</span>" : "") + "</div>" +
      '<p class="ez-prev__s"><i></i>' + (c ? "Se sugiere a quien marque " + esc(c.n) + " en su Mapa" : "Elige una necesidad para ver a quién se sugiere") + "</p></div></aside></div></div>";
  }
  const MODO_T = { Libre: "Acceso libre", "Inscripción": "Inscripción", Solicitud: "Por solicitud" };
  const MODO_D = { Libre: "Sin decisión", "Inscripción": "Confirma plaza", Solicitud: "Decides tú" };
  const ezCampo = (k) => (b) => { D.datos[k] = b.dataset.v; delete D.err[k]; ezRe('[data-act="' + b.dataset.act + '"][data-v="' + b.dataset.v + '"]'); };
  /* El nombre es un campo propio: actualiza la vista previa sin repintar y no pierde el foco. */
  document.addEventListener("input", (e) => {
    const t = e.target; if (!t.dataset || t.dataset.ezF == null) return;
    D.datos[t.dataset.ezF] = t.value; delete D.err[t.dataset.ezF]; t.removeAttribute("aria-invalid");
    const m = document.querySelector('.ez-err[data-k="' + t.dataset.ezF + '"]'); if (m) m.remove();
    const v = document.querySelector(".ez-prev__nombre"); if (v) v.textContent = t.value.trim() || "Tu recurso";
  });
  const validarRec = () => {
    D.err = {};
    REQ_REC.forEach((k) => { if (!String(D.datos[k] || "").trim()) D.err[k] = "Este dato es obligatorio."; });
    if (D.datos.cupo && !/^[1-9]\d*$/.test(String(D.datos.cupo).trim())) D.err.cupo = "Escribe un número de plazas, o déjalo vacío.";
    const TAB_DE = { nombre: "basico", cat: "basico", modo: "acceso", urg: "acceso", cupo: "acceso", tipo: "detalles" }, k1 = Object.keys(D.err)[0];
    if (k1) D.tab = TAB_DE[k1] || D.tab;
    return !Object.keys(D.err).length;
  };
  const rellenarRec = () => { Object.keys(EJ_REC).forEach((k) => { if (!String(D.datos[k] || "").trim() || D.err[k]) D.datos[k] = EJ_REC[k]; }); };

  /* ── ficha de persona (conector y entidad) ── */
  const vistos = new Set();
  function ficha(id) {
    const p = per(id), volver = '<a class="bc-back" href="#/personas">← ' + (ROL === "entidad" ? "Personas" : "Mis personas") + "</a>";
    if (!p) return '<div class="bc-page">' + volver + '<p class="mut">No existe este expediente.</p></div>';
    if (p.entidad !== ENT) {
      const s = solsDe(p.id).find((x) => rec(x.recurso).entidad === ENT);
      return '<div class="bc-page stack">' + volver + (s ? card(cardH("Ficha mínima") + fichaMinima(p, rec(s.recurso)) + '<div style="margin-top:14px">' + alerta("Esta persona es de " + esc(ent(p.entidad).nombre) + ". Solo ves lo necesario para decidir su solicitud.", "informative") + "</div>", { cls: "bc-minima" })
        : '<div class="bc-lock">' + ic("lock") + "<div><b>No tienes acceso a este expediente.</b><p class=\"mut\">Pertenece a otra entidad.</p></div></div>") + "</div>";
    }
    if (!vistos.has(p.id)) { vistos.add(p.id); S.accesos.push({ persona: p.id, quien: ROL === "entidad" ? "Coordinación" : con(YO).nombre, entidad: ENT, cuando: ahora(), para: ROL === "entidad" ? "Coordinación del caso" : "Seguimiento del caso" }); guardar(); }
    const prop = propias(p), aj = ajenas(p);
    const acc = S.accesos.filter((a) => a.persona === p.id).sort((x, y) => y.cuando.localeCompare(x.cuando));
    const tel = p.tel.replace(/\s/g, ""), dims = CAT.dimensiones, nEval = dims.filter((d) => p.mapa[d.id]).length;
    const cnt = (k) => dims.filter((d) => p.mapa[d.id] === k).length;
    const rojas = dims.filter((d) => p.mapa[d.id] === "r");
    const acto = (txt, icn, o) => '<' + (o.href ? "a" : 'button type="button"') + ' class="kz-act' + (o.main ? " kz-act--main" : "") + '"' + (o.href ? ' href="' + o.href + '"' : "") + ">" + ic(icn) + "<span>" + txt + "</span></" + (o.href ? "a" : "button") + ">";
    const hero = '<section class="kz-hero"><div class="kz-hero__top"><a class="kz-round kz-round--dk" href="#/personas" aria-label="' + (ROL === "entidad" ? "Volver a Personas" : "Volver a Mis personas") + '">' + ic("chevron-left") + '</a><span class="kz-id">' + esc(p.id) + "</span></div>" +
      '<div class="kz-hero__p">' + avatar(ini(nom(p)), p.origen === "autorregistro" ? "amber" : "blue", "large") + '<div class="grow"><h1>' + esc(nom(p)) + "</h1><p>" + esc(p.municipio + " " + p.cp + " · " + p.idioma + " · " + p.canal) + "</p>" +
      '<p class="kz-hero__c">' + (p.conector ? "Conector · " + esc(con(p.conector).nombre) : '<span class="kz-pend">Por asignar a un conector</span>') + "</p></div></div>" +
      '<div class="kz-acts">' + acto("Llamar", "phone", { href: "tel:" + tel, main: true }) + acto("Mensaje", "message-circle", { href: "sms:" + tel }) + acto("Postular", "plus", { href: "#/persona/" + encodeURIComponent(p.id) + "/postular" }) + "</div></section>";
    const asig = !p.conector && ROL === "entidad" ? '<div class="kz-card kz-asig"><b>Asignar conector</b><div class="row">' + selConector(p.id) + btn("Asignar", { size: "small", act: "asignar", a: { "data-p": p.id } }) + "</div></div>" : "";
    const mapa = card('<div class="kz-card-h"><h2>Mapa de Vida</h2><span class="kz-mut">' + nEval + " de " + dims.length + "</span></div>" +
      '<div class="bc-rd bc-rd--ficha">' + mapaRadar(p.mapa) + '<div class="bc-mapa">' + bloquesMapa(p.mapa, true) + '</div></div><div class="bc-clave"><span><i class="bc-dd bc-dd--r"></i>Necesita apoyo</span><span><i class="bc-dd bc-dd--a"></i>En proceso</span><span><i class="bc-dd bc-dd--v"></i>Estable</span></div>' +
      '<div class="kz-chips">' + (rojas.length ? rojas.map((d) => '<span class="kz-chip kz-chip--r"><i></i>' + esc(d.n) + "</span>").join("") : '<span class="kz-chip kz-chip--v"><i></i>Sin urgencias</span>') + "</div>" +
      (p.mapaTipo === "corto" ? '<p class="kz-nota">Versión corta: el resto se completa en la entrevista.</p>' : "") +
      "", { id: "mapa", cls: "kz-card" });
    const itin = card('<div class="kz-card-h"><h2>Itinerario</h2><span class="kz-mut">' + prop.length + "</span></div>" +
      (prop.length ? prop.map((s) => { const r = rec(s.recurso); return '<div class="kz-it"><div class="grow"><b>' + esc(r.nombre) + "</b><span>" + (r.entidad === ENT ? "Tu entidad" : esc(ent(r.entidad).nombre)) + " · " + fecha(s.fecha) + "</span></div>" + st(s.estado) + "</div>"; }).join("") : '<p class="kz-vacio">Sin recursos todavía.</p>') +
      '<div class="kz-post">' + btn("Postular a un recurso", { v: "quiet", size: "small", icon: "plus", href: "#/persona/" + encodeURIComponent(p.id) + "/postular", a: { id: "btn-postular" } }) + "</div>", { id: "itinerario", cls: "kz-card" });
    const otras = card('<div class="kz-card-h"><h2>En otras entidades</h2>' + tag(p.consent.entidades ? "Autorizado" : "Sin permiso", p.consent.entidades ? "positive" : "neutral") + "</div>" +
      (!p.consent.entidades ? '<div class="bc-lock">' + ic("lock") + "<div><b>No autorizó compartir su itinerario.</b><p class=\"mut\" style=\"font-size:14px\">No ves si participa en otras entidades.</p></div></div>"
        : aj.length ? aj.map((s) => { const r = rec(s.recurso); return '<div class="kz-it"><div class="grow"><b>' + esc(ent(r.entidad).nombre) + "</b><span>" + esc(r.nombre) + " · " + esc(r.cat) + "</span></div>" + st(s.estado) + "</div>"; }).join("") + '<p class="kz-nota">Nunca ves su diagnóstico ni sus notas.</p>'
          : '<p class="kz-vacio">No participa en otras entidades.</p>'), { id: "otras", cls: "kz-card" });
    const accesos = '<details class="kz-acc" id="accesos"><summary>' + ic("eye") + "<span>" + acc.length + (acc.length === 1 ? " consulta registrada" : " consultas registradas") + "</span>" + ic("chevron-right") + "</summary>" +
      acc.map((a) => '<div class="kz-it"><div class="grow"><b>' + esc(a.quien) + " · " + esc(ent(a.entidad).nombre) + "</b><span>" + cuando(a.cuando) + " · " + esc(a.para) + "</span></div></div>").join("") + '<p class="kz-nota">La persona puede ver esta lista.</p></details>';
    const perfil = '<details class="kz-card kz-perfil"><summary><h2>Perfil y consentimientos</h2>' + ic("chevron-down") + '</summary><div class="bc-kv">' + [["Fecha de nacimiento", fecha(p.nac)], ["Documento nacional", p.docTipo + (p.doc ? " · " + p.doc : "")], ["Teléfono", p.tel], ["Email", p.email || "—"], ["Ubicación", p.municipio + " · " + p.cp], ["Idioma", p.idioma], ["Canal preferido", p.canal], ["Alta", fecha(p.alta) + " · " + ent(p.entidad).nombre]].map(([k, v]) => "<div><span>" + k + "</span><b>" + esc(v) + "</b></div>").join("") + "</div>" +
      CAT.consentimientos.map((c) => '<div class="kz-it">' + ic(p.consent[c.id] ? "check-circle" : "close-circle") + '<span class="grow">' + esc(c.txt) + "</span>" + tag(p.consent[c.id] ? "Sí" : "No", p.consent[c.id] ? "positive" : "neutral") + "</div>").join("") + "</details>";
    return '<div class="kz-ficha">' + hero + asig + '<div class="kz-body"><div class="kz-col"><div style="order:1">' + mapa + '</div><div style="order:5">' + perfil + '</div></div><div class="kz-col"><div style="order:2">' + itin + '</div><div style="order:3">' + otras + '</div><div style="order:4">' + accesos + "</div></div></div></div>";
  }

  /* Postular es una pantalla propia (no un modal): elegir el recurso y confirmar en la barra inferior. */
  let postSel = null;
  function kPostular(id) {
    const p = per(id);
    if (!p || p.entidad !== ENT) return kPersonas();
    const tiene = new Set(solsDe(p.id).filter((s) => s.estado !== "Rechazada").map((s) => s.recurso));
    const libres = S.recursos.filter((r) => !tiene.has(r.id) && !r.pausado);
    if (!postSel || !libres.some((r) => r.id === postSel)) postSel = (libres.find((r) => r.entidad !== ENT) || libres[0] || {}).id || null;
    const fila = (r) => {
      const dis = tiene.has(r.id) || r.pausado, on = r.id === postSel, mio = r.entidad === ENT;
      return '<div class="bc-opt kz-rec' + (on ? " on" : "") + (dis ? " kz-rec--off" : "") + '"' + (dis ? "" : ' data-act="k-pos-sel" data-r="' + r.id + '"') + '><div class="nwt-radio-button' + (on ? " nwt-radio-button--checked" : "") + '" role="radio" aria-checked="' + on + '" aria-disabled="' + dis + '" tabindex="' + (dis ? -1 : 0) + '">' +
        '<span class="kz-rec__ico' + (mio ? "" : " kz-rec__ico--der") + '">' + ic(KZ_ICO[r.cat] || "hands-heart") + '</span><span class="nwt-radio-button__label kz-rec__t">' + esc(r.nombre) + '<span class="kz-rec__m"><span class="kz-who' + (mio ? "" : " kz-who--der") + '">' + esc(ent(r.entidad).nombre) + "</span></span>" +
        '<span class="kz-rec__m">' + (tiene.has(r.id) ? "Ya asignado" : r.pausado ? "Pausado" : "Acceso: " + esc(r.modo) + " · " + (r.urg === "Urgente" ? "Urgente · 24 h" : r.modo === "Solicitud" ? "Plazo 5 días" : "Sin plazo")) + "</span></span>" +
        '<div class="nwt-radio-button__control"><div class="nwt-radio-button__dot"></div></div></div></div>';
    };
    return '<div class="kz-wizwrap kz-sugs kz-postular"><div class="kz-top"><a class="kz-round" href="#/persona/' + encodeURIComponent(p.id) + '" aria-label="Volver a la ficha">' + ic("chevron-left") + "</a></div>" +
      "<h1>Postular a un recurso</h1><p class=\"kz-sub\">Para " + esc(nom(p)) + ". Si es de otra entidad, le llega a su bandeja.</p>" +
      '<div class="kz-reclist" role="radiogroup" aria-label="Recurso">' + S.entidades.map((e) => S.recursos.filter((r) => r.entidad === e.id).map(fila).join("")).join("") + "</div>" +
      '<div class="kz-foot">' + btn("Postular", { size: "large", act: "postular", a: { "data-p": p.id, id: "btn-postular", ...(postSel ? {} : { disabled: "" }) } }) + "</div></div>";
  }

  /* ── armazón por rol: sidebar del SDK + pestañas en móvil ── */
  const MENU = {
    ciudadano: () => yoP() ? [["inicio", "Mi expediente", "home", "#/inicio"], ["recursos", "Mis recursos", "hands-heart", "#/recursos"], ["mapa", "Mi Mapa de Vida", "clipboard-list", "#/mapa"], ["privacidad", "Privacidad", "shield-check", "#/privacidad"]]
      : [["inicio", "Inicio", "home", "#/inicio"], ["registro", "Registrarme", "user-plus", "#/registro/1"]],
    conector: () => [["personas", "Mis personas", "users", "#/personas"], ["registrar", "Registrar persona", "user-plus", "#/registrar/1"], ["red", "Recursos de entidades", "building", "#/red"]],
    entidad: () => { const mis = S.personas.filter((p) => p.entidad === ENT).length, asig = S.personas.filter((p) => p.entidad === ENT && !p.conector).length, sol = entrantesDe().length; return [["resumen", "Resumen", "home", "#/resumen"], ["personas", "Personas", "users", "#/personas", 0, [["personas", "Mis personas", "#/personas", mis, true], ["solicitudes", "Solicitudes", "#/personas/solicitudes", sol], ["asignar", "Por asignar", "#/personas/asignar", asig]]], ["conectores", "Conectores", "handshake", "#/conectores"], ["recursos", "Mis recursos", "hands-heart", "#/recursos"]]; }
  };
  const CORTO = { "Mi expediente": "Inicio", "Mis recursos": "Recursos", "Mi Mapa de Vida": "Mapa", "Mis personas": "Personas", "Registrar persona": "Registrar", "Recursos de entidades": "Recursos" };
  const QUIEN = {
    ciudadano: () => { const p = yoP(); return p ? [nom(p), "Ciudadano", ini(nom(p)), "orange"] : ["Invitado", "Ciudadano", "?", "orange"]; },
    conector: () => [con(YO).nombre, "Conector · " + ent(ENT).nombre, "LR", "blue"],
    entidad: () => ["Coordinación", ent(ENT).nombre, "AP", "teal"]
  };
  function shell(activo, body) {
    const m = MENU[ROL](), [n, sub, i, col] = QUIEN[ROL]();
    const badge = (c, neutro) => c ? '<span class="bc-badge' + (neutro ? " bc-badge--n" : "") + '" aria-label="' + c + (neutro ? " en total" : " pendientes") + '">' + c + "</span>" : "";
    const side = '<aside class="nwt-sidebar nwt-sidebar--mode-fixed nwt-sidebar--open"><div class="nwt-sidebar__toolbar"><div class="nwt-sidebar__toolbar__logo"><a class="bc-brand" href="' + m[0][3] + '">' + ic("globe-pin") + 'Brújula Ciudadana</a></div></div><div class="nwt-sidebar__content"><nav class="nwt-sidebar__menu" aria-label="Menú principal"><ul class="nwt-sidebar__menu__list">' +
      m.map(([k, t, icn, h, c, subs]) => {
        const enGrupo = subs && subs.some(([sk]) => sk === activo);
        const li = '<li class="nwt-sidebar__menu__item' + (k === activo && !subs ? " nwt-sidebar__menu__item--active" : "") + (enGrupo ? " bc-grupo--on" : "") + '"><a class="nwt-sidebar__menu__link" href="' + h + '"' + (subs ? "" : ' data-nav="' + k + '"') + (k === activo && !subs ? ' aria-current="page"' : "") + '><div class="nwt-sidebar__menu__content">' + ic(icn, "nwt-sidebar__menu__icon") + '<span class="nwt-sidebar__menu__label">' + t + "</span>" + badge(c) + "</div></a>";
        return li + (subs ? '<ul class="bc-sub">' + subs.map(([sk, st2, sh, sc, sn]) => '<li><a class="bc-sub__a' + (sk === activo ? " bc-sub__a--on" : "") + '" href="' + sh + '" data-nav="' + sk + '"' + (sk === activo ? ' aria-current="page"' : "") + "><span>" + st2 + "</span>" + badge(sc, sn) + "</a></li>").join("") + "</ul>" : "") + "</li>";
      }).join("") +
      '</ul></nav><div class="nwt-sidebar__footer"><div class="bc-yo">' + avatar(i, col, "small") + '<span class="grow"><b>' + esc(n) + "</b>" + esc(sub) + '</span></div><button class="nwt-sidebar__footer__logout" type="button" data-act="salir">' + ic("logout", "nwt-sidebar__menu__icon") + '<span class="nwt-sidebar__footer__logout__label">Salir de la demo</span></button></div></div></aside>';
    /* En móvil la navegación es una barra inferior, como en una app nativa. */
    const tabs = '<nav class="bc-tabbar" aria-label="Menú">' + m.flatMap(([k, t, icn, h, c, subs]) => subs ? subs.map(([sk, st2, sh, sc, sn]) => [sk, st2 === "Mis personas" ? "Personas" : st2, icn, sh, sc]) : [[k, t, icn, h, c]]).map(([k, t, icn, h, c]) => '<a href="' + h + '" data-nav="' + k + '"' + (k === activo ? ' aria-current="page"' : "") + ">" + ic(icn) + "<span>" + esc(CORTO[t] || t) + "</span>" + badge(c) + "</a>").join("") + "</nav>";
    const top = '<header class="bc-top"><a class="bc-brand" href="' + m[0][3] + '">' + ic("globe-pin") + '<span class="bc-brand-t">Brújula Ciudadana</span></a>' + avatar(i, col, "small") + "</header>";
    return '<div class="bc-shell">' + side + '<div class="bc-main">' + top + "<main>" + body + "</main>" + tabs + "</div></div>";
  }

  /* ── rutas por rol ── */
  const RUTAS = {
    ciudadano: [[/^#\/inicio$/, () => ["inicio", cInicio()]], [/^#\/registro\/(\d)(?:\/(\d))?$/, (m) => ["registro", cRegistro(+m[1], +(m[2] || 1))]], [/^#\/recursos$/, () => ["recursos", cRecursos()]], [/^#\/mapa$/, () => ["mapa", cMapa()]], [/^#\/privacidad$/, () => ["privacidad", cPrivacidad()]]],
    conector: [[/^#\/personas$/, () => ["personas", kPersonas()]], [/^#\/registrar\/(\d)$/, (m) => ["registrar", kRegistrar(+m[1])]], [/^#\/listo\/(.+)$/, (m) => ["registrar", kListo(m[1])]], [/^#\/red$/, () => ["red", kRed()]], [/^#\/persona\/([^/]+)\/postular$/, (m) => ["personas", kPostular(decodeURIComponent(m[1]))]], [/^#\/persona\/(.+)$/, (m) => ["personas", ficha(decodeURIComponent(m[1]))]]],
    entidad: [[/^#\/resumen$/, () => ["resumen", eResumen()]], [/^#\/personas$/, () => ["personas", ePersonas()]], [/^#\/conectores$/, () => ["conectores", eConectores()]], [/^#\/personas\/(solicitudes|asignar)$/, (m) => [m[1], eBandeja(m[1])]], [/^#\/bandeja$/, () => { location.replace("#/personas/asignar"); return ["personas", ""]; }], [/^#\/recursos$/, () => ["recursos", eRecursos()]], [/^#\/recurso\/(.+)$/, (m) => ["recursos", eRecurso(m[1])]], [/^#\/persona\/([^/]+)\/postular$/, (m) => ["personas", kPostular(decodeURIComponent(m[1]))]], [/^#\/persona\/(.+)$/, (m) => ["personas", ficha(decodeURIComponent(m[1]))]]]
  };
  const INICIO = { ciudadano: "#/inicio", conector: "#/personas", entidad: "#/resumen" };
  /* Las franjas bajo la barra de estado y la de gesto toman el color de la pantalla que queda justo detrás. */
  const colorEn = (y) => {
    for (let el = document.elementFromPoint(6, y); el; el = el.parentElement) {
      const c = getComputedStyle(el).backgroundColor;
      if (c && !/^rgba\(.*, 0\)$/.test(c) && c !== "transparent") return "#" + (c.match(/\d+/g) || [255, 255, 255]).slice(0, 3).map((n) => (+n).toString(16).padStart(2, "0")).join("");
    }
    return null;
  };
  function tintSafe() {
    const cs = getComputedStyle(document.documentElement), t = parseFloat(cs.getPropertyValue("--bc-safe-top")) || 0, bt = parseFloat(cs.getPropertyValue("--bc-safe-bot")) || 0;
    let f = document.getElementById("bc-safe"); if (!f) { f = document.createElement("div"); f.id = "bc-safe"; f.setAttribute("aria-hidden", "true"); document.body.prepend(f); }
    if (!t) { f.style.display = "none"; return; }
    const top = colorEn(t + 4) || "#ffffff", bot = bt ? colorEn(innerHeight - bt - 4) || top : top;
    f.style.display = ""; f.style.background = top;
    const k = top + bot; if (k !== tintSafe.ult) { tintSafe.ult = k; try { parent.postMessage({ type: "demo-estatus", color: top, bot }, "*"); } catch (e) { /* sin marco */ } }
  }
  window.__tintSafe = tintSafe;
  let tintRaf = 0;
  addEventListener("scroll", () => { if (!tintRaf) tintRaf = requestAnimationFrame(() => { tintRaf = 0; tintSafe(); }); }, { passive: true, capture: true });
  function render() {
    const h = location.hash, r = RUTAS[ROL].find(([re]) => re.test(h));
    if (!r) { location.replace(INICIO[ROL]); return; }
    const [activo, body] = r[1](h.match(r[0]));
    $("#app").innerHTML = shell(activo, body);
    tintSafe();
    try { parent.postMessage({ type: "demo-ruta", hash: h }, "*"); parent.postMessage({ type: "demo-pista", clave: h, texto: pista() }, "*"); } catch (e) { /* sin marco */ }
  }
  /* La pista del patrón de 3 clics va en el marco de la demo, fuera de la pantalla: no es parte del producto. */
  const CON_RELLENO = ["yo-1", "yo-2", "yo-3", "con-1", "con-2", "con-3", "con-mapa", "rec-guardar"];
  function pista() {
    const b = $("#btn-sig"); if (!b || !CON_RELLENO.includes(b.dataset.act)) return null;
    const t = "Toca «" + b.textContent.trim() + "» dos veces";
    return b.dataset.act === "con-1" ? t + " y prueba con un número nuevo." : t + " y se rellena solo.";
  }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && asignando) { asignando = null; render(); } });
  window.addEventListener("hashchange", () => { render(); window.scrollTo(0, 0); });

  /* ── acciones ── */
  function crearPersona(extra) {
    const p = Object.assign({ id: nuevoId(), alta: hoy(), consent: {}, mapa: Object.assign({}, D.mapa), notas: D.notas || "", email: "", doc: "" }, D.datos, extra);
    if (Array.isArray(p.idioma)) p.idioma = p.idioma.join(", ");
    CAT.consentimientos.forEach((c) => { p.consent[c.id] = !!D.consent[c.id]; });
    S.personas.push(p); return p;
  }
  const faltanMapa = (dims) => dims.filter((d) => !d.opcional && !D.mapa[d.id]).map((d) => d.n);
  /* Patrón de demo: 1.er Continuar marca lo que falta, el 2.º lo completa con ejemplo, el 3.º avanza. */
  function insistir(clave, valido, rellenar) {
    if (valido()) { D.fallo = null; return true; }
    if (D.fallo === clave) { rellenar(); D.err = {}; D.fallo = null; render(); return false; }
    D.fallo = clave; render(); return false;
  }
  const rellenarDatos = () => { const ej = EJEMPLO[D.tipo]; REQ.forEach((k) => { if (!String(D.datos[k] || "").trim() || (k === "cp" && !/^\d{5}$/.test(D.datos.cp))) D.datos[k] = k === "tel" && D.tipo === "con" && D.q ? D.q : ej[k]; }); };
  const rellenarMapa = (dims) => dims.forEach((d) => { if (!D.mapa[d.id]) D.mapa[d.id] = MAPA_EJ[d.id]; });
  const okConsent = () => { if (D.consent.privacidad && D.consent.tratamiento) return true; D.err = { consent: "Faltan los consentimientos obligatorios. Sin ellos no se crea el expediente." }; return false; };
  const okMapa = (dims) => { const f = faltanMapa(dims); if (!f.length) return true; D.err = { mapa: "Falta responder: " + f.join(", ") + "." }; return false; };
  const ACC = {
    salir,
    "empezar-yo": () => { D = nuevo("yo"); ir("#/registro/1"); },
    "empezar-con": () => { D = nuevo("con"); ir("#/registrar/1"); },
    "entrar-ejemplo": () => { S.ciudadano = "BC-2026-0141"; S.recienCreado = null; guardar(); ir("#/inicio"); },
    ejemplo: (b) => {
      const k = b.dataset.k; D.fallo = null;
      if (k === "datos") { D.datos = Object.assign({}, EJEMPLO[D.tipo], D.tipo === "con" && D.busqueda && !D.busqueda.p ? { tel: D.q } : {}); D.err = {}; }
      if (k === "mapa") {
        const paso = +(location.hash.match(/(\d)$/) || [])[1];
        if (D.tipo === "yo") { Object.assign(D.auto, AUTO_EJ); D.err = {}; return render(); }
        const dims = CAT.dimensiones.filter((d) => d.b === CAT.bloques[paso - 4].id);
        dims.forEach((d) => { D.mapa[d.id] = MAPA_EJ[d.id]; }); D.err = {};
      }
      if (k === "rec") { rellenarRec(); D.err = {}; }
      if (k === "recursos") D.recursos = sugeridos().slice(0, 3).map((x) => x.r.id);
      render();
    },
    chk: (b) => {
      if (b.dataset.c) D.consent[b.dataset.c] = !D.consent[b.dataset.c];
      if (b.dataset.rec) { const id = b.dataset.rec; D.recursos = D.recursos.includes(id) ? D.recursos.filter((x) => x !== id) : D.recursos.concat(id); }
      const on = b.dataset.c ? D.consent[b.dataset.c] : D.recursos.includes(b.dataset.rec);
      b.classList.toggle("on", on); const c = b.querySelector(".nwt-checkbox"); c.classList.toggle("nwt-checkbox--checked", on); c.setAttribute("aria-checked", String(on));
    },
    sem: (b) => {
      D.mapa[b.dataset.d] = b.dataset.v;
      b.parentElement.querySelectorAll(".bc-opt").forEach((x) => { const on = x === b; x.classList.toggle("on", on); const r = x.querySelector(".nwt-radio-button"); r.classList.toggle("nwt-radio-button--checked", on); r.setAttribute("aria-checked", String(on)); });
    },
    ent: (b) => { D.entidad = b.dataset.e; render(); },
    "yo-1": () => { if (insistir("yo-1", okConsent, () => { D.consent.privacidad = D.consent.tratamiento = true; })) { D.err = {}; ir("#/registro/2"); } },
    "yo-2": () => { if (insistir("yo-2", validarDatos, rellenarDatos)) ir("#/registro/3"); },
    "yo-3": () => {
      const n = +((location.hash.match(/^#\/registro\/3\/(\d)$/) || [])[1] || 1), q = AUTO[n - 1];
      const ok = () => { if (D.auto[q.id]) return true; D.err = { auto: "Elige la respuesta que más se parece a tu situación." }; return false; };
      if (insistir("yo-3-" + n, ok, () => { D.auto[q.id] = AUTO_EJ[q.id]; })) { D.err = {}; ir(n < AUTO.length ? "#/registro/3/" + (n + 1) : "#/registro/4"); }
    },
    "c-auto": (b) => {
      D.auto[b.dataset.q] = b.dataset.v; D.err = {};
      const g = b.parentElement; g.querySelectorAll(".bc-opt").forEach((x) => { const on = x === b; x.classList.toggle("on", on); const r = x.querySelector(".nwt-radio-button"); r.classList.toggle("nwt-radio-button--checked", on); r.setAttribute("aria-checked", String(on)); });
      const e = g.closest(".cz-cuerpo") && g.closest(".cz-cuerpo").querySelector(".nwt-alert"); if (e) e.remove();
    },
    "yo-crear": () => {
      D.mapa = window.BC_DERIVAR(D.auto);
      const p = crearPersona({ origen: "autorregistro", entidad: D.entidad, conector: null, estado: "Abierto", mapaTipo: "corto" });
      S.accesos.push({ persona: p.id, quien: "Sistema", entidad: p.entidad, cuando: ahora(), para: "Alta por autorregistro" });
      S.ciudadano = p.id; S.recienCreado = p.id; guardar(); D = null; ir("#/inicio");
    },
    consent: (b) => { const p = yoP(), c = b.dataset.c; p.consent[c] = !p.consent[c]; guardar(); toast(p.consent[c] ? "Autorizado. Puedes retirarlo cuando quieras." : "Retirado. Las otras entidades ya no ven tu itinerario."); render(); },
    "c-set": (b) => {
      const k = b.dataset.k, g = b.closest('[role="radiogroup"]'); D.datos[k] = b.dataset.v; delete D.err[k];
      g.querySelectorAll("[data-k]").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
      const m = g.parentElement.querySelector(".cz-err"); if (m) m.remove();
    },
    "c-multi": (b) => {
      const k = b.dataset.k, l = czLista(D.datos[k]), v = b.dataset.v; D.datos[k] = l.includes(v) ? l.filter((x) => x !== v) : l.concat(v); delete D.err[k];
      b.setAttribute("aria-checked", String(D.datos[k].includes(v)));
      const m = b.closest(".cz-grupo").querySelector(".cz-err"); if (m) m.remove();
    },
    "c-filtro": (b) => { czFiltro = b.dataset.v; render(); },
    "c-contacto": () => toast("En la demo no se envían mensajes ni llamadas."),
    probar: (b) => {
      /* «Nuevo» genera un teléfono que nadie tiene: los datos se comparten entre corridas y roles. */
      let v = b.dataset.v;
      if (v === "nuevo") { const usados = new Set(S.personas.map((x) => x.tel.replace(/\s/g, ""))); let n = 123456; while (usados.has("+34600" + n)) n++; v = "+34 600 " + String(n).slice(0, 3) + " " + String(n).slice(3); }
      D.q = v; ACC.buscar();
    },
    buscar: () => {
      const q = String(D.q || "").replace(/\s/g, "");
      if (!q) { D.busqueda = null; return render(); }
      const p = S.personas.find((x) => x.tel.replace(/\s/g, "") === q || (x.doc && x.doc.replace(/\s/g, "") === q));
      D.busqueda = { q, p }; if (!p) D.datos.tel = D.q; render();
    },
    "con-1": () => {
      if (D.busqueda && !D.busqueda.p) { D.fallo = null; return ir("#/registrar/2"); }
      if (D.fallo === "con-1") { D.fallo = null; return ACC.probar({ dataset: { v: "nuevo" } }); }
      D.fallo = "con-1"; toast(D.busqueda ? "Esta persona ya tiene expediente: no se duplica." : "Busca primero si la persona ya tiene expediente.");
    },
    "k-borrar": () => { D.q = ""; D.busqueda = null; D.fallo = null; render(); },
    "k-ir": (b) => { const n = document.getElementById(b.dataset.to); if (n) { n.scrollIntoView({ block: "center" }); n.focus({ preventScroll: true }); } },
    "no-acepta": () => { D = null; toast("Proceso terminado. No se registró ningún dato."); ir("#/personas"); },
    "con-2": () => { if (insistir("con-2", okConsent, () => { D.consent.privacidad = D.consent.tratamiento = true; })) { D.err = {}; ir("#/registrar/3"); } },
    "con-3": () => { if (insistir("con-3", validarDatos, rellenarDatos)) ir("#/registrar/4"); },
    "con-mapa": () => {
      const paso = +location.hash.match(/(\d)$/)[1], dims = CAT.dimensiones.filter((d) => d.b === CAT.bloques[paso - 4].id);
      if (insistir("con-mapa-" + paso, () => okMapa(dims), () => rellenarMapa(dims))) { D.err = {}; ir("#/registrar/" + (paso + 1)); }
    },
    "con-crear": () => {
      const p = crearPersona({ origen: "conector", entidad: ENT, conector: YO, estado: D.recursos.length ? "En seguimiento" : "Abierto", mapaTipo: "completo" });
      D.recursos.forEach((rid, i) => S.solicitudes.push({ id: "s" + Date.now() + i, persona: p.id, recurso: rid, por: ENT, estado: rec(rid).modo === "Solicitud" ? "Pendiente" : "Aprobada", fecha: hoy() }));
      S.accesos.push({ persona: p.id, quien: con(YO).nombre, entidad: ENT, cuando: ahora(), para: "Alta y Mapa de Vida" });
      guardar(); D = null; ir("#/listo/" + p.id);
    },
    "rec-pausa": (b) => { const r = rec(b.dataset.r); r.pausado = !r.pausado; guardar(); toast(r.pausado ? r.nombre + " queda pausado: deja de proponerse en la red." : r.nombre + " vuelve a estar activo."); ezRe('[data-act="rec-pausa"][data-r="' + r.id + '"]'); },
    "rec-guardar": () => {
      if (!insistir("rec", validarRec, rellenarRec)) return;
      const x = D.datos, campos = { nombre: x.nombre.trim(), cat: x.cat, tipo: x.tipo, modo: x.modo, urg: x.urg, cupo: x.cupo ? +x.cupo : undefined, desc: (x.desc || "").trim(), requisitos: (x.requisitos || "").trim() };
      if (D.id === "nuevo") S.recursos.push(Object.assign({ id: "r" + Date.now(), entidad: ENT }, campos)); else Object.assign(rec(D.id), campos);
      guardar(); toast(D.id === "nuevo" ? "Recurso creado. Ya se propone a los conectores de la red." : "Cambios guardados."); D = null; ir("#/recursos");
    },
    filtro: (b) => { filtro = b.dataset.v; render(); },
    filtro2: (b) => { fL = b.dataset.v; render(); },
    "e-tab": (b) => { D.tab = b.dataset.v; ezRe('[data-act="e-tab"][data-v="' + b.dataset.v + '"]'); },
    "e-sel": (b) => { ezSel = b.dataset.id; ezRe('[data-act="e-sel"][data-id="' + b.dataset.id + '"]'); },
    "e-ir": (b) => { ezSel = b.dataset.id; ir(b.dataset.v === "solicitudes" ? "#/personas/solicitudes" : "#/personas/asignar"); },
    "e-cat": ezCampo("cat"), "e-modo": ezCampo("modo"), "e-urg": ezCampo("urg"), "e-tipo": ezCampo("tipo"),
    "e-cupo": (b) => { const n = +D.datos.cupo || 0, d = +b.dataset.d; D.datos.cupo = d > 0 ? String(n ? n + 1 : 10) : n > 1 ? String(n - 1) : ""; delete D.err.cupo; ezRe('[data-act="e-cupo"][data-d="' + b.dataset.d + '"]'); },
    "asignar-ab": (b) => { asignando = b.dataset.p; conSel = (S.conectores.find((c) => c.entidad === ENT) || {}).id; ezRe("#ez-mt"); },
    "asignar-sel": (b) => { conSel = b.dataset.c; ezRe('[data-act="asignar-sel"][data-c="' + b.dataset.c + '"]'); },
    "asignar-cancel": () => { asignando = null; ezRe("#btn-asignar-ab"); },
    asignar: (b) => { const p = per(b.dataset.p), sel = document.getElementById("sel-" + p.id); p.conector = sel ? sel.value : conSel; asignando = null; guardar(); toast(p.nombre + " queda asignada a " + con(p.conector).nombre + "."); render(); },
    decidir: (b) => {
      const s = S.solicitudes.find((x) => x.id === b.dataset.s);
      s.estado = b.dataset.e; s.decidida = true;
      S.accesos.push({ persona: s.persona, quien: "Coordinación", entidad: ENT, cuando: ahora(), para: "Decidir la solicitud a " + rec(s.recurso).nombre });
      guardar(); toast("Solicitud: " + s.estado + ". Se avisa al conector de la persona."); render();
    },
    "rechazar-ab": (b) => { rechazando = b.dataset.s; render(); },
    "rechazar-cancel": () => { rechazando = null; render(); },
    rechazar: (b) => {
      const m = document.getElementById("mot-" + b.dataset.s).value;
      if (!m) return toast("El motivo del rechazo es obligatorio.");
      const s = S.solicitudes.find((x) => x.id === b.dataset.s);
      s.estado = "Rechazada"; s.motivo = m; s.decidida = true; rechazando = null;
      S.accesos.push({ persona: s.persona, quien: "Coordinación", entidad: ENT, cuando: ahora(), para: "Decidir la solicitud a " + rec(s.recurso).nombre });
      guardar(); toast("Solicitud rechazada. El conector puede reasignar o derivar."); render();
    },
    "k-pos-sel": (b) => { postSel = b.dataset.r; render(); },
    postular: (b) => {
      const p = per(b.dataset.p), r = rec(postSel);
      if (!r) return;
      if (solsDe(p.id).some((s) => s.recurso === r.id && s.estado !== "Rechazada")) return toast("Ya tiene una solicitud a " + r.nombre + ".");
      S.solicitudes.push({ id: "s" + Date.now(), persona: p.id, recurso: r.id, por: ENT, estado: r.modo === "Solicitud" ? "Pendiente" : "Aprobada", fecha: hoy() });
      if (p.estado === "Abierto") p.estado = "En seguimiento";
      guardar(); postSel = null; ir("#/persona/" + encodeURIComponent(p.id));
      toast(r.entidad === ENT ? "Postulada a " + r.nombre + "." : "Derivada a " + ent(r.entidad).nombre + ": le llega a su bandeja.");
    }
  };

  document.addEventListener("click", (e) => { const b = e.target.closest("[data-act]"); if (b && ACC[b.dataset.act]) { e.preventDefault(); ACC[b.dataset.act](b); } });
  document.addEventListener("keydown", (e) => {
    if ((e.key === " " || e.key === "Enter") && e.target.matches('[role="checkbox"],[role="radio"]')) { e.preventDefault(); e.target.closest("[data-act]").click(); }
    if (e.key === "Enter" && e.target.hasAttribute("data-q")) ACC.buscar();
  });
  document.addEventListener("input", (e) => {
    const t = e.target;
    if (t.dataset.f) { D.datos[t.dataset.f] = t.value; if (D.err[t.dataset.f]) { delete D.err[t.dataset.f]; const box = t.closest(".nwt-input-box"); box.classList.remove("nwt-input-box--error"); const m = box.querySelector(".nwt-input-box__message"); if (m) m.remove(); } }
    if (t.hasAttribute("data-q")) {
      D.q = t.value; clearTimeout(ACC.tq);
      /* Busca sola al escribir un número completo; el input se repinta, así que se devuelve el foco. */
      if (t.value.replace(/\D/g, "").length >= 9) ACC.tq = setTimeout(() => { ACC.buscar(); const n = $("#f-q"); if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } }, 400);
    }
    if (t.hasAttribute("data-notas")) D.notas = t.value;
    if (t.hasAttribute("data-busca2")) { qL = t.value; const pos = t.selectionStart; render(); const n = $("#f-busca2"); n.focus(); n.setSelectionRange(pos, pos); return; }
    if (t.hasAttribute("data-busca")) { busca = t.value; const pos = t.selectionStart; render(); const n = $("#f-busca"); n.focus(); n.setSelectionRange(pos, pos); }
  });
  document.addEventListener("change", (e) => { if (e.target.dataset.f) D.datos[e.target.dataset.f] = e.target.value; });

  /* Un borrador perdido por recarga vuelve al primer paso del asistente. */
  if (/^#\/(registro\/[2-4](\/\d)?|registrar\/[2-8])$/.test(location.hash)) location.replace(location.hash.replace(/^(#\/regist\w+)\/.*$/, "$1/1"));
  /* Mini splash de la brújula al abrir la app sin sesión: se va solo y no bloquea. */
  if (ROL === "ciudadano" && !yoP() && /^(#\/inicio)?$/.test(location.hash)) {
    const sp = document.createElement("div"); sp.id = "bc-splash"; sp.setAttribute("role", "presentation");
    sp.innerHTML = ic("globe-pin") + "<span>Brújula Ciudadana</span>"; document.body.appendChild(sp);
    setTimeout(() => { sp.classList.add("out"); setTimeout(() => { sp.remove(); tintSafe(); }, 350); }, 1300);
  }
  render();
})();
