/* Casos guiados del rol (sirven en móvil y escritorio). Los datos se comparten entre roles; «Restablecer datos» vuelve a la semilla. */
(() => {
const APP = "../../../app/brujula/";
const SI = (sel, body) => ({ t: "click", sel, body });
const VE = (sel, body) => ({ t: "note", sel, body });
const NAV = (k) => "[data-nav=\"" + k + "\"]";
window.CASOS = [
  {
    id: "3.1", titulo: "Solicitudes y por asignar",
    falta: "Los avisos al conector no se envían; solo se registran.",
    steps: [
      { t: "goto", url: APP + "index.html?rol=entidad#/resumen", body: "El panel interno de Asociación Puentes. Solo ella lo ve." },
      VE(".kpis", "Personas, autorregistros por asignar, solicitudes por decidir y conectores."),
      SI(NAV("asignar"), "Abre Personas › Por asignar."),
      VE("[data-asignar]", "Un autorregistro que espera conector."),
      SI('[data-act="asignar-ab"]', "La coordinación abre la asignación."),
      SI('#btn-asignar', "Confirma el conector y la persona sale de la lista."),
      SI(NAV("solicitudes"), "Pasa a Personas › Solicitudes."),
      VE("[data-sol]", "Una solicitud a sus recursos: ve solo la ficha mínima, no el diagnóstico."),
      SI('[data-sol] [data-e="Aprobada"]', "Aprueba. Queda en el registro de accesos de la persona.")
    ]
  },
  {
    id: "3.2", titulo: "Personas y otras entidades",
    steps: [
      { t: "goto", url: APP + "index.html?rol=entidad#/personas", body: "Las personas con expediente en la entidad." },
      VE(".bc-tbl", "Origen, conector, Mapa de Vida y su uso en otras entidades."),
      SI('a.bc-tr[data-p="BC-2026-0141"]', "Yasmina autorizó compartir su itinerario."),
      VE("#otras", "Se ve en qué otras entidades está y el estado, sin su diagnóstico."),
      VE("#accesos", "Cada consulta queda registrada; la persona puede verla."),
      SI(NAV("personas"), "Vuelve a la lista."),
      SI('a.bc-tr[data-p="BC-2026-0152"]', "Carlos no lo autorizó."),
      VE("#otras", "La entidad no ve ni si participa en otras entidades."),
      SI(NAV("conectores"), "Conectores: quién acompaña a quién y con cuánta carga."),
      VE('[data-con="c1"]', "Lucía Romero y sus personas.")
    ]
  },
  {
    id: "3.3", titulo: "Mis recursos",
    steps: [
      { t: "goto", url: APP + "index.html?rol=entidad#/recursos", body: "Lo que la entidad ofrece a la red: lo registró al darse de alta y lo gestiona aquí." },
      VE('[data-recurso="r1"]', "Cada recurso con su acceso, plazo, plazas ocupadas y solicitudes por decidir."),
      SI('[data-recurso="r4"] [data-act="rec-pausa"]', "Pausar: deja de proponerse a los conectores, pero conserva a sus personas."),
      SI('[data-recurso="r4"] [data-act="rec-pausa"]', "Y se reactiva igual."),
      SI("#btn-nuevo-rec", "Añade un recurso nuevo."),
      SI("#btn-sig", "Si falta algo, lo marca."),
      SI("#btn-sig", "La segunda vez lo completa con un ejemplo."),
      SI("#btn-sig", "La tercera lo crea: desde ya se propone en toda la red."),
      VE(".cols", "El nuevo recurso aparece en la lista, activo.")
    ]
  }
];
})();
