# DEAD ROAD 404 — Fase 14 · Cinta de asfalto (v0.14.0)

**Estado: entrega de código jugable pendiente de la prueba gráfica definitiva en Windows/Linux Mint.**

## Qué cambia respecto a Fase 13

| Área | Cambio verificable | Código |
| --- | --- | --- |
| Firebird | Labios frontales, tomas de capó, pasos de rueda, filetes, detalles interiores y matrícula ficticia original | `src/firebirdDetail14.ts` |
| Conducción | Freno de mano con Espacio, atenuación independiente del FPS y pilotos de freno | `src/arcadeBrakes.ts`, `src/main.ts`, `src/vehicle.ts` |
| Sensación de velocidad | Polvo de las ruedas en espacio mundial, una sola malla instanciada y emisión ajustada por preset | `src/driveDust.ts`, `src/drivingFeedback.ts` |
| Mundo | Autocine en ruinas, postes y líneas aéreas, restos VHS y patio trasero | `src/roadsideDetail14.ts` |
| Presentación | Overlay analógico con activación mediante V y respeto por movimiento reducido | `src/filmLook.ts`, `src/style.css`, `index.html` |
| Diagnóstico | Medidor F3: FPS medios móviles y estimación conservadora del 1% inferior | `src/performance.ts`, `src/main.ts` |
| Datos | Clave nueva de guardado; importación no destructiva F13 y base anterior | `src/main.ts` |

## Instalación Windows 11

1. Conserva **Fase 13**, no sobrescribas su directorio.
2. Extrae este ZIP en `C:\Juegos\DEAD-ROAD-404-FASE-14` (fuera de Google Drive/OneDrive).
3. Dentro de `DEAD-ROAD-404`, ejecuta `INICIAR-WINDOWS.bat`.
4. Primera ejecución: npm descarga dependencias; después verifica la compilación y arranca Vite en `http://127.0.0.1:4173`.
5. **C** cambia cámara, **G** calidad, **F3** rendimiento, **V** filtro analógico, **L** faros y **Espacio** frena en conducción. En exploración, Espacio sigue siendo ataque.

## Linux Mint

```bash
chmod +x INICIAR-LINUX-MINT.sh
./INICIAR-LINUX-MINT.sh
```

## Validación de regresión de usuario

1. **Windows:** comprobar instalación, menú, controles y logs si aparece algún error.
2. **Firebird:** probar persecución, capó, cockpit y frontal. Comprobar que el interior no tapa la carretera.
3. **Conducción:** al acelerar se ve polvo en *equilibrado/cine*. En *rendimiento* no se emite. Mantener Espacio frena, el coche no acelera mientras frena. Con S y Espacio se encienden pilotos.
4. **Escenario:** el autocine está al este de la carretera y no cambia el acceso a la tienda ni el motel. Observar postes eléctricos y señales; revisar errores WebGL de consola.
5. **Misión:** entrar en la gasolinera, radio con R, llave E, Vera, cinta del motel y llamada telefónica. Guardar/cargar durante la misión.
6. **Retro:** alternar filtro con V; con «reducir movimiento» del sistema no hay animaciones VHS.
7. **FPS:** anotar media y 1% bajo con F3 en cada preset y cada cámara, especialmente cockpit y gasolinera.

## Limitaciones

- La carrocería sigue siendo **procedural**, no un modelo de Blender terminado; las texturas reales de carrocería, UV y una animación completa todavía faltan.
- Se han realizado pruebas de lógica/sintaxis, pero **no la compilación con dependencias** ni la prueba de WebGL: este contenedor no puede resolver `registry.npmjs.org` (`EAI_AGAIN`). No se afirman FPS reales.
- El autocine y el decorado añadido son visuales: no hay misión nueva allí ni colisiones para esos objetos. La jugabilidad anterior se conserva.
- No se ha ejecutado REA; es opcional para inspección de estructura JS/TS y auditorías cuando haya un runtime REA disponible.
- La clave de guardado de la fase 14 es distinta para proteger la fase 13. Al pulsar Cargar, se pueden leer guardados de F13 o base; se escribirán solo en F14 al guardar.

## Auditoría con REA (opcional en instalación del usuario)

```bash
# Después de configurar REA en el equipo, análisis estático local de nuestro código:
npx -y rea-agents@latest analyze-javascript-application . --json > evidencia-dead-road-f14.json
```

El informe es **evidencia estática**, no sustituye un test real de navegador.
