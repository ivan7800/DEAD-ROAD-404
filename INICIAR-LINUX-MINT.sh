#!/usr/bin/env bash
set -Eeuo pipefail
cd -- "$(dirname -- "$(readlink -f -- "${BASH_SOURCE[0]}")")"
printf '\n========================================\n DEAD ROAD 404 - FASE 19 - LINUX MINT\n========================================\n'
fail() { printf '\n[ERROR] %s\n' "$1" >&2; read -r -p 'Pulsa Enter para salir...' _ || true; exit 1; }
command -v node >/dev/null || fail 'Falta Node.js (se recomienda Node.js 22 LTS).'
command -v npm >/dev/null || fail 'No se encuentra npm. Instala Node.js y npm.'
[[ -f package.json ]] || fail 'No se encuentra package.json junto al lanzador.'
if [[ ! -f node_modules/vite/bin/vite.js ]]; then
  echo '[INFO] Instalando dependencias (requiere Internet en el primer arranque)...'
  npm install --no-audit --no-fund || fail 'Fallo instalando dependencias.'
fi
url='http://127.0.0.1:4173'
echo "[INFO] Iniciando servidor en $url"
# Open a browser after the local server actually starts, if the desktop supports it.
( for _ in {1..45}; do
    if command -v curl >/dev/null && curl -fsS -o /dev/null "$url"; then
      command -v xdg-open >/dev/null && xdg-open "$url" >/dev/null 2>&1 || true
      exit 0
    fi
    sleep 1
  done ) &
helper_pid=$!
trap 'kill "$helper_pid" 2>/dev/null || true' EXIT
npm run dev -- --host 127.0.0.1 --port 4173 --strictPort || fail 'El servidor se ha detenido con error.'
