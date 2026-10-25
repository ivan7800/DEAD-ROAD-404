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
