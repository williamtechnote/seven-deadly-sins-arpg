#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

PORT="${1:-8000}"

echo "Starting Seven Deadly Sins ARPG..."
echo "Project root: $ROOT_DIR"
echo "Port: $PORT"
echo "Open: http://localhost:$PORT"

if command -v python3 >/dev/null 2>&1; then
  exec python3 -m http.server "$PORT"
elif command -v npx >/dev/null 2>&1; then
  exec npx serve . -l "$PORT"
else
  echo "Error: python3 or npx is required to run the project." >&2
  exit 1
fi
