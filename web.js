(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const frame = $("stage"), panel = $("panel"), launch = $("launch");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const qs = new URLSearchParams(location.search);
  let app, rol = "", esc2 = "", hash = "";

  const rolP = () => app.rolParam || "rol", escP = () => app.escenarioParam || "hoy";
  const base = () => "apps/" + app.id + "/";
  /* La app recibe rol y escenario por query y la ruta por hash: así un enlace reproduce el estado. */
  const url = () => {
    const p = new URLSearchParams();
    if (rol) p.set(rolP(), rol);
    if (esc2) p.set(escP(), esc2);
    const q = p.toString();
    return base() + (app.inicio || "index.html") + (q ? "?" + q : "") + hash;
  };
  const roles = () => app.roles || [];

  function pintar() {
    $("titulo").textContent = app.nombre || app.id;
    $("gRol").hidden = !roles().length;
    $("segRol").innerHTML = roles().map((r) => {
      const on = r.id === rol;
      return '<button type="button" class="tt-role' + (on ? " is-active" : "") + '" data-r="' + esc(r.id) + '" title="' + esc(r.desc || "") + '" aria-pressed="' + on + '"><i aria-hidden="true">' + esc(r.ini || r.etiqueta.slice(0, 2)) + "</i><span><b>" + esc(r.etiqueta) + "</b>" + (r.tag ? '<span class="tt-tag">' + esc(r.tag) + "</span>" : "") + "</span></button>";
    }).join("");
    $("gEsc").hidden = !(app.escenarios || []).length;
    $("segEsc").innerHTML = (app.escenarios || []).map((e) => { const on = e.valor === esc2; return '<button type="button" data-h="' + esc(e.valor) + '" class="' + (on ? "is-active" : "") + '" aria-pressed="' + on + '">' + esc(e.etiqueta) + "</button>"; }).join("");
    $("solo").href = url();
    const r = roles().find((x) => x.id === rol);
    document.title = (r ? r.etiqueta + " · " : "") + (app.nombre || app.id) + " · Demo web";
    const p = new URLSearchParams({ app: app.id });
    if (rol) p.set("rol", rol);
    if (esc2) p.set("esc", esc2);
    try { history.replaceState(null, "", "?" + p + hash); } catch (e) { /* sin historial */ }
  }
  const cargar = () => { frame.src = url(); pintar(); };

  function abrir(on) {
    panel.classList.toggle("open", on); document.body.classList.toggle("tt-open", on);
    launch.setAttribute("aria-expanded", String(on));
    (on ? $("close") : launch).focus();
  }

  panel.addEventListener("click", (e) => {
    const r = e.target.closest("[data-r]"), h = e.target.closest("[data-h]");
    if (e.target.closest("#reset")) {
      /* Contrato opcional: la app expone window.DEMO.restablecer(); si no, se limpia el almacenamiento. */
      try { frame.contentWindow.DEMO.restablecer(); } catch (x) { try { frame.contentWindow.localStorage.clear(); } catch (y) { /* otro origen */ } }
      hash = ""; cargar(); return;
    }
    if (h) { esc2 = h.dataset.h; cargar(); }
    if (r) { if (r.dataset.r !== rol) { rol = r.dataset.r; hash = ""; cargar(); } abrir(false); }
  });
  /* La app avisa su ruta con postMessage({type:"demo-ruta", hash}) para que cambiar de rol no la pierda. */
  window.addEventListener("message", (e) => {
    if (e.source !== frame.contentWindow || !e.data) return;
    if (e.data.type === "demo-ruta") { hash = e.data.hash || ""; pintar(); }
    if (e.data.demo === "abrir-panel") abrir(true);
  });
  launch.addEventListener("click", () => abrir(true));
  $("close").addEventListener("click", () => abrir(false));
  $("compact").addEventListener("click", () => $("compact").setAttribute("aria-pressed", String(document.body.classList.toggle("tt-compact"))));
  $("appSel").addEventListener("change", () => abrirApp($("appSel").value));
  /* ⌘/Ctrl+Shift+L; el marco es otro documento, por eso también se escucha dentro de él. */
  const atajo = (e) => { if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.code === "KeyL") { e.preventDefault(); abrir(!panel.classList.contains("open")); } };
  document.addEventListener("keydown", atajo);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && panel.classList.contains("open")) abrir(false); });
  frame.addEventListener("load", () => { try { frame.contentDocument.addEventListener("keydown", atajo); } catch (x) { /* otro origen */ } });

  function abrirApp(id, inicial) {
    app = window.APPS.find((a) => a.id === id) || window.APPS[0];
    $("appSel").value = app.id;
    const r = roles();
    rol = inicial && r.some((x) => x.id === qs.get("rol")) ? qs.get("rol") : (app.rolInicial || (r[0] && r[0].id) || "");
    esc2 = inicial && qs.has("esc") ? qs.get("esc") : "";
    hash = inicial ? location.hash : "";
    cargar();
  }

  if (!window.APPS.length) { $("vacio").hidden = false; launch.hidden = true; frame.hidden = true; return; }
  $("appSel").innerHTML = window.APPS.map((a) => '<option value="' + esc(a.id) + '">' + esc(a.nombre || a.id) + "</option>").join("");
  $("gApp").hidden = window.APPS.length < 2;
  abrirApp(qs.get("app"), true);
})();
