#!/bin/bash
set -e

SOURCE="/Users/jimday/Library/CloudStorage/OneDrive-pacificartisanlabs.com/Report Data/MASTER/portal_export.json"
DEST_DIR="/Users/jimday/Documents/GitHub/artisan-site/private-site/portal"
DEST="$DEST_DIR/portal_export.json"
REPO="/Users/jimday/Documents/GitHub/artisan-site"

mkdir -p "$DEST_DIR"

if [ ! -f "$SOURCE" ]; then
  echo "Source file not found: $SOURCE"
  exit 1
fi

cp "$SOURCE" "$DEST"

cd "$REPO"

git add private-site/portal/portal_export.json

if git diff --cached --quiet; then
  echo "No portal export changes to commit."
  exit 0
fi

git commit -m "Daily portal data refresh"
git push origin main
