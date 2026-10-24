# DEAD ROAD 404 — Fase 17: pase artístico 1992

**Versión:** 0.17.0. **Base:** copia de Fase 16, sin modificar originales.

## Entrega funcional

1. **GLB Firebird 77:** retoque exterior de frontal, molduras y guardabarros, espejos y tiradores, detalles de maletero, instrumentos y tapicería interior, emblema gráfico original NIGHT HAWK. Las cuatro ruedas animables mantienen los nombres anteriores. Sigue siendo un modelo low-poly original inspirado en un coche clásico, **no** un Pontiac CAD ni un modelo licenciado de calidad comercial.
2. **SUNSPUR FUEL:** paredes y canopy con superficies envejecidas, puertas despejadas, marcos, mangueras, carteles SUNSPUR, afiches originales, letreros, bombas y elementos de interiores. Mapas **base color + normal + metallic/roughness** para las superficies principales.
3. **MILE 404:** fachada y aleros enriquecidos, carpintería de ventanas, iluminación física de gas de neón, carteles originales, moqueta y papel de pared texturizados; la entrada permanece libre.
4. **Iluminación Three.js:** `src/lighting17.ts` controla tres luces ambientales económicas, desactivando dos en perfil Rendimiento. Las luces no proyectan sombras adicionales y el parpadeo no es estroboscópico.
5. **Persistencia:** nuevo `dead-road-404-f17-v2`; lectura F16, F15, F14, F13 y original, sin sobrescribir esas claves.
6. **Herramientas de autoría:** `tools/generate_art_assets.py` + `tools/phase17_detail.py` generan assets originales. `tools/blender_edit_assets.py` permite importar los GLB y guardar archivos `.blend` para una edición profesional posterior en un PC donde esté Blender instalado.

## Calidad verificada en este entorno

- 95 pruebas de Node superadas, incluidos materiales PBR, luces, Blender no destructivo, y guardados.
- `python tools/validate_art.py`: geometría finita y <10.000 triángulos/modelo, ruedas independientes, huecos de paso geométricamente despejados.
- Render VTK de los tres GLB individuales y escena combinada, incluidos en `previews/`. **Son renders independientes, no capturas de Three.js ni QA del juego.**
- Python scripts `py_compile`, `bash -n` Linux y sintaxis de módulos TypeScript: se comprueban aparte en la entrega final.

**Sin verificar:** `npm run build`, ejecución real Three.js, controles de conducción con los modelos nuevos, colisiones reales de la escena integrada, FPS, aspecto desde cada cámara, ejecución Windows 11/Linux Mint. Este entorno no puede obtener npm (DNS `EAI_AGAIN`). **Blender no se ha ejecutado** por no estar instalado, ni se han producido archivos `.blend`; su script está listo para ejecutarlo localmente. Tampoco se ha ejecutado REA.

## Cómo verificar en Windows (sin sobrescribir la instalación estable)

1. Extraer en `C:\Juegos\DEAD-ROAD-404-FASE-17\DEAD-ROAD-404`.
2. Ejecutar `INICIAR-WINDOWS.bat` y comprobar que termina la compilación y se abre Chrome/Edge en `http://127.0.0.1:4173`.
3. Esperar a `ARTE 1992: 3/3 MODELOS F17 CARGADOS`; si falla, usar F12 → Consola/Red para ver `models/*.glb`.
4. Conducir y comprobar cámaras `C`, faros `L`, freno de mano `Espacio` y F3 rendimiento.
5. Explorar y recorrer la gasolinera desde la entrada hasta la radio, llave, motel, cinta y Vera, sin atravesar muros; comprobar el diario, guardado/carga y respuestas de teclado H/J/E/R.
6. Comparar F16 y F17 en las mismas cámaras y calidad gráfica; anotar FPS medio y 1% bajo después de 2 minutos, además de capturas sin HUD si es posible.

## Modelado Blender (opcional, requiere Blender 4.x local)

Ejecutar en el terminal donde tengas Blender instalado, desde la carpeta del proyecto:

```sh
blender --background --python tools/blender_edit_assets.py -- --all
```

Creará `blender-work/firebird_77-EDITABLE.blend`, `...sunspur_station-EDITABLE.blend`, `...mile404_motel-EDITABLE.blend`, conservando intactos `public/models/*.glb`. No ejecuta Blender al iniciar el juego. Se recomienda revisar UVs, líneas de silueta, triangulación, shading, la proporción del capó y el encaje de las ruedas antes de exportar arte de producción.

## Qué sigue siendo deuda real

- **Modelado:** el Firebird sigue siendo una aproximación geométrica; para acabado profesional hacen falta modelador, buenas referencias legales, topología/UV y trabajo manual más extenso en Blender.
- **Arquitectura:** estación y motel tienen ahora más superficies y detalles, pero faltan exteriores e interiores de varias plantas/habitaciones, materiales de alta calidad optimizados, puertas animables y composición ambiental hecha a mano.
- **Personajes:** el Vigilante conserva animación procedural; siguen faltando personajes esculpidos y rigging.
- **QA:** hasta ejecutar versión compilada en Windows 11 no se puede afirmar que el salto visual sea final ni que 60 FPS se mantengan.

## Derechos y procedencia

Geometría, marcas ficticias y mapas generados por el código incluido en el proyecto. No se han extraído ni redistribuido modelos, texturas o audio de Lunacid, The Oregon Trail u otras obras. El nombre Pontiac Firebird identifica la inspiración de época, no una afiliación ni licencia de General Motors.
