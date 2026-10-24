# DEAD ROAD 404 — Fase 16: reconstrucción artística de activos 3D

**Versión:** 0.16.0 · **Ambientación:** Estados Unidos alternativos, 1992.  
**Base de trabajo:** copia de la Fase 15, sin editar los originales.  
**Alcance:** sustituir las partes principales de geometría procedural por tres modelos GLB originales; conservar jugabilidad y guardados.

## Qué cambia de verdad

- `public/models/firebird_77.glb`: silueta continua de carrocería, guardabarros, cristales, detalles de época, habitáculo, neumáticos/llantas, emblema inventado y cuatro ruedas como nodos animables (`Wheel_FL`, `Wheel_FR`, `Wheel_RL`, `Wheel_RR`). La ilustración del capó **no copia** el águila comercial de Pontiac.
- `public/models/sunspur_station.glb`: cuerpo principal con entrada abierta, fachada acristalada, mostrador, estanterías, frigoríficos, marquesina, surtidores, mangueras, roofline, ventilación, rótulos y texturas originales.
- `public/models/mile404_motel.glb`: edificio con puerta libre, porche, marquesina, ventanas, muebles interiores, televisión, cartel, molduras y superficies envejecidas.
- `src/artAssets.ts`: `GLTFLoader` carga los modelos locales a partir de `import.meta.env.BASE_URL`, por lo que funciona con subrutas de GitHub Pages. La escena anterior permanece visible durante la carga. Solo se oculta el modelo de reserva de cada edificio **cuando su GLB ha cargado correctamente**.
- `src/vehicle.ts`: montaje de modelo detallado con ruedas animadas, cabeceo/rolido arcade y faros alternativos. El prototipo se conserva como reserva.
- `src/scene.ts`: separación de las partes arquitectónicas de reserva y control del estado de carga.
- `index.html`: indicador de estado de carga: 3/3 GLB o modo reserva. Se mantiene la ayuda del teclado de la Fase 15.
- Guardado: clave nueva `dead-road-404-f16-v2`; lectura compatible con F15, F14, F13 y el legado; no se sobrescriben los guardados anteriores.

## Evidencia técnica local

Comprobaciones del 24-10-2026, realizadas en el entorno de edición:

| Comprobación | Resultado |
|---|---|
| Pruebas de lógica Node | 90/90 correctas |
| Integridad GLB 2.0 y nodos de rueda | Correcta |
| Render independiente con VTK de los tres GLB | Correcto; ver `previews/` |
| Huecos de puerta, muestreo geométrico de acceso | Correcto para los dos edificios |
| Scripts Linux `bash -n` | Correcto |
| Sintaxis TypeScript mediante `node --experimental-strip-types --check` | Correcta |
| Compilación completa `tsc && vite build` | **No ejecutada con éxito**: faltan dependencias `three`/`vite` y el registro npm no resuelve DNS |
| Prueba WebGL/browser Windows o Linux Mint | **Pendiente** |
| REA | **No ejecutado**; no está instalado aquí |

**Las imágenes `previews/*.png` son renders directos de los GLB con VTK**, no capturas del juego ni pruebas de Three.js. La integración visual final no está verificada.

## Instalación en Windows

1. Mantener la copia estable F15 en su carpeta anterior.
2. Extraer el ZIP en `C:\Juegos\DEAD-ROAD-404-FASE-16`.
3. Abrir la carpeta `DEAD-ROAD-404` y ejecutar `INICIAR-WINDOWS.bat`.
4. La primera vez necesita Internet para `npm install`, dentro de C:, fuera de Google Drive.
5. En el menú, seleccionar `EXPLORAR GASOLINERA`; comprobar que hay cartel SUNSPUR y acceso al interior. Seleccionar `CONDUCIR` y pulsar `C` para las cuatro cámaras.
6. El indicador `ARTE GLB: 3/3 MODELOS CARGADOS` confirma la carga **en ese navegador**. Si aparece `MODO DE RESERVA`, comprobar consola F12 y `Network` para las URLs `models/*.glb`.

## Linux Mint

```bash
chmod +x INICIAR-LINUX-MINT.sh
./INICIAR-LINUX-MINT.sh
```

## Validación recomendada en el equipo del usuario

```bash
npm install
npm test
npm run build
npm run dev
```

En exploración: entrar en la estación, acercarse a la radio, recoger llave, visitar motel, recoger cinta y hablar con Vera. En conducción: cambiar cámaras, girar, frenar y comprobar faros. Comparar la escena con la versión estable en el mismo equipo. Pulsar F3 para FPS y llamadas de dibujo. Registrar errores de consola.

## Cómo regenerar el arte 3D

Estos scripts son **herramientas de autoría**, no se ejecutan al iniciar el juego.

```bash
python -m pip install trimesh numpy pillow
python tools/generate_art_assets.py
python tools/validate_art.py
```

`tools/render_previews.py` requiere VTK y un sistema gráfico; en Linux sin pantalla física se puede usar `xvfb-run`. Las texturas base externas se dejan en `public/textures/`; los rótulos principales viajan embebidos en los GLB.

## Deuda técnica y decisiones futuras

Estos son **modelos low-poly originales**, no diseños AAA ni una reproducción fotográfica exacta del Firebird real. Su detalle arquitectónico mejora la estructura anterior, pero todavía necesitan un pase artístico humano con Blender (topología, UV completas, texturas PBR, rotulación e interiores), animación de personajes y pruebas de iluminación. La siguiente auditoría debe medir **FPS, arte final y colisiones en navegador real**. No ampliar contenido antes de superar esa validación.
