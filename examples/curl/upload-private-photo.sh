#!/usr/bin/env bash
# Upload a local photo, then render from the returned image_key.
# Usage: TALKPIX_KEY=tpx_live_... ./upload-private-photo.sh portrait.png
set -euo pipefail

: "${TALKPIX_KEY:?Set TALKPIX_KEY to your tpx_live_ key}"
FILE="${1:?Pass the path to a PNG photo}"
API="https://www.talkpix.ai/api/v1"

# 1. Ask for a direct-upload URL (valid for 5 minutes).
upload=$(curl -sS "$API/uploads" \
  -H "Authorization: Bearer $TALKPIX_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "kind": "image", "content_type": "image/png" }')

key=$(echo "$upload" | sed -n 's/.*"key": *"\([^"]*\)".*/\1/p')
upload_url=$(echo "$upload" | sed -n 's/.*"upload_url": *"\([^"]*\)".*/\1/p')

# 2. PUT the bytes.
curl -sS -X PUT "$upload_url" -H "Content-Type: image/png" --data-binary @"$FILE"

# 3. Render with image_key.
curl -sS "$API/videos" \
  -H "Authorization: Bearer $TALKPIX_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"image_key\": \"$key\",
    \"script\": \"This photo never left my server until now.\",
    \"voice\": \"puck\",
    \"language\": \"en-US\"
  }"
