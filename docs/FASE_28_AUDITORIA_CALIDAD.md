# DEAD ROAD 404 — Fase 28: auditoría técnica de calidad

Fecha: 2026-10-25 · Base examinada: `main` `b054d3d172aa98f543b9312875322460f12174b5` (v0.21.0).
Ámbito: versión web JavaScript/TypeScript + Three.js + Vite y flujo GitHub Pages.
Procedimiento: inspección estática del repositorio, revisión del flujo GitHub Actions y pruebas unitarias/Chromium en CI de rama. No se ha ejecutado REA: la revisión usa herramientas GitHub y tests existentes. No se han ejecutado instaladores ni binarios desconocidos.

## Hallazgos (observación → riesgo → medida)

| ID | Severidad | Evidencia técnica | Resultado |
| --- | --- | --- | --- |
| F28-01 | Alta | `src/main.ts`: botón `#new` reiniciaba el estado en memoria sin escribir `dead-road-404-f19-v2`. | Confirmación explícita antes de sustituir una partida y escritura inmediata al empezar una nueva; cancelar conserva el guardado. |
| F28-02 | Media | `#encounter`, `#inventory-panel` y `#controls-guide`: sin contención general del foco de Tab, a diferencia de los diálogos Pulp. | Foco circular dentro del diálogo activo, sin atrapar el teclado cuando la UI está cerrada. |
| F28-03 | Media | `index.html`: HUD completo como `aria-live=polite`; `hud()` reescribía `#objective` cada ~250 ms. | Región viva limitada al objetivo, solo se escribe cuando cambia; reduce anuncios repetidos. |
| F28-04 | Media | `src/main.ts`: `capturesGameKey` prevenía el desplazamiento por teclado incluso al tener el diario/inventario abiertos. | Se permiten teclas nativas de desplazamiento en los diálogos y diario, sin permitir movimiento de personaje. |
| F28-05 | Rendimiento pendiente | CI F27: 42,1 FPS (media móvil), 6 FPS en el 1 % más lento, ~340 draw calls, ~5914 triángulos, 240P, DPR 0.32 (renderizado software SwiftShader). | No se compara con GPU real. Registrar medidas Windows y Linux a igual resolución/escena antes de prometer 45 FPS sostenidos o 9,5/10. |
| F28-06 | Reproducibilidad pendiente | `.github/workflows/deploy.yml` usa `npm install` y el árbol del repositorio no contiene `package-lock.json`. | Generar y versionar lockfile en entorno con registro npm y después usar `npm ci` en CI. No simular lockfile. |
| F28-07 | Revisión manual pendiente | Las pruebas Chromium recorren interacciones reales de capítulos IV–VI, pero inyectan checkpoints válidos para acortar el tiempo; no realizan una campaña completa desde el KM 0. | QA manual de seis capítulos, ramas narrativas, cuatro finales, ventanas pequeñas, periféricos, accesibilidad y sesiones prolongadas. |

## Cobertura y evidencias
- Último despliegue `main` antes de F28: GitHub Actions 40220660232, resultado `success`.
- CI F27: 259/259 pruebas Node; compilación TypeScript/Vite y smoke Chromium aprobados. La escena final fue recorrida por teclado; final I y restauración comprobados. Los finales II–IV cuentan con comprobación de lógica, no con smoke completo cada uno.
- F28 amplía Chromium con cancelación/confirmación de nueva partida, recarga real y restauración, foco de Tab, desplazamiento del diario y mutaciones de la región viva.
- No hay evidencia de FPS en GPU Windows ni Linux; no hay auditoría visual manual certificada, ni accesibilidad WCAG integral o pruebas de mando/táctil.

## Puerta de publicación
```bash
npm test
npm run build
node scripts/check-pages-build.mjs
npm run smoke
```
Fusionar únicamente cuando el último commit de la PR tenga CI `success`. Después verificar el job Pages del commit fusionado y conservar las incidencias de rendimiento y accesibilidad pendientes para la siguiente iteración.

**Conclusión:** campaña de seis capítulos con CI funcional, pero no certificada como 9,5/10 ni como versión final de producción multidispositivo.
