#!/bin/bash
set -euo pipefail

# Daily flow:
# Power BI -> Power Automate -> OneDrive -> Mac LaunchAgent -> repo JSON
# -> dashboard generator -> bundle -> GitHub -> Vercel.
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${PATH:-}"

SOURCE="${PORTAL_EXPORT_SOURCE:-/Users/jimday/Library/CloudStorage/OneDrive-pacificartisanlabs.com/Report Data/MASTER/portal_export.json}"
REPO="${PORTAL_REPO:-/Users/jimday/Documents/GitHub/artisan-site}"
DEST_REL="private-site/portal/portal_export.json"
BUNDLE_REL="lib/portal/generated/dashboardV1Bundle.json"
DEST="$REPO/$DEST_REL"
TEMP_DEST=""
TEMP_INDEX=""

cleanup() {
  if [ -n "$TEMP_DEST" ] && [ -f "$TEMP_DEST" ]; then
    rm -f "$TEMP_DEST"
  fi
  if [ -n "$TEMP_INDEX" ] && [ -f "$TEMP_INDEX" ]; then
    rm -f "$TEMP_INDEX"
  fi
}
trap cleanup EXIT

if [ ! -f "$SOURCE" ]; then
  echo "Source file not found: $SOURCE"
  exit 1
fi

if [ "$(git -C "$REPO" branch --show-current)" != "main" ]; then
  echo "Portal refresh must run from the main branch."
  exit 1
fi

mkdir -p "$(dirname "$DEST")"
TEMP_DEST="$(mktemp "${DEST}.tmp.XXXXXX")"
cp "$SOURCE" "$TEMP_DEST"
node -e 'JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8"))' "$TEMP_DEST"
mv "$TEMP_DEST" "$DEST"
TEMP_DEST=""

cd "$REPO"
npm run portal:generate-dashboard-v1:launch-safe
npm run portal:bundle-dashboard-v1

TEMP_INDEX="$(mktemp "$REPO/.git/portal-index.XXXXXX")"
rm -f "$TEMP_INDEX"
GIT_INDEX_FILE="$TEMP_INDEX" git read-tree HEAD
GIT_INDEX_FILE="$TEMP_INDEX" git add -- "$DEST_REL" "$BUNDLE_REL"
GIT_INDEX_FILE="$TEMP_INDEX" git commit -m "Daily portal data refresh"

# Keep the normal index aligned with the new commit without disturbing
# unrelated staged files.
git add -- "$DEST_REL" "$BUNDLE_REL"
git push origin main
