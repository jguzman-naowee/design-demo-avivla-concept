# design-demo-avivla-concept

Showroom del concepto de **Brújula Ciudadana** (Naowee). El nombre del repo es histórico: la demo no menciona AVIVLA. Estático: HTML, CSS y JS planos, sin build. Los datos son de ejemplo. Funciona en GitHub Pages.

La portada (`index.html`) pide el **rol**. Cada rol abre su propia demo, con su sesión, su menú y solo sus casos guiados: no se cambia de usuario ni se mezclan casos. Dentro de la demo se elige la **superficie**: Móvil (teléfono) o Escritorio (ventana de navegador).

| Rol | Puede | Casos | Superficie por defecto |
|---|---|---|---|
| Ciudadano · *decisión nueva* | Registrarse, Mi expediente, Mis recursos, Mi Mapa de Vida, Privacidad | 1.1 · 1.2 | Móvil |
| Conector | Mis personas, Registrar persona, ficha y derivación, Recursos de la red | 2.1 · 2.2 | Escritorio |
| Entidad | Resumen, Personas, Conectores, Bandeja | 3.1 · 3.2 | Escritorio |
| Registro de entidad | Formulario de alta con diseño mínimo | 4.1 | Escritorio |

Los datos se comparten entre roles (mismo `localStorage`): lo que registra el Ciudadano o el Conector aparece en la bandeja de la Entidad. «Restablecer datos», en el panel de casos, vuelve a la semilla.

**Formularios:** el 1.er «Continuar» marca lo que falta, el 2.º lo completa con datos de ejemplo (respeta lo ya escrito) y el 3.º avanza.

## Recorrido guiado

Presentación de unos dos minutos que recorre las vistas reales de la app. Se entra desde la franja oscura «Ver el recorrido» de la portada o en `tour/index.html` (`#5` abre la escena 5). Vive en `tour/`: `escenas.js` es el guion y `tour.js` el motor.

- Agregar o editar una escena: cambiar un objeto de `window.ESCENAS` en `tour/escenas.js`.
- Campos: `tipo` (`vista` o `hero`), `url`, `titulo`, `texto`, `acciones`, `resalta`, `duracion`.
- Cada escena de vista carga con `semilla=1`: **restablece los datos de ejemplo**, así que el recorrido pisa lo que hayas registrado.

## Cómo está armado

- `demo/`: el marco, tomado de `design-demo-metodologos/mobile` (cabecera, zoom, vista plana, panel de casos) con un selector de superficie. `demo/apps/<rol>/` tiene `app.json` (nombre, `inicio`, `superficie`) y `casos.js`.
- `app/brujula/`: **la app, una sola copia**. `index.html?rol=ciudadano|conector|entidad`, `alta-entidad.html`, `datos.js` (catálogo y semilla), `app.js` (rutas por hash y marcado `nwt-*`), `app.css` (solo distribución).
- Estilos: SDK Naowee (`sdk-frontend-foundations`) en `app/brujula/_sdk/`, con los íconos de `design-demo-digitacion`.
- Fuente de campos y reglas: `design-avivla-research` (docs 01, 03, 09 y 11).

```bash
npm run dev   # http://localhost:8781   (?dev=1 en la demo para el modo dev)
```
