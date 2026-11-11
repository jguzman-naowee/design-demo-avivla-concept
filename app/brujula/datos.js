/* Datos de ejemplo de la demo. Campos y dimensiones del doc 03; recursos del catálogo 11. */
window.BC_CATALOGO = {
  idiomas: ["Español", "Catalán", "Inglés", "Árabe", "Francés", "Otro"],
  canales: ["WhatsApp", "Teléfono", "Email"],
  documento: ["Sí", "No", "En trámite"],
  consentimientos: [
    { id: "privacidad", txt: "Acepto la política de privacidad", obligatorio: true },
    { id: "tratamiento", txt: "Autorizo el tratamiento de mis datos personales", obligatorio: true },
    { id: "entidades", txt: "Autorizo compartir mi itinerario con otras entidades colaboradoras", obligatorio: false, ayuda: "Verán en qué recursos estás y su estado, nunca tu diagnóstico." },
    { id: "comunicaciones", txt: "Deseo recibir comunicaciones sobre mi expediente", obligatorio: false }
  ],
  bloques: [
    { id: "b1", nombre: "Necesidades básicas" },
    { id: "b2", nombre: "Entorno familiar" },
    { id: "b3", nombre: "Autonomía" },
    { id: "b4", nombre: "Participación" }
  ],
  dimensiones: [
    { id: "vivienda", b: "b1", n: "Vivienda", cat: "Vivienda", q: "¿Cuál es tu situación actual de vivienda?", o: ["Tengo una vivienda estable", "Mi situación es temporal o inestable", "Necesito buscar vivienda inmediatamente"] },
    { id: "ingresos", b: "b1", n: "Ingresos", cat: "Ingresos", q: "¿Cuál es tu situación económica actual?", o: ["Tengo una fuente de ingresos estable", "Mis ingresos son insuficientes o inestables", "No tengo ninguna fuente de ingresos"] },
    { id: "alimentacion", b: "b1", n: "Alimentación", cat: "Alimentación", q: "Respecto a tu alimentación…", o: ["Cubro mis necesidades alimentarias", "Necesito apoyo en la cesta o banco de alimentos", "Necesito un comedor social"] },
    { id: "salud", b: "b1", n: "Salud y bienestar", cat: "Salud y Bienestar", q: "¿Cómo te encuentras actualmente?", o: ["Me encuentro bien", "Hay aspectos que me gustaría mejorar", "Necesito apoyo sanitario o psicológico"] },
    { id: "documentacion", b: "b1", n: "Documentación", cat: "Documentación y Trámites", q: "Respecto a tus documentos y gestiones…", o: ["Todo está al día", "Tengo trámites administrativos pendientes", "Necesito ayuda legal"] },
    { id: "red", b: "b2", n: "Red de apoyo", cat: "Red de Apoyo", q: "Cuando necesito ayuda…", o: ["Tengo una red de apoyo sólida", "Tengo una red de apoyo inestable", "Me ayudaría tener una red de apoyo estable"] },
    { id: "familia", b: "b2", n: "Familia", cat: "Familia", q: "¿Cuál es tu situación familiar actual?", o: ["Vivo con familiares o personas cercanas", "Tengo familia pero no convivimos", "Me encuentro solo/a y sin apoyo familiar"] },
    { id: "menores", b: "b2", n: "Infancia y menores", cat: "Infancia y Menores", q: "¿Tienes menores a cargo?", o: ["No tengo menores a cargo", "Tengo menores y cubro adecuadamente sus necesidades", "Tengo menores y necesito apoyo para atenderlos"] },
    { id: "cuidados", b: "b2", n: "Mujer y cuidados", cat: "Mujer y Cuidados", opcional: true, q: "¿Cuál de estas situaciones describe mejor tu realidad?", o: ["No tengo responsabilidades de cuidado que limiten mi autonomía", "Soy madre o cuidadora principal y necesito más apoyo", "Estoy viviendo una situación de violencia o riesgo familiar"] },
    { id: "empleo", b: "b3", n: "Empleo", cat: "Empleo", q: "¿Cuál es tu situación laboral?", o: ["Tengo una situación laboral estable", "Quiero orientación laboral", "Quiero buscar empleo activamente"] },
    { id: "formacion", b: "b3", n: "Formación", cat: "Formación", q: "Respecto a tu formación…", o: ["Tengo la formación que necesito actualmente", "Me gustaría adquirir nuevas habilidades", "Necesito formación para acceder a oportunidades"] },
    { id: "movilidad", b: "b3", n: "Movilidad", cat: "Movilidad", q: "Respecto a tus desplazamientos…", o: ["Me desplazo sin dificultad", "Tengo limitaciones económicas para desplazarme", "Tengo limitaciones físicas para desplazarme"] },
    { id: "digital", b: "b3", n: "Competencias digitales", cat: "Competencias Digitales", q: "Respecto al uso de tecnología…", o: ["Manejo internet y herramientas digitales con facilidad", "Quiero mejorar mis habilidades digitales", "Necesito ayuda para realizar gestiones digitales"] },
    { id: "autonomia", b: "b3", n: "Autonomía personal", cat: "Autonomía Personal y Cuidados", opcional: true, q: "Respecto a tu autonomía en el día a día…", o: ["Soy autónomo/a para gestionar mi vida diaria", "Algunas tareas me resultan difíciles, necesito apoyo puntual", "Necesito ayuda frecuente para mi cuidado diario"] },
    { id: "direccion", b: "b4", n: "Organización y dirección", cat: "Organización y Dirección", q: "Respecto a tus próximos pasos…", o: ["Tengo objetivos claros y sé cómo avanzar", "Tengo objetivos claros pero necesito apoyo para alcanzarlos", "No sé cuál debería ser mi siguiente paso"] },
    { id: "comunidad", b: "b4", n: "Participación y comunidad", cat: "Participación y Comunidad", q: "Respecto a tu entorno social…", o: ["Participo activamente en alguna comunidad", "Me gustaría conectar más con otras personas", "Me siento aislado/a"] }
  ]
};

/* «¿Cómo estás hoy?»: cuestionario modo persona del doc 04 (8 preguntas, 4 sistemas).
   Cada respuesta alimenta dimensiones del Mapa de Vida del doc 03; si dos caen en la misma, manda la peor. */
window.BC_CATALOGO.autoevaluacion = [
  { id: "a1", sistema: "Económico", icono: "banknote", d: ["ingresos"], q: "¿Tienes trabajo o alguna fuente de ingresos?", o: ["Sí, tengo ingresos estables", "Algo ocasional o irregular", "No tengo ingresos"] },
  { id: "a2", sistema: "Económico", icono: "basket", d: ["alimentacion"], q: "¿Puedes cubrir tus necesidades básicas (comida, luz, ropa)?", o: ["Sí, puedo cubrirlas", "Con mucha dificultad", "No puedo, necesito apoyo"] },
  { id: "a3", sistema: "Social", icono: "home", d: ["vivienda"], q: "¿Tienes un lugar seguro y estable donde vivir?", o: ["Sí, tengo vivienda estable", "Temporal o muy inestable", "No o está en riesgo"] },
  { id: "a4", sistema: "Social", icono: "favorite", d: ["salud"], q: "¿Puedes ir al médico o al centro de salud cuando lo necesitas?", o: ["Sí, sin problema", "Con dificultad", "No tengo acceso"] },
  { id: "a5", sistema: "Relacional", icono: "users", d: ["red"], q: "¿Tienes personas cercanas con quienes contar?", o: ["Sí, tengo apoyo cercano", "Tengo alguna persona pero poca ayuda", "Estoy solo/a"] },
  { id: "a6", sistema: "Relacional", icono: "handshake", d: ["comunidad"], q: "¿Te sientes parte de algún grupo, entidad o comunidad?", o: ["Sí, me siento parte", "Poco o de forma irregular", "No, estoy aislado/a"] },
  { id: "a7", sistema: "Legal", icono: "file-text", d: ["documentacion"], q: "¿Cuál es tu situación con la documentación personal?", o: ["Todo en regla (DNI, NIE, nacionalidad…)", "Documentación parcial o temporal", "Sin documentos o en trámite inicial"] },
  { id: "a8", sistema: "Legal", icono: "shield-check", d: ["documentacion"], q: "¿Sientes que conoces tus derechos y puedes ejercerlos?", o: ["Sí, conozco mis derechos", "Conozco algunos pero no sé cómo usarlos", "No, me siento desprotegido/a"] }
];
window.BC_DERIVAR = (resp) => {
  const peso = { v: 0, a: 1, r: 2 }, m = {};
  window.BC_CATALOGO.autoevaluacion.forEach((q) => { const v = resp[q.id]; if (v) q.d.forEach((d) => { if (!m[d] || peso[v] > peso[m[d]]) m[d] = v; }); });
  return m;
};

/* Foto inicial de la red: tres entidades ficticias; el panel se ve desde la e1. */
window.BC_SEMILLA = () => {
  const M = (s) => Object.fromEntries(window.BC_CATALOGO.dimensiones.map((d, i) => [d.id, "var"[+s[i]] || "v"]));
  const B1 = (s) => window.BC_DERIVAR(Object.fromEntries(window.BC_CATALOGO.autoevaluacion.map((q, i) => [q.id, "var"[+s[i]]])));
  const C = (e, c) => ({ privacidad: true, tratamiento: true, entidades: e, comunicaciones: c });
  const P = (o) => Object.assign({ email: "", docTipo: "En trámite", doc: "", idioma: "Español", canal: "WhatsApp", municipio: "Madrid", estado: "En seguimiento", mapaTipo: "completo", notas: "" }, o);
  return {
    entidades: [
      { id: "e1", nombre: "Asociación Puentes", zona: "Usera · Madrid", tipo: "Asociación" },
      { id: "e2", nombre: "Fundación Raíces", zona: "Carabanchel · Madrid", tipo: "Fundación" },
      { id: "e3", nombre: "Red Vecinal Sur", zona: "Getafe", tipo: "Asociación vecinal" }
    ],
    conectores: [
      { id: "c1", nombre: "Lucía Romero", entidad: "e1", rol: "Trabajadora social", ultima: "Hoy, 10:42" },
      { id: "c2", nombre: "Samir El Idrissi", entidad: "e1", rol: "Mediador intercultural", ultima: "Hoy, 09:15" },
      { id: "c3", nombre: "Marta Gil", entidad: "e1", rol: "Voluntaria", ultima: "Ayer, 18:03" },
      { id: "c4", nombre: "Daniel Ortega", entidad: "e2", rol: "Educador social", ultima: "Hoy, 11:20" },
      { id: "c5", nombre: "Ana Belén Ruiz", entidad: "e3", rol: "Trabajadora social", ultima: "Hoy, 08:50" }
    ],
    recursos: [
      { id: "r1", entidad: "e1", nombre: "Bolsa de alquiler social", cat: "Vivienda", tipo: "Grupo", modo: "Solicitud", urg: "Normal", cupo: 12 },
      { id: "r2", entidad: "e1", nombre: "Orientación jurídica", cat: "Documentación y Trámites", tipo: "Evento", modo: "Inscripción", urg: "Normal", cupo: 20 },
      { id: "r3", entidad: "e1", nombre: "Banco de alimentos", cat: "Alimentación", tipo: "Grupo", modo: "Libre", urg: "Urgente" },
      { id: "r4", entidad: "e1", nombre: "Taller de competencias digitales", cat: "Competencias Digitales", tipo: "Evento", modo: "Inscripción", urg: "Normal", cupo: 15 },
      { id: "r5", entidad: "e2", nombre: "Albergue", cat: "Vivienda", tipo: "Grupo", modo: "Solicitud", urg: "Urgente", cupo: 30 },
      { id: "r6", entidad: "e2", nombre: "Orientación laboral", cat: "Empleo", tipo: "Grupo", modo: "Inscripción", urg: "Normal", cupo: 25 },
      { id: "r7", entidad: "e2", nombre: "Grupos de apoyo", cat: "Red de Apoyo", tipo: "Grupo", modo: "Libre", urg: "Normal" },
      { id: "r8", entidad: "e3", nombre: "Comedor social", cat: "Alimentación", tipo: "Grupo", modo: "Libre", urg: "Urgente" },
      { id: "r9", entidad: "e3", nombre: "Atención psicológica", cat: "Salud y Bienestar", tipo: "Grupo", modo: "Solicitud", urg: "Normal", cupo: 8 },
      { id: "r10", entidad: "e3", nombre: "Clases de español", cat: "Formación", tipo: "Grupo", modo: "Inscripción", urg: "Normal", cupo: 18 },
      { id: "r11", entidad: "e2", nombre: "Asesoría legal en extranjería", cat: "Documentación y Trámites", tipo: "Evento", modo: "Solicitud", urg: "Urgente", cupo: 6 },
      { id: "r12", entidad: "e3", nombre: "Mentor social", cat: "Red de Apoyo", tipo: "Grupo", modo: "Inscripción", urg: "Normal", cupo: 10 }
    ],
    personas: [
      P({ id: "BC-2026-0141", nombre: "Yasmina", apellidos: "Haddad", nac: "1991-04-12", tel: "+34 611 204 118", cp: "28026", idioma: "Árabe", origen: "conector", entidad: "e1", conector: "c1", alta: "2026-10-02", consent: C(true, true), mapa: M("2101120010110011") }),
      P({ id: "BC-2026-0152", nombre: "Carlos", apellidos: "Mendoza Ríos", nac: "1987-09-30", tel: "+34 622 918 330", cp: "28041", origen: "conector", entidad: "e1", conector: "c1", alta: "2026-10-09", consent: C(false, true), mapa: M("1210100021101000") }),
      P({ id: "BC-2026-0167", nombre: "Fatou", apellidos: "Diallo", nac: "1996-01-21", tel: "+34 633 552 907", cp: "28026", idioma: "Francés", canal: "Teléfono", origen: "conector", entidad: "e1", conector: "c2", alta: "2026-10-15", consent: C(true, false), mapa: M("1121011100120001") }),
      P({ id: "BC-2026-0170", nombre: "Andrés", apellidos: "Villalba", nac: "1979-06-03", tel: "+34 644 801 225", cp: "28019", docTipo: "Sí", origen: "conector", entidad: "e1", conector: "c3", alta: "2026-08-28", estado: "Cerrado", consent: C(true, true), mapa: M("0000000000000000") }),
      P({ id: "BC-2026-0188", nombre: "Mariana", apellidos: "Quispe", nac: "1993-11-17", tel: "+34 655 340 019", cp: "28026", origen: "conector", entidad: "e1", conector: "c2", alta: "2026-10-28", consent: C(true, true), mapa: M("1100101001021101") }),
      P({ id: "BC-2026-0203", nombre: "Olena", apellidos: "Kovalenko", nac: "1989-02-08", tel: "+34 666 712 448", email: "olena.k@correo.es", cp: "28026", idioma: "Inglés", canal: "Email", origen: "autorregistro", entidad: "e1", conector: null, alta: "2026-11-10", estado: "Abierto", mapaTipo: "corto", consent: C(true, true), mapa: B1("21201120") }),
      P({ id: "BC-2026-0207", nombre: "Ibrahim", apellidos: "Sow", nac: "2001-07-25", tel: "+34 677 093 512", cp: "28041", idioma: "Francés", origen: "autorregistro", entidad: "e1", conector: null, alta: "2026-11-11", estado: "Abierto", mapaTipo: "corto", consent: C(false, true), mapa: B1("12112022") }),
      P({ id: "BC-2026-0119", nombre: "Kwame", apellidos: "Mensah", nac: "1985-12-02", tel: "+34 688 219 774", cp: "28025", idioma: "Inglés", origen: "conector", entidad: "e2", conector: "c4", alta: "2026-09-21", consent: C(true, true), mapa: M("2111001010100010") }),
      P({ id: "BC-2026-0125", nombre: "Leila", apellidos: "Benali", nac: "1998-03-14", tel: "+34 699 451 803", cp: "28901", idioma: "Árabe", origen: "conector", entidad: "e3", conector: "c5", alta: "2026-10-11", consent: C(true, false), mapa: M("1002100110001000") })
    ],
    /* por = entidad que hizo la postulación. */
    solicitudes: [
      { id: "s1", persona: "BC-2026-0141", recurso: "r1", por: "e1", estado: "Pendiente", fecha: "2026-11-04" },
      { id: "s2", persona: "BC-2026-0141", recurso: "r5", por: "e2", estado: "Aprobada", fecha: "2026-10-20" },
      { id: "s3", persona: "BC-2026-0141", recurso: "r10", por: "e3", estado: "En lista de espera", fecha: "2026-10-24" },
      { id: "s4", persona: "BC-2026-0152", recurso: "r6", por: "e2", estado: "Aprobada", fecha: "2026-10-18" },
      { id: "s5", persona: "BC-2026-0152", recurso: "r2", por: "e1", estado: "Aprobada", fecha: "2026-10-10" },
      { id: "s6", persona: "BC-2026-0167", recurso: "r3", por: "e1", estado: "Aprobada", fecha: "2026-10-16" },
      { id: "s7", persona: "BC-2026-0167", recurso: "r9", por: "e3", estado: "Pendiente", fecha: "2026-11-06" },
      { id: "s8", persona: "BC-2026-0188", recurso: "r4", por: "e1", estado: "Aprobada", fecha: "2026-10-30" },
      { id: "s9", persona: "BC-2026-0188", recurso: "r7", por: "e2", estado: "Aprobada", fecha: "2026-11-02" },
      { id: "s10", persona: "BC-2026-0119", recurso: "r1", por: "e2", estado: "Pendiente", fecha: "2026-11-08" },
      { id: "s11", persona: "BC-2026-0125", recurso: "r2", por: "e3", estado: "Pendiente", fecha: "2026-11-09" },
      { id: "s12", persona: "BC-2026-0170", recurso: "r1", por: "e1", estado: "Aprobada", fecha: "2026-09-01" }
    ],
    accesos: [
      { persona: "BC-2026-0141", quien: "Lucía Romero", entidad: "e1", cuando: "2026-11-10 16:20", para: "Seguimiento del caso" },
      { persona: "BC-2026-0141", quien: "Daniel Ortega", entidad: "e2", cuando: "2026-10-20 12:05", para: "Decidir la solicitud a Albergue" },
      { persona: "BC-2026-0152", quien: "Lucía Romero", entidad: "e1", cuando: "2026-11-07 09:40", para: "Seguimiento del caso" }
    ]
  };
};
