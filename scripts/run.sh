#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname "$0")" >/dev/null 2>&1 && pwd)"
ROOT_DIR="$SCRIPT_DIR/.."

usage() {
  echo "Usage: $0 [backend|frontend|both]"
  exit 1
}

load_backend_env() {
  local env_file="$ROOT_DIR/src/backend/.env.local"
  if [[ -f "$env_file" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$env_file"
    set +a
  fi
}

kill_port() {
  local port="$1"
  local pids
  pids=$( (lsof -ti tcp:"$port" 2>/dev/null || true) | tr '\n' ' ')
  if [[ -z "${pids// }" ]]; then
    pids=$( (sudo lsof -ti tcp:"$port" 2>/dev/null || true) | tr '\n' ' ')
  fi
  if [[ -n "${pids// }" ]]; then
    echo "Port $port is in use by PID(s): $pids. Stopping..."
    kill $pids 2>/dev/null || true
    sudo kill $pids 2>/dev/null || true
    sleep 1
    kill -9 $pids 2>/dev/null || true
    sudo kill -9 $pids 2>/dev/null || true
  fi
}

if [[ $# -ne 1 ]]; then
  usage
fi

case "$1" in
  backend)
    export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-25.jdk/Contents/Home
    export PATH="$JAVA_HOME/bin:$PATH"
    load_backend_env
    cd "$ROOT_DIR/src/backend"
    kill_port "${SERVER_PORT:-8080}"
    exec mvn -Dmaven.repo.local=./.m2 -Dspring-boot.run.fork=false spring-boot:run
    ;;
  frontend)
    cd "$ROOT_DIR/src/frontend"
    exec npm run dev
    ;;
  both)
    # Start backend in background (keep output visible)
    (
      export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-25.jdk/Contents/Home
      export PATH="$JAVA_HOME/bin:$PATH"
      load_backend_env
      cd "$ROOT_DIR/src/backend" || exit 1
      kill_port "${SERVER_PORT:-8080}"
      mvn -Dmaven.repo.local=./.m2 -Dspring-boot.run.fork=false spring-boot:run
    ) &
    BACK_PID=$!
    echo "Backend started (PID $BACK_PID)"

    # Ensure backend dies when this script exits (Ctrl+C or otherwise)
    cleanup() {
      if kill -0 "$BACK_PID" >/dev/null 2>&1; then
        echo "Stopping backend (PID $BACK_PID)..."
        # Try graceful, then force and clean child processes
        kill "$BACK_PID" >/dev/null 2>&1 || true
        pkill -P "$BACK_PID" >/dev/null 2>&1 || true
        sleep 1
        kill -9 "$BACK_PID" >/dev/null 2>&1 || true
      fi
      # Ensure port is free
      kill_port "${SERVER_PORT:-8080}"
    }
    trap cleanup EXIT INT TERM

    # Start frontend in foreground
    cd "$ROOT_DIR/src/frontend"
    npm run dev
    # After frontend exits, run cleanup explicitly
    cleanup
    ;;
  *)
    usage
    ;;
esac
