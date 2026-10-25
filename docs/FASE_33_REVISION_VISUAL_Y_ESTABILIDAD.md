# DEAD ROAD 404 — Fase 33: revisión visual de seis capítulos y resistencia

**Base:** `main` v0.21.5 (commit `b61c913f39f782ca244f65000f670c5ccc4bd338`). Fecha de trabajo: 25 de octubre de 2026.

## Hallazgo de cobertura comprobado

Hasta la fase 32, el CI incluía capturas puntuales y comprobaciones de interfaz en tres tamaños, además de la ruta Chromium del capítulo VI. No había una matriz de capturas de **los seis escenarios**, cada uno en móvil y escritorio, ni una prueba de estabilidad automatizada de más de 18 segundos. Esto era una **brecha de validación**, no una prueba de que los escenarios tuviesen defectos gráficos.

## Matriz incorporada

El script `scripts/qa-visual33.mjs` abre el navegador Chromium de Playwright y utiliza un guardado aislado, normalizado por el propio juego, para acceder a los seis escenarios a través de los botones reales del mapa.

| Capítulo | Escenario | Captura escritorio | Captura móvil |
| --- | --- | --- | --- |
| I | SUNSPUR · La última parada | 1280×800 | 390×844 |
| II | THE LAST LIGHT · Los que no regresan | 1280×800 | 390×844 |
| III | El pueblo sin nombre | 1280×800 | 390×844 |
| IV | WXR-404 · Frecuencia muerta | 1280×800 | 390×844 |
| V | KM 96 · El kilómetro imposible | 1280×800 | 390×844 |
| VI | KM 120 · Donde termina la carretera | 1280×800 | 390×844 |

El test valida canvas con tamaño positivo, estado y objetivo visibles, posición vertical del indicador de estado, ausencia de desbordamiento horizontal y excepciones JS. También captura alto contraste, texto ampliado y movimiento reducido en el menú de opciones de ambos tamaños. Informe estructurado: `artifacts/f33-visual-report.json`. Capturas: `artifacts/f33-*.png`. Se publican como artefactos del workflow, no como contenido de la web.

**Precisión sobre la evidencia:** tomar una captura no es inspeccionarla visualmente. Las comprobaciones geométricas son objetivas, pero la dirección artística, composición, legibilidad de carteles y fidelidad PSX requieren revisión humana de las capturas. El script entra mediante checkpoints de progreso y no demuestra la campaña completa desde cero.

## Resistencia

Se amplía `npm run qa:stability -- --seconds=65` en CI frente a los 18 segundos de F32, reutilizando el perfil de Chromium aislado. El script alterna conducción, exploración y menú, abre y cierra el diario, guarda, recarga y verifica recursos del estado; registra `pageerror`, solicitudes fallidas, ciclos, recargas y muestras disponibles de memoria JS. Las pruebas largas voluntarias se ejecutan **localmente**:

```bash
npm ci
npx playwright install chromium
npm run build
npm run qa:visual
npm run qa:stability -- --minutes=20
npm run benchmark:gpu -- --repeats=3 --seconds=10 --require-hardware
```

En Windows, ejecuta los comandos anteriores desde PowerShell o CMD; en Linux Mint, desde una terminal. El parámetro `--require-hardware` rechaza renderizadores de software conocidos, pero un identificador de GPU no equivale por sí solo a una prueba de que toda la ruta gráfica esté acelerada. Un benchmark de escena quieta tampoco sustituye el estrés de combate.

## Puerta de publicación

Exigir al mismo SHA: `npm ci`, **todas** las pruebas Node, `npm run build`, comprobación Pages, smoke Chromium, cuatro finales, QA visual F33, estabilidad F33 y benchmark CI sin errores. Solo después fusionar la PR y verificar `build` y `deploy` de `main`.

## Pendientes

- Inspección humana de todas las capturas y ajustes artísticos basados en defectos reales.
- Rendimiento y sesiones largas en equipos Windows y Linux con GPU física (objetivo ≥45 FPS sostenidos, 1 % bajo documentado).
- Campaña completa desde KM0 a todos los finales sin usar checkpoints.
- Accesibilidad manual: lector de pantalla, contrastes verificados y distintas escalas de texto.

REA (repositorio/documentación aportados al proyecto) se ha consultado como referencia metodológica; **no se ha ejecutado**. Esta fase analiza código propio de TypeScript y navegadores de prueba. Ninguna puntuación 9,5/10 ni lanzamiento 1.0 queda certificada solo con CI.
