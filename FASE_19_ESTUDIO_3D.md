# DEAD ROAD 404 — Fase 19: Taller de arte 3D

**Versión:** 0.19.0. **Año del mundo:** 1992. **Estado:** beta visual, requiere aceptación en navegador real.

## Objetivo / alcance verificado

Se ha trabajado a partir de una **copia** completa de F18, conservando el juego y sus lanzadores. Esta entrega reemplaza únicamente tres GLB dentro de `public/models/` y añade sus recursos fuente. No se han editado archivos de la Fase 18 ni los guardados del usuario.

| Objeto | Cambios geométricos y artísticos | Limitaciones |
|---|---|---|
| `firebird_77.glb` | Nueva malla continua con **53 secciones longitudinales × 17 puntos de perfil**, techo dividido, nuevos parabrisas y luneta semitransparentes, pilares, franja de pintura negra/dorada, grafismo **original** del capó, salida del shaker, refuerzo de guardabarros y detalles del habitáculo. Cuatro pivotes `Wheel_*` conservados. | No es un modelo industrial ni una reproducción dimensional homologada del Pontiac; el morro, ventanas y cockpit requieren acabado manual en Blender. |
| `sunspur_station.glb` | Nuevas ventanas con escena comercial ilustrada, cubierta corrugada por bandas inclinadas, refuerzos, columnas, fascia SUNSPUR, surtidores con mangueras y pavimento desgastado. | La tienda sigue teniendo una planta sencilla. Las colisiones son independientes del GLB. |
| `mile404_motel.glb` | Cubierta de acceso inclinada, pilares de porche, ventanas texturizadas, rótulo MILE 404, máquina expendedora y luminarias. | Interior y arquitectura de conjunto todavía rudimentarios. |

Las texturas `f19-*.png` y los modelos son originales, generados localmente con Python. No contienen modelos comerciales de terceros ni arte extraído de otros juegos.

## Autoría reproducible (solo en una COPIA)

Partir de los GLB incluidos en la Fase 18, o de una nueva copia de este ZIP con los modelos de F18 restaurados. **No ejecutar primero `generate_art_assets.py` en el mismo árbol** si deseas conservar la geometría F18: ese script genera la base histórica del proyecto y podría sustituir modelos más nuevos.

```bash
python tools/phase19_studio_pass.py
python tools/validate_art.py
python tools/render_previews.py
```

Dependencias de autoría: `trimesh`, `numpy`, `Pillow`, `vtk` (este último solo para vistas de inspección). No son dependencias del videojuego.

El generador F19 evita duplicar los objetos `F19_*` en invocaciones sucesivas. Los GLB incluidos **ya están generados**: el usuario no necesita Python para jugar.

## Blender: edición manual y publicación segura

Blender **no está instalado en el entorno de construcción**. Se incluye un flujo reproducible para el equipo local, pero no se han generado ni validado archivos `.blend` aquí.

Con Blender 4.x o posterior instalado, ejecutar desde el directorio del juego:

```powershell
blender --background --python tools/blender_edit_assets.py -- --all
```

Se generan archivos `blender-work/*-EDITABLE.blend` en tu equipo, sin sobrescribir los GLB del juego. Si deseas exportar modelos ajustados:

```powershell
blender --background --python tools/blender_edit_assets.py -- --all --export
```

La exportación va a `blender-work/*-BLENDER-EXPORTED.glb`, **no** a `public/models/`. Antes de adoptar un modelo editado, verificar escalas, pivotes `Wheel_FL/FR/RL/RR`, puertas y rutas de misión con `tools/validate_art.py`, ejecutar pruebas y comprobar en navegador real. No sustituir automáticamente recursos funcionales por exportaciones no comprobadas.

## Pruebas

- Node.js: `npm test` — 107 pruebas de lógica/contratos aprobadas en esta entrega.
- Python `tools/validate_art.py` — tres modelos, geometría finita, límite de polígonos y puertas practicables.
- VTK: renders F18/F19 desde las mismas cámaras en `previews/COMPARATIVA-*-F18-F19.jpg` y `previews/ESCENA-COMBINADA-FASE-19.png`. **No** son capturas del motor Three.js.
- Windows 11 y Linux Mint: lanzadores incluidos, no ejecutados aquí en esos sistemas.
- `npm run build` y prueba visual WebGL: **no verificados**, porque no se pudieron instalar Three.js/Vite desde el registro npm (DNS `EAI_AGAIN`).
- REA: no ejecutado; no es necesario para editar nuestros propios modelos fuente. Si después se audita el paquete JavaScript compilado con REA, registrar evidencia y limitaciones.

## Validación manual obligatoria

1. Descomprimir en `C:\Juegos\DEAD-ROAD-404-FASE-19\DEAD-ROAD-404`, conservar F18.
2. Ejecutar `INICIAR-WINDOWS.bat`. Esperar a la compilación y a que se abra el navegador.
3. Confirmar `ARTE 1992: 3/3 MODELOS F19 CARGADOS` y abrir la consola del navegador para descartar errores.
4. Probar controles, freno de mano, cuatro cámaras, puertas, surtidores, linterna, combate, radio, Vera y cinta.
5. Cargar un guardado de F18 y verificar que al guardar se utiliza únicamente la clave F19.
6. Medir FPS y tirones con F3 en conducción y exploración; fotografiar pantalla para auditoría visual.

**Criterio de aceptación:** sin errores de ejecución, entradas sin obstrucciones, controles fluidos, iluminación comprensible y un resultado gráfico que el usuario apruebe. Hasta entonces la F19 es una beta visual, no un producto comercial acabado.
