#!/bin/bash
set -euo pipefail

# Daily flow:
# Power BI -> Power Automate -> OneDrive -> Mac LaunchAgent -> repo JSON
# -> dashboard generator -> bundle -> GitHub -> Vercel.
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${PATH:-}"

SOURCE="${PORTAL_EXPORT_SOURCE:-/Users/jimday/Library/CloudStorage/OneDrive-pacificartisanlabs.com/Report Data/MASTER/portal_export.json}"
LOCATION_SOURCE="${PORTAL_LOCATIONS_SOURCE:-/Users/jimday/Library/CloudStorage/OneDrive-pacificartisanlabs.com/Report Data/MASTER/portal_locations.json}"
REPO="${PORTAL_REPO:-/Users/jimday/Documents/GitHub/artisan-site}"
DEST_REL="private-site/portal/portal_export.json"
LOCATION_DEST_REL="private-site/portal/portal_locations.json"
BUNDLE_REL="lib/portal/generated/dashboardV1Bundle.json"
NET_SALES_HISTORY_REL="lib/portal/generated/repNetSalesHistory.json"
DEST="$REPO/$DEST_REL"
LOCATION_DEST="$REPO/$LOCATION_DEST_REL"
TEMP_DEST=""
TEMP_LOCATION_DEST=""
TEMP_INDEX=""
LOCK_DIR="/tmp/artisan-portal-sync.lock"
SOURCE_STABLE_ATTEMPTS="${PORTAL_SOURCE_STABLE_ATTEMPTS:-3}"
SOURCE_STABLE_SLEEP_SECONDS="${PORTAL_SOURCE_STABLE_SLEEP_SECONDS:-20}"
COMMAND_RETRY_ATTEMPTS="${PORTAL_COMMAND_RETRY_ATTEMPTS:-4}"
PUSH_RETRY_ATTEMPTS="${PORTAL_PUSH_RETRY_ATTEMPTS:-6}"
RETRY_SLEEP_SECONDS="${PORTAL_RETRY_SLEEP_SECONDS:-15}"

timestamp() {
  date +"%Y-%m-%d %H:%M:%S"
}

log() {
  echo "[$(timestamp)] $*"
}

retry_command() {
  local attempts="$1"
  shift
  local try=1

  while true; do
    if "$@"; then
      return 0
    fi

    if [ "$try" -ge "$attempts" ]; then
      log "Command failed after ${attempts} attempts: $*"
      return 1
    fi

    log "Command failed (attempt ${try}/${attempts}): $*"
    sleep "$RETRY_SLEEP_SECONDS"
    try=$((try + 1))
  done
}

wait_for_stable_source() {
  local candidate="$1"
  local previous_signature=""
  local stable_count=0
  local attempt=1
  local max_attempts

  max_attempts=$((SOURCE_STABLE_ATTEMPTS + 6))

  while [ "$attempt" -le "$max_attempts" ]; do
    if [ ! -f "$candidate" ]; then
      log "Source file not found yet: $candidate"
      sleep "$SOURCE_STABLE_SLEEP_SECONDS"
      attempt=$((attempt + 1))
      continue
    fi

    local current_signature
    current_signature="$(stat -f "%z:%m" "$candidate" 2>/dev/null || true)"

    if [ -z "$current_signature" ]; then
      log "Unable to stat source file yet: $candidate"
      sleep "$SOURCE_STABLE_SLEEP_SECONDS"
      attempt=$((attempt + 1))
      continue
    fi

    if [ "$current_signature" = "$previous_signature" ]; then
      stable_count=$((stable_count + 1))
    else
      stable_count=1
      previous_signature="$current_signature"
    fi

    if [ "$stable_count" -ge "$SOURCE_STABLE_ATTEMPTS" ]; then
      log "Source file looks stable: $candidate ($current_signature)"
      return 0
    fi

    log "Waiting for source file to stabilize (${stable_count}/${SOURCE_STABLE_ATTEMPTS}): $candidate"
    sleep "$SOURCE_STABLE_SLEEP_SECONDS"
    attempt=$((attempt + 1))
  done

  log "Source file never stabilized: $candidate"
  return 1
}

cleanup() {
  if [ -n "$TEMP_DEST" ] && [ -f "$TEMP_DEST" ]; then
    rm -f "$TEMP_DEST"
  fi
  if [ -n "$TEMP_LOCATION_DEST" ] && [ -f "$TEMP_LOCATION_DEST" ]; then
    rm -f "$TEMP_LOCATION_DEST"
  fi
  if [ -n "$TEMP_INDEX" ] && [ -f "$TEMP_INDEX" ]; then
    rm -f "$TEMP_INDEX"
  fi
  if [ -d "$LOCK_DIR" ]; then
    rmdir "$LOCK_DIR" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  log "Another portal sync is already running. Exiting."
  exit 1
fi

wait_for_stable_source "$SOURCE"
wait_for_stable_source "$LOCATION_SOURCE"

if [ "$(git -C "$REPO" branch --show-current)" != "main" ]; then
  log "Portal refresh must run from the main branch."
  exit 1
fi

mkdir -p "$(dirname "$DEST")"
TEMP_DEST="$(mktemp "${DEST}.tmp.XXXXXX")"
cp "$SOURCE" "$TEMP_DEST"
node -e 'JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8"))' "$TEMP_DEST"
mv "$TEMP_DEST" "$DEST"
TEMP_DEST=""
log "Copied portal export into repo."

mkdir -p "$(dirname "$LOCATION_DEST")"
TEMP_LOCATION_DEST="$(mktemp "${LOCATION_DEST}.tmp.XXXXXX")"
cp "$LOCATION_SOURCE" "$TEMP_LOCATION_DEST"
node -e 'JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8"))' "$TEMP_LOCATION_DEST"
mv "$TEMP_LOCATION_DEST" "$LOCATION_DEST"
TEMP_LOCATION_DEST=""
log "Copied portal location export into repo."

cd "$REPO"
retry_command "$COMMAND_RETRY_ATTEMPTS" npm run portal:generate-dashboard-v1:launch-safe
retry_command "$COMMAND_RETRY_ATTEMPTS" npm run portal:bundle-dashboard-v1
retry_command "$COMMAND_RETRY_ATTEMPTS" npm run portal:generate-net-sales-history

TEMP_INDEX="$(mktemp "/tmp/artisan-portal-index.XXXXXX")"
rm -f "$TEMP_INDEX"
log "Preparing isolated Git index."
GIT_INDEX_FILE="$TEMP_INDEX" git read-tree HEAD
log "Staging portal refresh."
GIT_INDEX_FILE="$TEMP_INDEX" git add -- "$DEST_REL" "$LOCATION_DEST_REL" "$BUNDLE_REL" "$NET_SALES_HISTORY_REL"

if GIT_INDEX_FILE="$TEMP_INDEX" git diff --cached --quiet; then
  log "No portal changes detected. Skipping commit and push."
  exit 0
fi

log "Committing portal refresh from isolated index."
PORTAL_PARENT_COMMIT="$(git rev-parse HEAD)"
PORTAL_TREE="$(GIT_INDEX_FILE="$TEMP_INDEX" git write-tree)"
PORTAL_COMMIT="$(git commit-tree "$PORTAL_TREE" -p "$PORTAL_PARENT_COMMIT" -m "Daily portal data refresh")"
git update-ref refs/heads/main "$PORTAL_COMMIT" "$PORTAL_PARENT_COMMIT"

# Keep the normal index aligned with the new commit without disturbing
# unrelated staged files.
log "Aligning the working index."
git add -- "$DEST_REL" "$LOCATION_DEST_REL" "$BUNDLE_REL" "$NET_SALES_HISTORY_REL"
log "Pushing portal refresh."
retry_command "$PUSH_RETRY_ATTEMPTS" git push origin main
log "Portal sync complete."
