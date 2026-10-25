# DEAD ROAD 404 — Fase 31: reproducibilidad, finales y QA visual

Base autorizada: commit `929d30d823c822ac76a1cee2497cfb415fec2abc` (`main`, v0.21.3, 25 de octubre de 2026).

## Objetivo y evidencias separadas

1. **Dependencias:** antes, el workflow utilizaba `npm install` y no había lockfile, por lo que cada ejecución podía resolver versiones distintas bajo rangos `^`. La corrección válida es generar `package-lock.json` con npm real, versionarlo y cambiar el workflow a `npm ci`. No fabricar manualmente integridades ni hashes de paquetes.
2. **Cuatro finales:** el `smoke-browser.mjs` anterior recorría las escenas físicas de capítulos V–VI, pero solo ejercitaba desde UI el final I (Amanecer prestado). El nuevo `qa-finales31.mjs` carga **puntos de control validables** de la fase VI, selecciona cada desenlace mediante botones reales de Chromium y verifica estado, persistencia tras recargar y bloqueo de capítulos cerrados. No equivale a jugar cuatro campañas completas desde el principio.
3. **Visual responsive:** capturas a 1280×800 y 390×844 (menú y opciones), resolución válida de canvas y detección de desbordamiento horizontal. Las capturas quedan como artefactos revisables, **sin certificar subjetivamente la dirección artística**. No se ha comparado visualmente el pixel art con referencias del usuario.
4. **CI:** pruebas Node y TypeScript/Vite, verificación de rutas GitHub Pages, recorrido completo de Chromium, benchmark software y test específico F31. No confundir `success` con prueba de GPU real o con varias horas de campaña.
5. **Seguridad:** el script de QA solo escribe en su propio perfil temporal del navegador y archivos de evidencias en `artifacts/`. No requiere credenciales ni ejecuta binarios desconocidos del usuario.

## Cómo reproducir

```bash
npm ci
npx playwright install chromium
npm test
npm run build
node scripts/check-pages-build.mjs
npm run smoke
npm run qa:finales
npm run benchmark:gpu -- --repeats=3 --seconds=10
```

En Windows es necesario Node.js 22 o superior y PowerShell/CMD; en Linux, Node.js y los paquetes necesarios para Chromium. `npx playwright install --with-deps chromium` puede requerir derechos de administrador en Linux; no lanzar con elevación automática. El benchmark de F30 genera resultados solo en `artifacts/benchmarks`.

## Criterios de aceptación

- `package-lock.json` debe haberse generado por npm desde el `package.json` exacto y `npm ci` debe instalar desde cero sin cambiar el lockfile.
- Los 4 finales deben elegir el botón correcto, registrar `ending` y restaurarse idénticos después de `reload` y `load`.
- Sin errores JS ni desbordamiento horizontal en los dos tamaños de pantalla; capturas almacenadas como artefactos para inspección.
- La rama no se fusionará si cualquiera de las pruebas de CI falla; el despliegue de `main` se comprobará tras la fusión.

## Limitaciones pendientes

No hay prueba visual manual certificada de todos los capítulos en móviles reales o Windows/Linux, ni cuatro partidas completas desde el KM0, ni una comparación A/B de FPS con GPU física, ni certificación WCAG integral. REA no se ha ejecutado en esta fase: el procedimiento es revisión de código propio, CI, Playwright y generación de lockfile npm.

No asignar un 9,5/10 o publicar como versión 1.0 sin cerrar estos controles.
