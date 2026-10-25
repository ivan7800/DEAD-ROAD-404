# Fase 20 — Campaña e inventario, DEAD ROAD 404

## Estado: implementación revisable en GitHub

Esta entrega construye sistemas **jugables y persistentes** que servirán a los futuros capítulos. **No incluye la campaña completa ni todos los escenarios**: solo el primer capítulo es jugable. El resto figura como bloqueado, sin aparentar contenido inexistente.

### Núcleo narrativo

- `src/campaign.ts`: catálogo de seis capítulos, lista de capítulos implementados, permisos de acceso, progreso y diez hitos narrativos.
- Las acciones existentes registran hitos: entrar en SUNSPUR, radio, llave, cinta, Vera, teléfono, viajero, primer tramo de carretera y desvío final.
- El diario [J] presenta el capítulo activo, capítulos bloqueados y cronología de pistas.
- Resolver el desvío del primer arco marca el capítulo I como completado; **no desbloquea** capítulos que aún no tengan escenas y pruebas.
- Se mantienen las decisiones anteriores y los tres desenlaces existentes. En una fase futura tendrán integración en toda la campaña.

### Inventario real

- `src/inventory.ts`: inventario serializable con botiquín (+35 salud), ración (+4 comida), kit de reparación (+30% carrocería) y pistas no consumibles (llave y cinta 404).
- [I] abre una mochila con botones para utilizar consumibles; hay accesos táctiles en el mapa y en la interfaz general.
- Al empezar una partida se lleva un botiquín; la caja de suministros SUNSPUR situada cerca del surtidor permite conseguir un botiquín, una ración y un kit una sola vez.
- Los botones y el mundo se pausan mientras el inventario está abierto; consumir objetos se guarda inmediatamente para evitar duplicaciones por cargar.
- Los objetos de misión no se pueden gastar accidentalmente.

### Compatibilidad y migración

- Se mantiene `version:2` y **no cambia la clave** `dead-road-404-f19-v2`.
- `normalizeSave` agrega `inventory`, `campaign` y `supplyCacheTaken` a las partidas antiguas, sin tocar salud, piezas, comida, gasolina ni finales.
- Una llave o cinta obtenida en F19 se materializa en el inventario nuevo. Los hitos ya realizados se reconstruyen de las decisiones y banderas antiguas.
- Se sanitizan contadores, identificadores de capítulos y datos corruptos.

### QA exigido antes de fusionar

```bash
npm install
npm test
npm run build
npm run smoke
```

El navegador verifica el menú de mochila, la consulta del diario, la conducción, la exploración y la integridad del guardado. Las pruebas Node verifican usos, límites, migración y bloqueo de capítulos futuros.

## Próxima fase 21

Ampliar el Capítulo I hasta tener puzles enlazados, enemigos originales, diferentes rutas y cierre dramático con QA reproducible. **No aumentar la puntuación de calidad sin pruebas reales y feedback del juego.**
