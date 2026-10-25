#!/usr/bin/env bash
# Ejecutar en terminal: bash ./BENCHMARK-404-LINUX.sh
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
 echo "ERROR: Instala Node.js/npm por los medios habituales de tu distribución." >&2
 exit 1
fi
if [[ ! -d node_modules/playwright ]]; then
 echo "Falta Playwright. Ejecuta: npm install && npx playwright install chromium" >&2
 exit 1
fi
if (( $# )); then
 npm run benchmark:gpu -- "$@"
else
 npm run benchmark:gpu -- --repeats=3 --seconds=10
fi
echo "Informes locales: ./artifacts/benchmarks/"
