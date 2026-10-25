# DEAD ROAD 404 — Edición retro PSX

Juego original de carretera, supervivencia y terror ambientado en 1992. TypeScript + Three.js + Vite, estética deliberadamente inspirada en los gráficos PS1 y la atmósfera de dungeon crawlers como Lunacid. No utiliza modelos de videojuegos comerciales.

## Fase 31 — Reproducibilidad, cuatro finales y capturas responsive (v0.21.4)

La fase 31 incorpora una instalación de dependencias reproducible (`package-lock.json` y `npm ci` una vez generado el lockfile legítimo), revisiones Chromium específicas para **los cuatro desenlaces** con elección desde la interfaz, comprobación del guardado tras recarga, capturas de 1280×800 y 390×844, y detección de desbordamiento horizontal. Las pruebas de finales parten de estados válidos próximos al desenlace, mientras que el smoke general conserva los recorridos físicos y combates.

El resultado de CI **no** sustituye la inspección visual humana, una partida completa de varias horas ni el benchmark físico Windows/Linux. Consulta [FASE_31_CALIDAD_Y_REPRODUCIBILIDAD.md](docs/FASE_31_CALIDAD_Y_REPRODUCIBILIDAD.md).

## Fase 30 — Medición reproducible y estabilidad (v0.21.3)

La actualización reduce trabajo innecesario en el renderizado: reutiliza los vectores de linterna y localizaciones, no recalcula la proyección de cámara sin cambios, evita reescrituras idénticas de estadísticas HUD y omite la simulación de polvo cuando la calidad PSX lo oculta. **No se atribuyen mejoras de FPS sin comparaciones controladas.**

Se incluyen benchmarks locales de Chromium para **Windows y Linux**, de uso voluntario, con informes JSON y Markdown en `artifacts/benchmarks/`. Los datos no se transmiten a terceros. Ejecutar tras `npm install` y `npx playwright install chromium`:

- Windows: doble clic en `BENCHMARK-404-WINDOWS.cmd`.
- Linux: `bash ./BENCHMARK-404-LINUX.sh` (o `chmod +x BENCHMARK-404-LINUX.sh` para ejecutarlo desde el explorador).
- Comando configurable: `npm run benchmark:gpu -- --repeats=3 --seconds=10`.
- CI de referencia **software**, no GPU: `npm run benchmark:ci`.

Los informes registran navegador, SO, renderer WebGL, FPS de `requestAnimationFrame`, 1 % bajo, p95, triángulos y draw calls; **rAF no mide tiempo GPU**. Comprueba el campo `softwareRenderer`: Chrome puede usar SwiftShader incluso cuando el equipo tiene tarjeta gráfica. El parámetro `--require-hardware` detiene el informe si detecta software, pero un renderer no identificado no demuestra por sí solo aceleración física.

Consulta los hallazgos y limitaciones en [FASE_30_ESTABILIDAD_GPU.md](docs/FASE_30_ESTABILIDAD_GPU.md). Queda pendiente la comparación A/B en hardware real de Windows/Linux, la auditoría visual completa y la estabilidad en partidas prolongadas.

## Fase 29 — Optimización PSX (v0.21.2)

La segunda pasada de agrupación une mallas Lambert de decorados que comparten exactamente apariencia tras la cuantización PSX. No agrupa actores, objetos interactivos ni superficies transparentes o texturizadas. El nuevo control de fotogramas mantiene la frecuencia completa durante el juego, limita el redibujado de menús/diálogos/pausa y evita renderizar cuando la pestaña está oculta. El diagnóstico FPS se refiere al juego activo.

Las seis fases narrativas, controles y guardado siguen vigentes. [Evidencias y límites de F29](docs/FASE_29_RENDIMIENTO_Y_PULIDO.md). Una menor cantidad de draw calls no garantiza por sí sola una mejora de FPS; sigue pendiente el benchmark Windows/Linux con GPU física.

## Fase 28 — Guardados seguros y accesibilidad (v0.21.1)

Esta revisión mejora la experiencia sin alterar la estructura de la campaña: «Nueva partida» muestra confirmación y escribe inmediatamente el nuevo guardado, cancelar no modifica la partida anterior, los diálogos del juego retienen el foco de Tab, el diario vuelve a permitir desplazamiento con teclado y los lectores de pantalla reciben avisos solo cuando cambia el objetivo. Se mantienen los seis capítulos y sus cuatro finales.

Auditoría y limitaciones: [FASE_28_AUDITORIA_CALIDAD.md](docs/FASE_28_AUDITORIA_CALIDAD.md). Faltan mediciones de FPS en GPU real, pruebas manuales en Windows/Linux y validación completa de accesibilidad; no se declara 9,5/10 todavía.

## Fase 27 — Donde termina la carretera (v0.21.0)

**Los seis capítulos de la historia principal ya tienen un recorrido jugable**. Al completar el KM 96 y conducir hasta el **KM 120**, el mapa permite entrar en el último desvío. El nuevo peaje PSX incluye señal del final, registro de 1992, dos relés A/B, barrera con el código **1204** y encuentro contra **El Doble** (140 PV, ataque anunciado y dos ritmos). Desde la elección final se obtienen cuatro desenlaces persistentes, incluido **El coro de los ausentes** si transmitiste el registro desde el pueblo (III), emitiste los nombres desde WXR-404 (IV) y conservaste el mapa del KM 96 (V).

Las acciones de final no se repiten al recargar. La compatibilidad con partidas anteriores a F27 se mantiene en la misma clave `dead-road-404-f19-v2`; los guardados F26 que carecen del sexto capítulo conservan el epílogo clásico. Se mantiene la estética PSX y el juego no necesita archivos GLB externos durante la partida.

**Validación automatizada:** 259 pruebas Node y ruta Chromium real hasta el final I, incluidos puzle, combate y persistencia: [CI fase 27](https://github.com/ivan7800/DEAD-ROAD-404/actions/runs/40220104885). Los otros desenlaces tienen pruebas unitarias. La validación manual de imagen, accesibilidad, FPS y sesiones largas en Windows 11 y Linux Mint sigue pendiente; no declarar 9,5/10 ni versión 1.0 sin ella.

Ficha: [Fase 27](docs/FASE_27_DONDE_TERMINA_LA_CARRETERA.md).

## Fase 26 — El kilómetro imposible (v0.20.0)

El capítulo V está implementado en el **KM 96**: abre el mapa al completar IV, conduce hasta 96 km y entra en **EL KILÓMETRO IMPOSIBLE**. El nuevo escenario PSX contiene una carretera repetida, tres señales de distancia, un registrador de patrulla y dos balizas. Investiga el poste y la patrulla con [E], activa A/B, descifra **2496** (24 km entre KM72 y KM96) y enfréntate al **Agrimensor** (120 PV; [F] golpear, [SHIFT] esquivar). La elección final guarda nombres (+12 L) o entierra el mapa (+3 piezas). La maleta opcional otorga +18 salud y +2 comida una sola vez.

El guardado sigue en `dead-road-404-f19-v2` y mantiene el formato `version:2`. Las partidas anteriores a la fase 26 conservan el epílogo histórico; las nuevas requieren completar V antes de ese desenlace. El capítulo VI queda pendiente: todavía **no es la campaña definitiva ni una versión 1.0**.

Pruebas automatizadas: [GitHub Actions F26](https://github.com/ivan7800/DEAD-ROAD-404/actions/runs/40217843970) incluye Node, build TypeScript/Vite, Pages y recorrido Chromium real del capítulo V (balizas, código, jefe, decisión y guardado). Quedan pendientes pruebas manuales visuales y de rendimiento en hardware Windows/Linux.

Detalles: [docs/FASE_26_KILOMETRO_IMPOSIBLE.md](docs/FASE_26_KILOMETRO_IMPOSIBLE.md).

## Edición PSX, 25 de octubre de 2026

**PSX 240p es el modo predeterminado** para todos los usuarios, independientemente de ajustes gráficos antiguos. La versión original y las partidas guardadas permanecen intactas.

- Límite de resolución interna de unos **426×240 píxeles a 16:9**, con escalado mediante vecinos próximos y adaptación a la relación de aspecto.
- G alterna PSX 240p, 288p, 360p y 450p. El mundo es low-poly en **todos** los niveles y no usa sombras en tiempo real.
- Firebird original con nueva geometría low-poly de coste reducido; estación, motel, carretera y enemigos usan geometría procedural retro.
- Las mallas GLB detalladas de F19 se conservan para edición artística, pero **no se descargan al abrir el juego**.
- Niebla corta, materiales Lambert económicos, texturas pixeladas, carteles originales de 128×48 píxeles, sin desenfoques pesados ni VHS animado.
- Batching para decorado estático, luz ambiental simplificada, distancia de visión reducida.

**Controles:** G calidad PSX · F3 FPS/draw calls y DPR · H manual. WASD conducción y exploración, C cámaras, E interacción, J diario, P guardar.

## QA

```bash
npm install
npm test
npm run build
npm run smoke
```

Chromium de GitHub Actions debe verificar el arranque, no descargar GLB, respetar el límite 240p y permitir conducir, explorar, guardar y recuperar una partida.

## Plataformas

GitHub Pages, Windows 11 y Linux Mint. Los lanzadores locales de F19 siguen incluidos.

**Limitación de rendimiento:** la medición de FPS con SwiftShader en GitHub Actions no representa tu GPU. La mejora de fluidez se verifica en el PC real con F3; no garantizamos 60 FPS sin medirlo. El cambio de arte no elimina las misiones, encuentros, guardados ni finales.


## Fase 21 — La Última Parada ampliada

Después de resolver la misión de Vera, comienza el arco del **Celador de la Frecuencia**:

1. Encuentra el **fusible** al este de SUNSPUR (x25,z7) e interactúa [E].
2. Restaura el **cuadro** frente a la estación (x14,z5). El código de la radio es la hora congelada: **217 kHz**.
3. Abre la **escotilla** frente a MILE 404 (x−20,z−36).
4. Lucha contra el **Celador**, jefe low-poly de dos fases y ataques anunciados (ojo amarillo), hasta reducir sus 120 puntos de vida a cero.
5. Decide entre **destruir** o **conservar** la transmisión. El Capítulo I se marca como completado, con consecuencias sobre salud o piezas.

Toda la ruta conserva el aspecto PSX 240p y el guardado `dead-road-404-f19-v2`. Los jugadores con una partida F20 en la que ya terminaron la misión de Vera no pierden la posibilidad de alcanzar el final de carretera existente: esos guardados se migran como capítulo inicial resuelto.

**La campaña completa no está acabada:** capítulos II–VI y su contenido todavía requieren las fases 22–27. La Fase 21 es una ampliación con recorrido, puzle y enfrentamiento verificables, no una calificación automática de 9,5/10.

Detalles: [docs/FASE_21_LA_ULTIMA_PARADA.md](docs/FASE_21_LA_ULTIMA_PARADA.md).


## Fase 23 — El pueblo sin nombre (PSX)

Se desbloquea tras terminar el restaurante THE LAST LIGHT y avanzar al **KM 48**. Desde el mapa, el botón **ENTRAR EN EL PUEBLO SIN NOMBRE** abre una localización nueva con cine, hotel, archivo, calle y campanario, construidos con geometría 3D original de bajo coste.

**Progresión:** monumento de desaparecidos → generador municipal → archivo → panel horario **0313** → campanario → jefe **EL CAMPANERO** (120 PV, dos ritmos y ataque anunciado) → decisión final. El NPC **Elías** ofrece una decisión con consecuencias, y hay suministros opcionales de recogida única.

Esta actualización conserva la estética PSX 240p, todos los sistemas anteriores y los guardados existentes. Las partidas de F22 sin objeto `chapterThree` mantienen el epílogo anterior de KM120 sin desbloquear falsamente el capítulo III. Los capítulos IV–VI siguen pendientes; **no es aún una versión 1.0**.

Detalles, instrucciones y limitaciones: [Fase 23](docs/FASE_23_EL_PUEBLO_SIN_NOMBRE.md).
