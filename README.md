# DEAD ROAD 404 — Fase 19 · Taller de arte 3D

**v0.19.0 — Americana Nocturna / 1992.** Código TypeScript + Three.js + Vite. Fase 19 construida sobre una copia independiente de F18, sin modificar la anterior.

## Novedades

- **Firebird:** nueva topología de carrocería de 53 perfiles longitudinales, techo y cristales reconstruidos, pintura texturizada, grafismo original en capó, reflejos y detalles de interiores. Sigue siendo un modelo retro de autoría procedural, no un modelo profesional acabado en Blender.
- **SUNSPUR FUEL:** cubierta con perfil más trabajado, escaparates ilustrados, surtidores con mangueras y nuevos detalles de época.
- **MILE 404:** porche con cubierta, ventanas, señal y máquina expendedora.
- GLB autónomos y offline con un sistema de reserva si alguno no carga.
- **Partidas:** nueva clave `dead-road-404-f19-v2`, con lectura compatible de F18, F17 y versiones anteriores. No sobrescribe las claves antiguas.

## Windows 11

Descomprimir en `C:\Juegos\DEAD-ROAD-404-FASE-19\DEAD-ROAD-404` y ejecutar **`INICIAR-WINDOWS.bat`**. Requiere Node.js y npm instalados; en el primer arranque utiliza Internet para descargar dependencias si faltan. Evitar instalar `node_modules` dentro de carpetas sincronizadas con Google Drive.

## Linux Mint

```bash
chmod +x INICIAR-LINUX-MINT.sh
./INICIAR-LINUX-MINT.sh
```

## Comprobación del proyecto

```bash
npm install
npm test
npm run build
npm run dev
```

Los GLB están incluidos; no necesitas Python ni Blender para **jugar**. Para **editar** o inspeccionar modelos, consulta `FASE_19_ESTUDIO_3D.md`. Los renders en `previews/` no son capturas del juego ejecutado en un navegador.

## Estado de calidad

107 pruebas Node superadas, comprobación geométrica y de huecos de acceso superada, modelos renderizados con VTK. **No** se ha verificado la compilación completa ni la ejecución Three.js en este entorno por un fallo de red del registro npm. El resultado debe validarse en Windows/Linux real antes de darlo por estable.

REA no se ha ejecutado en esta fase. La Fase 18 original se conserva independiente.
