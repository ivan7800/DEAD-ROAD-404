# Fase 13 · Informe técnico (implementación parcial de Americana Nocturna)

**Fecha:** 24-10-2026. **Base:** copia íntegra de Fase 12 v0.12.0. **Salida:** v0.13.0.

## Cambios confirmables en código

| Componente | Archivo | Cambio |
|---|---|---|
| Entorno 3D | `src/americana1992.ts`, `src/scene.ts` | Rotulación ficticia SUNSPUR, DUSTLINE, NOCTURNE y MILE 404, cabina, máquinas y CRT, iluminación contenida, paleta nocturna |
| Coche | `src/firebird1992.ts`, `src/vehicle.ts` | Acabados laterales, palanca, radio cassette, salidas de aire, tapicería y pequeños instrumentos |
| Interacción | `src/phone1992.ts`, `src/main.ts` | Evento narrativo de la cabina desbloqueado después de sintonizar radio, una vez por partida, sin recompensas duplicadas |
| Estado | `src/state.ts`, `src/main.ts` | Campo `phoneHeard` opcional para versiones previas; nueva clave de guardado para evitar sobrescribir la Fase 12 |
| Interfaz | `src/style.css`, `index.html` | 1992, paleta oficial y estilo de paneles analógicos; disminución de scanlines; foco teclado visible |
| Producción | `docs/FASE_13_*`, `skills/americana-1992.md` | Biblia de arte y metodología de revisión |

## Seguridad y preservación

- Ningún archivo ZIP previo ha sido modificado. El código se distribuye en otra carpeta y el juego conserva su versión 2 del esquema de partida.
- El guardado de Fase 13 utiliza `dead-road-404-f13-v2`. Si no encuentra partida Fase 13, **lee** el guardado anterior `dead-road-404-v2` sin sobrescribirlo.
- La cabina genera únicamente una pista textual original, sin enlaces, llamadas de red ni recompensa de recursos. Los nuevos elementos no sustituyen los objetivos radio, llave y Vera.

## Pruebas y límites

- `npm test`: ver informe de ejecución adjunto `QA_RESULTADOS_F13.txt`.
- Sintaxis de `INICIAR-LINUX-MINT.sh`: verificada con `bash -n`.
- Sintaxis de los módulos TypeScript: verificada con TypeScript `transpileModule` (no equivale a comprobación completa de tipos).
- `npm view three`: `EAI_AGAIN` DNS. No fue posible instalar `three`, `vite`, `@types/three` ni realizar `npm run build` completo en este entorno.
- No se ejecutaron el renderizado Three.js ni pruebas con navegador real. **No se certifica calidad visual, FPS ni ausencia de fallos de ejecución.**
- REA: documentación del proyecto consultada; **REA no se ha ejecutado** en esta entrega. Para auditar el código propio posteriormente: `npx -y rea-agents@latest analyze-javascript-application ./ --json > rea-report.json` (opcional; no bloquea el arranque).
- La cabina/vending tienen colisión básica por AABB; la IA del Vigilante no integra aún estas nuevas piezas para navegación. La nueva ornamentación incrementa objetos y luces; medir draw calls.

## Pruebas manuales necesarias en Windows

1. Extraer en `C:\\Juegos\\DEAD-ROAD-404-FASE-13`, ejecutar `.bat`. No ejecutar desde carpeta sincronizada Google Drive.
2. Confirmar que `SUNSPUR FUEL` y `MILE 404 MOTEL` se leen en 3D.
3. Conducir y cambiar entre cámaras: que la nueva decoración del cockpit no obstaculice la mirada.
4. Explorar la tienda, sintonizar radio `R`, usar cabina al este `E`, consultar diario `J`.
5. Probar guardado/carga dos veces; cabina no debe repetir recompensa (no hay), y la Fase 12 debe conservar su partida.
6. Completar radio → llave → Vera y recuperar cassette del motel.
7. Medir `F3` con presets `G` en conducción y exploración; comparar con Fase 12 en misma resolución y hardware.
