# DEAD ROAD 404 — Edición retro PSX

Juego original de carretera, supervivencia y terror ambientado en 1992. TypeScript + Three.js + Vite, estética deliberadamente inspirada en los gráficos PS1 y la atmósfera de dungeon crawlers como Lunacid. No utiliza modelos de videojuegos comerciales.

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
