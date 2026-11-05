# design-demo-avivla-concept

Demo de concepto de **AVIVLA** (Naowee). Estático: HTML, CSS y JS planos, sin build; los datos son de ejemplo. Funciona en GitHub Pages.

La portada es el marco de demos (`design-layouts-demos/web`): el diseño a pantalla completa y un botón **Configuraciones** (⌘/Ctrl+Shift+L). Guía del marco: `design-layouts-demos/docs/MONTAR-DEMO-WEB.md`.

- `index.html`, `web.js`, `web.css`, `shared/`: el marco. `apps/index.js` registra la demo.
- `apps/avivla/`: la demo (`index.html`, `app.json`).

```bash
npm run dev   # http://localhost:8781/?app=avivla
```
