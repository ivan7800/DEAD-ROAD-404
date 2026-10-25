# DEAD ROAD 404 — Fase 25: Frecuencia muerta

## Implementación jugable

Cuarto capítulo original con dos áreas PSX físicas independientes, cargadas sin modelos GLB ni nuevos pases de iluminación:

- **Superficie WXR-404** (desde KM72 y una vez concluido el pueblo): gran antena, estudio, archivador de cintas, relé, mesa de mezclas, Nora y botiquín.
- **Refugio subterráneo UMBRAL — NIVEL -1**: atravesar la escotilla desplaza al jugador a un segundo escenario cerrado, con techo, terminal, dos circuitos, el Operador y salida de regreso a la superficie. La puerta es reversible; recargar en estado avanzado permite repetir el descenso.

### Secuencia

1. Inspeccionar cartel WXR-404 y la prohibición de emitir a las **02:17** [E].
2. Activar relé exterior [E] y recuperar cinta maestra [E].
3. Opcional: hablar con Nora (ayudarla: +2 comida; desconfiar: +1 pieza), botiquín no repetible (+22 salud y +1 pieza).
4. Sintonizar mezclador con **0217**; las respuestas equivocadas persisten y no bloquean el progreso.
5. Abrir escotilla y entrar en el **refugio UMBRAL**.
6. Descifrar terminal **0313**, la hora del campanario del capítulo III.
7. Desconectar los **dos circuitos de contención A y B**; solo entonces aparecerá el enemigo.
8. Derrotar a **EL OPERADOR** (150 PV, dos ritmos, pulso anunciado con ojo iluminado, recuperación, orientación y alcance para atacar).
9. Decisión final única: emitir los nombres (+14 L) o cortar la emisora (+2 piezas). El capítulo IV se registra como completado; el capítulo V permanece precintado hasta su implementación.

### Controles

WASD explorar, [E] interactuar, [F] atacar, [SHIFT] correr/esquivar, [I] inventario, [J] expediente, [ESC] pausa pulp, [M] Firebird. El panel WXR-404 aparece en el mapa cuando hay acceso válido. El HUD indica objetivos con etapas, y el color del ojo del Operador te avisa antes de cada pulso.

### Compatibilidad

No se modifica la clave de guardado `dead-road-404-f19-v2` ni la versión `2`. El nuevo campo `chapterFour` guarda etapa, Nora, intentos de ambos códigos, máscara de interruptores, salud, botiquín y decisión. La normalización limpia datos inválidos, y partidas F23 sin ese campo conservan el final histórico del KM120 sin marcar IV falsamente como terminado. En partidas nuevas, el final de la carretera requiere completar IV.

### Verificación / limitaciones

Pruebas Node: estados, dependencias entre etapas, idempotencia, salud de enemigo, avisos, guardado y colisiones; Chromium: ruta física a WXR, código del mezclador, descenso por escotilla, código del refugio y recarga. La prueba de combate completo en navegación real y una campaña de 6–8 horas quedan pendientes; capítulos V y VI aún no implementados.

## QA

```bash
npm test
npm run build
node scripts/check-pages-build.mjs
npm run smoke
```
