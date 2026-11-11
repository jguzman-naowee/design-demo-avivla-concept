/* Casos guiados del rol (sirven en móvil y escritorio). Los datos se comparten entre roles; «Restablecer datos» vuelve a la semilla. */
(() => {
const APP = "../../../app/brujula/";
const SI = (sel, body) => ({ t: "click", sel, body });
const VE = (sel, body) => ({ t: "note", sel, body });
const NAV = (k) => "[data-nav=\"" + k + "\"]";
window.CASOS = [
  {
    id: "2.1", titulo: "Registrar a una persona",
    falta: "El marco no escribe en los campos: se completan con «datos de ejemplo».",
    steps: [
      { t: "goto", url: APP + "index.html?rol=conector#/personas", body: "Lucía Romero, conectora de Asociación Puentes." },
      SI("#btn-registrar", "Registra a una persona en la entrevista."),
      SI('[data-act="probar"][data-v="+34 688 219 774"]', "Primero busca si ya tiene expediente. Con un teléfono que ya existe…"),
      VE(".nwt-alert", "…la red avisa y no se duplica a la persona."),
      SI('[data-act="probar"][data-v="nuevo"]', "Con un número nuevo no hay coincidencias."),
      SI("#btn-sig", "Continúa."),
      SI('[data-c="privacidad"]', "Lee y marca los consentimientos obligatorios."),
      SI('[data-c="tratamiento"]', "Sin estos dos, el proceso termina sin registrar nada."),
      SI("#btn-sig", "Continúa."),
      SI('[data-act="ejemplo"]', "Perfil básico."),
      SI("#btn-sig", "Mapa de Vida completo: 16 dimensiones en 4 bloques."),
      SI('[data-act="ejemplo"]', "Bloque 1 · Necesidades básicas."),
      SI("#btn-sig", "Siguiente bloque."),
      SI('[data-act="ejemplo"]', "Bloque 2 · Entorno familiar."),
      SI("#btn-sig", "Siguiente bloque."),
      SI('[data-act="ejemplo"]', "Bloque 3 · Autonomía."),
      SI("#btn-sig", "Siguiente bloque."),
      SI('[data-act="ejemplo"]', "Bloque 4 · Participación."),
      SI("#btn-sig", "Recursos sugeridos."),
      VE("[data-rec]", "El sistema sugiere recursos de toda la red según el diagnóstico, primero lo urgente."),
      SI('[data-act="ejemplo"]', "Elige el itinerario: recursos propios y derivaciones."),
      SI("#btn-sig", "Crea el expediente."),
      VE("#itinerario-nuevo", "Las derivaciones les llegan a las otras entidades como solicitud.")
    ]
  },
  {
    id: "2.2", titulo: "Ficha y derivación",
    steps: [
      { t: "goto", url: APP + "index.html?rol=conector#/personas", body: "Sus personas." },
      SI('a.bc-tr[data-p="BC-2026-0141"]', "Abre la ficha de Yasmina."),
      VE("#mapa", "Su Mapa de Vida completo."),
      VE("#otras", "Autorizó compartir: ve en qué otras entidades está, sin su diagnóstico."),
      SI("#btn-postular", "Abre Postular, una pantalla propia con los recursos."),
      SI("#btn-postular", "La postula al recurso elegido; si es de otra entidad, le llega a su bandeja."),
      VE("#itinerario", "Queda en su itinerario."),
      SI(NAV("red"), "Recursos de entidades: el catálogo de todas las entidades.")
    ]
  }
];
})();
