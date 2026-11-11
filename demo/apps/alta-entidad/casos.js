/* Casos guiados del rol (sirven en móvil y escritorio). Los datos se comparten entre roles; «Restablecer datos» vuelve a la semilla. */
(() => {
const APP = "../../../app/brujula/";
const SI = (sel, body) => ({ t: "click", sel, body });
const VE = (sel, body) => ({ t: "note", sel, body });
const NAV = (k) => "[data-nav=\"" + k + "\"]";
window.CASOS = [
  {
    id: "4.1", titulo: "Registrar una entidad",
    falta: "El correo de verificación no se envía. Diseño mínimo con componentes del SDK.",
    steps: [
      { t: "goto", url: APP + "alta-entidad.html", body: "El formulario base del flujo 09." },
      SI("#ejemplo", "Se completa con datos de ejemplo."),
      SI("#enviar", "Envía el registro."),
      VE("#ok", "Queda pendiente de verificación por correo.")
    ]
  }
];
})();
