# DEAD ROAD 404 — Fase 18 · Topología y mapas UV

## Alcance exacto

Esta entrega se ha generado **sobre una copia independiente de la Fase 17**. No se ha alterado ningún archivo de la Fase 17. La versión 0.18.0 conserva la conducción, las cuatro cámaras, la exploración, Vera, la cinta, la cabina, el combate, el guardado y el lanzamiento en Windows/Linux Mint.

### Modelado

- **Firebird:** la carrocería principal ya no utiliza el antiguo volumen de techo y capó construido mediante piezas superpuestas. Se reconstruye con una malla longitudinal de secciones variables (`F18_SculptedBody_UV`, 10 bandas × 11 vertices), techo *fastback* separado, parabrisas inclinado, pilares, alerones/molduras, pasos de rueda, salpicadero, asientos más bajos y cuatro pivotes `Wheel_FL/FR/RL/RR` preservados. El decal original del capó utiliza alfa; no es un logotipo oficial.
- **SUNSPUR FUEL:** texturas UV de fachada cerámica y techo corrugado, marcos metálicos, marquesina, nuevo cartel elevado y refuerzos estructurales; mantiene libre el acceso central para las misiones.
- **MILE 404:** nuevos paneles cerámicos UV a ambos lados de la puerta, parapeto escalonado, nueva señal de carretera, columnas y detalles CRT; mantiene libre la entrada del motel.
- **Corrección visual:** la detección de materiales de cristal considera también el nombre del nodo para preservar la transparencia con GLTFLoader.

### Texturas originales

Todos los mapas nuevos se encuentran en `public/textures/f18-*` y están incrustados en los GLB. La geometría y los mapas se producen con `tools/phase18_rebuild.py`. Ningún recurso se ha extraído de Lunacid, otros videojuegos o marcas automovilísticas.

### Reproducción desde código fuente

Instala en tu entorno de autoría `numpy`, `Pillow` y `trimesh` (no son dependencias de ejecución del videojuego) y ejecuta desde la carpeta raíz:

```bash
python tools/generate_art_assets.py
python tools/phase18_rebuild.py
python tools/validate_art.py
python tools/render_phase18_comparison.py
```

**Importante:** el segundo script espera que estén presentes los GLB de la Fase 17, tal como los genera el primero; trabaja dentro de una copia del proyecto. No uses esta cadena sobre una versión antigua que desees conservar.

### Blender

El entorno de construcción utilizado **no dispone de Blender**. Incluimos el flujo de importación de los tres GLB en `tools/blender_edit_assets.py` para generar archivos `.blend` editables en un equipo con Blender 4.x instalado, sin sobrescribir los GLB del juego:

```bash
blender --background --python tools/blender_edit_assets.py -- --all
```

Los archivos editables aparecerán en `blender-work/`. La fase incluye nueva topología y UV generadas con herramientas Python, pero **no** es un modelado artesanal realizado dentro de Blender ni se han producido archivos `.blend` aquí.

### Verificación ejecutada

- 101/101 pruebas Node de lógica/contratos.
- Comprobación estructural y geométrica de tres GLB; pivotes, triángulos finitos, pasillos de acceso, texturas incrustadas.
- Tres comparativas F17/F18 y una vista de conjunto mediante VTK, externas al juego; los renders no representan la calidad real de Three.js en Windows.
- Revisión sintáctica de TypeScript con el compilador de TypeScript global, sin resolver dependencias.
- Sintaxis Bash del lanzador Linux y verificación del ZIP.

### Límites importantes

- No se ha podido completar `npm run build` por no disponer de `three`, `@types/three` y `vite` instalados: el registro npm sigue inaccesible desde este entorno.
- No se ha comprobado WebGL, los controles reales, los FPS, las sombras ni las colisiones en un navegador; **se deben validar en tu Windows 11**.
- Los modelos siguen siendo **retro low-poly**, aunque con geometría y UV más explícitas. No son assets AAA, ni una reproducción fidedigna de ingeniería de un Pontiac real.
- Las colisiones se mantienen deliberadamente como la aproximación simplificada existente en código; los nuevos GLB no son automáticamente fuentes de colisión.
- REA no se ha ejecutado: para este trabajo de autoría y validación de nuestros propios recursos, hemos usado utilidades 3D y pruebas directas.

### Prueba de aceptación en Windows 11

1. Extraer el ZIP en `C:\Juegos\DEAD-ROAD-404-FASE-18\DEAD-ROAD-404`.
2. Ejecutar `INICIAR-WINDOWS.bat` y comprobar compilación y pantalla `ARTE 1992: 3/3 MODELOS F18 CARGADOS`.
3. Conducir el Firebird en cuatro cámaras, activar faros y freno de mano; comprobar que las ruedas se animan.
4. Explorar SUNSPUR desde la entrada hasta radio, llave, y volver al coche. Entrar en MILE 404 y recoger la cinta.
5. Cargar una partida de F17 (sin sobrescribirla) y guardar bajo la clave nueva `dead-road-404-f18-v2`.
6. Comprobar F3 en Conducción y Exploración, y comparar capturas reales del juego con la Fase 17.

**No se considerará la fase visualmente aprobada hasta cumplir los seis puntos anteriores.**
