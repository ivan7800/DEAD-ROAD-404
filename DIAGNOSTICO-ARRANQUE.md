# Corrección del lanzador Windows — Fase 5

## Fallos encontrados

1. El lanzador de la entrega original abría el navegador antes de iniciar Vite.
2. La instalación de dependencias no guardaba el motivo completo de error en un fichero.
3. No se verificaba la compatibilidad de Node con Vite 7.
4. No se verificaba la compilación antes de arrancar.

## Cambios

`INICIAR-WINDOWS.bat` guarda información de `npm install` y `npm run build` en `logs/arranque-windows.log`, valida Node.js/npm, comprueba compatibilidad y conserva abierta la consola en caso de fallo. El auxiliar `scripts/abrir-cuando-listo.ps1` abre el navegador solo cuando la dirección responde HTTP 200.

**Requisitos**: Windows 10/11, Node.js 22 LTS reciente, npm, Internet en el primer arranque. Ejecutar dentro de la carpeta extraída, no desde la vista previa del ZIP.

## Estado de validación

El BAT y PowerShell no se han ejecutado en Windows real en este entorno Linux. El arreglo evita un fallo de secuencia comprobado mediante lectura del código. La compilación completa aún requiere dependencias npm.

Si falla, adjuntar `logs/arranque-windows.log` y el texto de la ventana.
