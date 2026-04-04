#!/bin/bash
set -euo pipefail

usage() {
  cat <<USAGE
Usage: $0 <api-base-url>

Examples:
  $0 https://staging-api.example.com
  $0 https://api.example.com

Optional:
  API_BEARER_TOKEN=<token> $0 https://api.example.com
USAGE
}

if [[ $# -ne 1 ]]; then
  usage
  exit 1
fi

BASE_URL="${1%/}"
HEALTH_URL="$BASE_URL/actuator/health"
READINESS_URL="$BASE_URL/actuator/health/readiness"
TRIPS_URL="$BASE_URL/api/trips"
AUTH_HEADER=()

if [[ -n "${API_BEARER_TOKEN:-}" ]]; then
  AUTH_HEADER=(-H "Authorization: Bearer ${API_BEARER_TOKEN}")
fi

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_cmd curl
require_cmd python3

check_json_status() {
  local url="$1"
  local expected="${2:-UP}"

  local body
  body=$(curl --fail --silent --show-error "${AUTH_HEADER[@]}" "$url")

  BODY="$body" URL="$url" EXPECTED="$expected" python3 - <<'PY'
import json
import os
import sys
payload = json.loads(os.environ["BODY"])
status = payload.get("status")
if status != os.environ["EXPECTED"]:
    print(
        f"Expected status '{os.environ['EXPECTED']}' from "
        f"{os.environ['URL']}, got '{status}'."
    )
    sys.exit(1)
print(f"PASS: {os.environ['URL']} -> status={status}")
PY
}

echo "Running smoke test against: $BASE_URL"

check_json_status "$HEALTH_URL" "UP"
check_json_status "$READINESS_URL" "UP"

trips_status=$(curl --silent --show-error "${AUTH_HEADER[@]}" --output /tmp/ece651_smoke_trips.out --write-out "%{http_code}" "$TRIPS_URL")
if [[ "$trips_status" != "200" ]]; then
  echo "FAIL: $TRIPS_URL returned HTTP $trips_status"
  cat /tmp/ece651_smoke_trips.out
  exit 1
fi

python3 - <<'PY'
import json
from pathlib import Path
payload = json.loads(Path('/tmp/ece651_smoke_trips.out').read_text())
if not isinstance(payload, list):
    raise SystemExit("FAIL: /api/trips did not return a JSON array")
print(f"PASS: /api/trips returned JSON array (items={len(payload)})")
PY

echo "Smoke test completed successfully."
