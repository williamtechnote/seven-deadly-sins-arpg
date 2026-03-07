#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

PORT="${1:-8000}"

echo "Restarting Seven Deadly Sins ARPG server..."
echo "Project root: $ROOT_DIR"
echo "Port: $PORT"

RUNNING_PIDS="$(lsof -ti "TCP:${PORT}" -sTCP:LISTEN || true)"
if [[ -n "$RUNNING_PIDS" ]]; then
  echo "Detected running server on port $PORT: $RUNNING_PIDS"
  echo "Stopping existing process..."
  kill $RUNNING_PIDS || true
  sleep 1

  STILL_RUNNING="$(lsof -ti "TCP:${PORT}" -sTCP:LISTEN || true)"
  if [[ -n "$STILL_RUNNING" ]]; then
    echo "Force stopping process: $STILL_RUNNING"
    kill -9 $STILL_RUNNING || true
  fi
fi

echo "Starting new server..."
echo "Open: http://localhost:$PORT"

if command -v python3 >/dev/null 2>&1; then
  exec python3 -m http.server "$PORT"
elif command -v npx >/dev/null 2>&1; then
  exec npx serve . -l "$PORT"
else
  echo "Error: python3 or npx is required to run the project." >&2
  exit 1
fi
