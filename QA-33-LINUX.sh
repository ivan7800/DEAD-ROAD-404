#!/usr/bin/env bash
# DEAD ROAD 404 - Fase 33, ejecutar: bash QA-33-LINUX.sh
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  printf 'Falta Node.js o npm. Instala Node.js 22+ sin elevar este script.\n' >&2
  exit 1
fi
while true; do
  printf '\n=== DEAD ROAD 404 - QA FASE 33 (Linux) ===\n'
  printf '[1] Instalar dependencias y Chromium\n'
  printf '[2] Capturar los seis capítulos\n'
  printf '[3] Resistencia local de 20 minutos\n'
  printf '[4] Medir GPU real\n'
  printf '[5] Tests y compilación\n'
  printf '[0] Salir\n'
  read -rp 'Elige una opción: ' choice
  case "${choice}" in
    0) exit 0;;
    1) npm ci && npx playwright install chromium;;
    2) npm run build && npm run qa:visual;;
    3) npm run build && npm run qa:stability -- --minutes=20;;
    4) npm run benchmark:gpu -- --repeats=3 --seconds=10 --require-hardware;;
    5) npm test && npm run build;;
    *) printf 'Opción no reconocida.\n' ;;
  esac
  printf 'Las capturas y los informes se guardan en ./artifacts/\n'
done
