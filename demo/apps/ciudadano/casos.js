/* Casos guiados del rol (sirven en móvil y escritorio). Los datos se comparten entre roles; «Restablecer datos» vuelve a la semilla. */
(() => {
const APP = "../../../app/brujula/";
const SI = (sel, body) => ({ t: "click", sel, body });
const VE = (sel, body) => ({ t: "note", sel, body });
const NAV = (k) => "[data-nav=\"" + k + "\"]";
window.CASOS = [
  {
    id: "1.1", titulo: "Registrarme",
    falta: "El marco no escribe en los campos: se completan con «datos de ejemplo». El aviso por WhatsApp no se envía.",
    steps: [
      { t: "goto", url: APP + "index.html?rol=ciudadano&sinsesion=1#/inicio", body: "El ciudadano entra a Brújula Ciudadana." },
      VE(".bc-hero", "Se registra una sola vez; registrarse solo es una decisión nueva frente a los docs del MVP."),
      SI("#btn-registrarme", "Empieza el registro."),
      SI('[data-c="privacidad"]', "Acepta la política de privacidad (obligatorio)."),
      SI('[data-c="tratamiento"]', "Autoriza el tratamiento de datos (obligatorio)."),
      SI('[data-c="entidades"]', "Opcional: permite que otras entidades vean su itinerario, nunca su diagnóstico."),
      SI("#btn-sig", "Continúa."),
      SI('[data-act="ejemplo"]', "Sus datos: el perfil básico del doc 03, sin dirección exacta."),
      SI("#btn-sig", "Continúa."),
      SI('[data-act="ejemplo"]', "¿Cómo estás hoy?: las 8 preguntas del Mapa de Vida en modo persona (doc 04), una por pantalla."),
      VE('[data-q="a1"]', "Cada respuesta es un semáforo: estable, en proceso o necesita apoyo."),
      SI("#btn-sig", "Económico: necesidades básicas."),
      SI("#btn-sig", "Social: vivienda."),
      SI("#btn-sig", "Social: salud."),
      SI("#btn-sig", "Relacional: personas cercanas."),
      SI("#btn-sig", "Relacional: comunidad."),
      SI("#btn-sig", "Legal: documentación."),
      SI("#btn-sig", "Legal: derechos."),
      SI("#btn-sig", "Las respuestas alimentan 7 de las 16 áreas del Mapa de Vida; el resto lo completa el conector."),
      VE('[data-e="e1"]', "Elige la entidad que lo atenderá."),
      SI("#btn-sig", "Crea su expediente."),
      VE("#mi-conector", "Ya tiene expediente. La entidad lo ve como «Por asignar a un conector».")
    ]
  },
  {
    id: "1.2", titulo: "Mi expediente",
    falta: "Mi expediente es una etapa posterior al MVP según los docs.",
    steps: [
      { t: "goto", url: APP + "index.html?rol=ciudadano&sinsesion=1#/inicio", body: "Una persona que ya tiene expediente." },
      SI("#btn-ejemplo", "Entra con su expediente."),
      VE("#mi-conector", "Ve quién la acompaña y sus próximos pasos."),
      SI(NAV("recursos"), "Sus recursos en cualquier entidad de la red."),
      VE("#mis-recursos", "Cada uno con su estado."),
      SI(NAV("privacidad"), "Privacidad."),
      VE("#accesos", "Quién vio sus datos, cuándo y para qué."),
      SI('[data-act="consent"][data-c="entidades"]', "Puede retirar el permiso de compartir con otras entidades."),
      VE("#consentimientos", "Desde ese momento, las otras entidades dejan de ver su itinerario.")
    ]
  }
];
})();
