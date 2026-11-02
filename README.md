# TalkPix API examples

Turn a photo and a script (or your own audio) into a lip-synced talking-head MP4 with one HTTP request.

This repo has small, copy-paste examples for the [TalkPix developer API](https://www.talkpix.ai/developers) in **curl**, **Node.js** and **Python**: start a render, poll until the MP4 is ready, upload a private photo, and verify signed webhooks.

- Base URL: `https://www.talkpix.ai/api/v1`
- Auth: `Authorization: Bearer tpx_live_…` (create a key on **Account → API** at [talkpix.ai](https://www.talkpix.ai))
- Pricing: 1 credit per rendered second at 720p, 2 at 1080p, from the same credits as the TalkPix studio. Credits are reserved before a render starts and refunded automatically if it fails.

## Quickstart (curl)

```bash
export TALKPIX_KEY="tpx_live_..."

curl https://www.talkpix.ai/api/v1/videos \
  -H "Authorization: Bearer $TALKPIX_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://example.com/portrait.jpg",
    "script": "Hi! This video was made with one API call.",
    "voice": "zephyr",
    "language": "en-US"
  }'
```

The response is `201 Created` with a video object whose `status` is `processing`. Poll `GET /videos/{id}` every few seconds until `status` is `completed` and `video_url` is set. A typical 10-second video takes about a minute.

## Examples

| File | What it shows |
|---|---|
| [`examples/curl/quickstart.sh`](examples/curl/quickstart.sh) | Create a video, then poll it |
| [`examples/curl/upload-private-photo.sh`](examples/curl/upload-private-photo.sh) | Upload a local photo, then render from `image_key` |
| [`examples/node/create-video.mjs`](examples/node/create-video.mjs) | Create and poll with `fetch` (Node 18+) |
| [`examples/node/verify-webhook.mjs`](examples/node/verify-webhook.mjs) | Verify the `TalkPix-Signature` header |
| [`examples/python/create_video.py`](examples/python/create_video.py) | Create and poll with `requests` |

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/videos` | Start a talking-photo render |
| `GET` | `/videos/:id` | Retrieve one render (status, `video_url`) |
| `GET` | `/videos` | List renders started with your keys |
| `POST` | `/estimate` | Credits a script will reserve (free) |
| `POST` | `/uploads` | Direct-upload URL for a private photo or audio file |
| `GET` | `/voices` | Voices, languages and direction presets |
| `GET` | `/me` | Account behind the key and its credit balance |

## Two input modes

- **Script mode:** send `script`, `voice` and `language`. 30 voices across 10 languages (`en-US`, `en-GB`, `es`, `fr`, `de`, `it`, `pt-BR`, `ja`, `ko`, `hi`).
- **Audio mode:** send `audio_url` (or `audio_key` from `/uploads`) and the person lip-syncs to your file.

Optional fields: `resolution` (`720p` default, or `1080p`), `video_prompt`, `voice_prompt` (script mode), `captions` (script mode), `webhook_url`, `metadata`.

## Webhooks

Pass `webhook_url` and TalkPix POSTs one event (`video.completed` or `video.failed`). Each delivery has a `TalkPix-Signature: t=<unix seconds>,v1=<hex>` header, where `v1` is HMAC-SHA256 of `` `${t}.${rawBody}` `` with your key's webhook secret. Verify it before trusting the payload. Polling stays the source of truth if a delivery is missed. See [`examples/node/verify-webhook.mjs`](examples/node/verify-webhook.mjs).

## Limits

- 120 requests per minute per key
- 20 renders in progress per account
- Up to 300 seconds at 720p, 120 seconds at 1080p
- Photos up to 10 MB, audio up to 25 MB
- Finished MP4s are hosted for 30 days; copy them to your own storage if you need them longer

Never put an API key in a browser or mobile app. Call the API from your server.

## Links

- Full reference: https://www.talkpix.ai/developers
- Pricing: https://www.talkpix.ai/pricing
- Tutorial: [Turn a photo and a script into a lip-synced MP4 with one API call](https://talkpixai.hashnode.dev/turn-a-photo-and-a-script-into-a-lip-synced-mp4-with-one-api-call)
- Support: support@talkpix.ai

## License

The example code in this repository is MIT licensed. Use of the TalkPix API is subject to the [TalkPix terms](https://www.talkpix.ai/terms).
