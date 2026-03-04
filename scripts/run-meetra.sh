#!/usr/bin/env bash
set -euo pipefail

# Single-terminal runner for Meetra (web + core api + auth + celery worker).
# Usage:
#   bash scripts/run-meetra.sh start --server-ip 131.234.29.111
#   bash scripts/run-meetra.sh start   # assumes localhost browser
#   bash scripts/run-meetra.sh status
#
# Ctrl+C in the start command will stop the processes started by this script.

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

CONDA_ENV="${CONDA_ENV:-meetra-api}"
WEB_PORT="${WEB_PORT:-3000}"
CORE_PORT="${CORE_PORT:-9000}"
AUTH_PORT="${AUTH_PORT:-8002}"

SERVER_IP="127.0.0.1"
CMD="${1:-start}"

SKIP_DOCKER=0
SKIP_MIGRATIONS=0
STOP_DOCKER_ON_EXIT=0

print_usage() {
  cat <<'EOF'
Usage:
  bash scripts/run-meetra.sh start [--server-ip IP] [--skip-docker] [--skip-migrations] [--stop-docker-on-exit]
  bash scripts/run-meetra.sh status

Examples:
  bash scripts/run-meetra.sh start --server-ip 131.234.29.111
  bash scripts/run-meetra.sh start
EOF
}

wait_for_http() {
  local url="$1"
  local timeout_s="${2:-60}"
  local interval_s=2
  local start_ts
  start_ts="$(date +%s)"

  until curl -fsS "$url" >/dev/null 2>&1; do
    sleep "$interval_s"
    local now_ts
    now_ts="$(date +%s)"
    if (( now_ts - start_ts >= timeout_s )); then
      echo "Timed out waiting for: $url" >&2
      return 1
    fi
  done
}

ports_free_or_warn() {
  # Soft check: if a port is in use, we warn and continue (the service may still start).
  # You can re-run after stopping the previous processes.
  local ports=("$@")
  for p in "${ports[@]}"; do
    if ss -ltnp 2>/dev/null | grep -Eq ":${p}\b"; then
      echo "Warning: port $p appears to be in use." >&2 || true
    fi
  done
}

start() {
  # Parse args
  shift || true
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --server-ip)
        SERVER_IP="${2:-}"
        shift 2
        ;;
      --skip-docker)
        SKIP_DOCKER=1
        shift
        ;;
      --skip-migrations)
        SKIP_MIGRATIONS=1
        ;;
      --stop-docker-on-exit)
        STOP_DOCKER_ON_EXIT=1
        ;;
      -*)
        echo "Unknown option: $1" >&2
        print_usage
        exit 2
        ;;
      *)
        echo "Unknown arg: $1" >&2
        print_usage
        exit 2
        ;;
    esac
  done

  # Health/CORS behavior depends on web origin. Update the frontend API URLs here.
  cat > "$REPO_ROOT/apps/web/.env.local" <<EOF
NEXT_PUBLIC_API_URL=http://${SERVER_IP}:${CORE_PORT}
NEXT_PUBLIC_AUTH_API_URL=http://${SERVER_IP}:${AUTH_PORT}
EOF

  if (( SKIP_DOCKER == 0 )); then
    echo "[1/5] Starting docker infrastructure..."
    pnpm docker:up
  fi

  if (( SKIP_MIGRATIONS == 0 )); then
    echo "[2/5] Running database migrations..."
    pnpm db:upgrade
    pnpm auth:db:upgrade
  fi

  # Soft check before starting.
  echo "[3/5] Starting services..."
  ports_free_or_warn "$WEB_PORT" "$CORE_PORT" "$AUTH_PORT"

  pids=()
  pidfile="$REPO_ROOT/.meetra-run-pids"

  cleanup() {
    echo "Stopping Meetra services..."
    # Kill in reverse order (worker tends to depend on services being up).
    for pid in "${pids[@]:-}"; do
      if [[ -n "${pid:-}" ]] && kill -0 "$pid" 2>/dev/null; then
        kill "$pid" 2>/dev/null || true
      fi
    done
    rm -f "$pidfile" 2>/dev/null || true
    if (( STOP_DOCKER_ON_EXIT == 1 )) && (( SKIP_DOCKER == 0 )); then
      pnpm docker:down || true
    fi
  }
  trap cleanup INT TERM

  # Core API
  (
    cd "$REPO_ROOT/apps/api"
    conda run -n "$CONDA_ENV" --no-capture-output \
      python -m uvicorn app.main:app --reload --host 0.0.0.0 --port "$CORE_PORT"
  ) &
  pids+=("$!")

  # Auth service
  (
    cd "$REPO_ROOT/apps/auth-service"
    conda run -n "$CONDA_ENV" --no-capture-output \
      python -m uvicorn app.main:app --reload --host 0.0.0.0 --port "$AUTH_PORT"
  ) &
  pids+=("$!")

  # Celery worker
  (
    cd "$REPO_ROOT/apps/api"
    conda run -n "$CONDA_ENV" --no-capture-output \
      celery -A app.worker.celery_app worker --loglevel=info
  ) &
  pids+=("$!")

  # Web (Next.js)
  (
    cd "$REPO_ROOT/apps/web"
    npm run dev
  ) &
  pids+=("$!")

  printf "%s\n" "${pids[@]}" > "$pidfile"

  echo "Meetra is starting..."
  echo "Web:  http://${SERVER_IP}:${WEB_PORT}"
  echo "API:  http://${SERVER_IP}:${CORE_PORT}"
  echo "Auth: http://${SERVER_IP}:${AUTH_PORT}"

  echo "[4/5] Waiting for health endpoints..."
  wait_for_http "http://127.0.0.1:${CORE_PORT}/health" 90
  wait_for_http "http://127.0.0.1:${AUTH_PORT}/health" 90
  echo "Health OK."

  echo "[5/5] Running. Press Ctrl+C to stop."
  # Wait for any job to exit; then cleanup via trap.
  wait -n
}

status() {
  echo "Ports (listeners):"
  ss -ltnp 2>/dev/null | grep -E ":(3000|8002|9000)\b" || true
  echo
  echo "Web env:"
  if [[ -f "$REPO_ROOT/apps/web/.env.local" ]]; then
    sed -n '1,5p' "$REPO_ROOT/apps/web/.env.local" || true
  else
    echo "apps/web/.env.local not found"
  fi
}

case "$CMD" in
  start) start "$@" ;;
  status) status ;;
  -h|--help) print_usage ;;
  *)
    echo "Unknown command: $CMD" >&2
    print_usage
    exit 2
    ;;
esac

