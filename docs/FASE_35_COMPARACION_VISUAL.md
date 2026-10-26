# Fase 35 — Comparación visual verificada

Fecha: 2026-10-26. Rama: `feature/f35-psx-atmosphere`.

## Evidencia y alcance
Se descargaron y **abrieron** los artefactos de capturas PNG de las ejecuciones CI de `main` (run 40237753852, F34) y la PR (run 40284945711, commit `a0043c89`). Se inspeccionó una cuadrícula con las 12 capturas de escritorio de los seis capítulos, antes/después. La CI del commit más reciente terminó en `success`.

## Luminancia central orientativa, PNG escritorio 1280×800

Misma región central: x=16–84 % del ancho, y=22–67 % del alto; conversión a escala de grises. **No representa contraste WCAG, calidad artística ni GPU real.**

| Capítulo | Media anterior | Media F35 | Píxeles <40 anterior | Píxeles <40 F35 |
|---|---:|---:|---:|---:|
| I | 21,9 | 30,0 | 99,5 % | 78,5 % |
| II | 18,1 | 26,7 | 93,3 % | 86,9 % |
| III | 21,2 | 32,2 | 99,2 % | 75,6 % |
| IV | 61,3 | 67,3 | 36,9 % | 36,9 % |
| V | 32,5 | 42,6 | 88,3 % | 65,9 % |
| VI | 37,0 | 45,8 | 78,2 % | 74,0 % |

## Resultado
Los seis capítulos aumentaron su luminancia central en las capturas revisadas. La diferenciación cromática es más visible: III cian, IV azul y V-VI cálido/violeta. No se han añadido luces adicionales ni nuevos objetos 3D; los perfiles se activan al cambiar de capítulo. La UI permanece legible en las capturas de escritorio examinadas. El capítulo II sigue especialmente oscuro y necesita revisión artística futura. La matriz automatizada también contiene 390×844 y 320×568; la superación del QA DOM no sustituye revisar esas capturas manualmente.

## Pendiente tras el merge
- Validación visual en dispositivos móviles físicos y desbordamiento residual en 320 px.
- GPU física Windows/Linux, FPS sostenidos y estabilidad prolongada.
- Legibilidad bajo monitores oscuros y accesibilidad con lectores de pantalla.
- Campaña completa desde KM0, sin checkpoints.

La fase 35 aporta una mejora visual medible y CI verde, **no certifica calidad 9,5/10 ni versión 1.0**.
