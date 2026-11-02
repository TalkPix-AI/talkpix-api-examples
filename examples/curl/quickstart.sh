#!/usr/bin/env bash
# Create a talking-photo video, then poll until it is ready.
# Usage: TALKPIX_KEY=tpx_live_... ./quickstart.sh https://example.com/portrait.jpg
set -euo pipefail

: "${TALKPIX_KEY:?Set TALKPIX_KEY to your tpx_live_ key}"
IMAGE_URL="${1:-https://example.com/portrait.jpg}"
API="https://www.talkpix.ai/api/v1"

video=$(curl -sS "$API/videos" \
  -H "Authorization: Bearer $TALKPIX_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"image_url\": \"$IMAGE_URL\",
    \"script\": \"Hi! This video was made with one API call.\",
    \"voice\": \"zephyr\",
    \"language\": \"en-US\"
  }")

id=$(echo "$video" | sed -n 's/.*"id": *"\([^"]*\)".*/\1/p')
echo "Started video $id"

while true; do
  sleep 5
  video=$(curl -sS "$API/videos/$id" -H "Authorization: Bearer $TALKPIX_KEY")
  status=$(echo "$video" | sed -n 's/.*"status": *"\([^"]*\)".*/\1/p')
  echo "status: $status"
  case "$status" in
    completed) echo "$video"; break ;;
    failed) echo "$video" >&2; exit 1 ;;
  esac
done
