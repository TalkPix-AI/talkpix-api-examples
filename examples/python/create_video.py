"""Create a talking-photo video and poll until the MP4 is ready.

Usage: TALKPIX_KEY=tpx_live_... python create_video.py https://example.com/portrait.jpg
Requires: pip install requests
"""
import os
import sys
import time

import requests

API = "https://www.talkpix.ai/api/v1"
KEY = os.environ.get("TALKPIX_KEY")
if not KEY:
    sys.exit("Set TALKPIX_KEY to your tpx_live_ key")

session = requests.Session()
session.headers.update({"Authorization": f"Bearer {KEY}"})


def call(method, path, **kwargs):
    res = session.request(method, f"{API}{path}", timeout=30, **kwargs)
    body = res.json()
    if not res.ok:
        error = body.get("error", {})
        raise RuntimeError(f"{res.status_code} {error.get('type')}: {error.get('message')}")
    return body


video = call(
    "POST",
    "/videos",
    json={
        "image_url": sys.argv[1] if len(sys.argv) > 1 else "https://example.com/portrait.jpg",
        "script": "Hi! This video was made with one API call.",
        "voice": "zephyr",
        "language": "en-US",
    },
)
print(f"Started {video['id']}, reserved {video['credits_reserved']} credits")

while video["status"] not in ("completed", "failed"):
    time.sleep(5)
    video = call("GET", f"/videos/{video['id']}")
    print("status:", video["status"])

if video["status"] == "failed":
    sys.exit(f"Render failed: {video['error']}")
print(f"Done: {video['video_url']} ({video['duration_seconds']}s, {video['credits_charged']} credits)")
