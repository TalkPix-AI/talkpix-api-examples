// Create a talking-photo video and poll until the MP4 is ready (Node 18+).
// Usage: TALKPIX_KEY=tpx_live_... node create-video.mjs https://example.com/portrait.jpg

const API = "https://www.talkpix.ai/api/v1";
const key = process.env.TALKPIX_KEY;
if (!key) throw new Error("Set TALKPIX_KEY to your tpx_live_ key");

const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

async function call(path, init = {}) {
  const res = await fetch(`${API}${path}`, { ...init, headers });
  const body = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${body.error?.type}: ${body.error?.message}`);
  return body;
}

const video = await call("/videos", {
  method: "POST",
  body: JSON.stringify({
    image_url: process.argv[2] ?? "https://example.com/portrait.jpg",
    script: "Hi! This video was made with one API call.",
    voice: "zephyr",
    language: "en-US",
    metadata: { order_id: "demo-1" },
  }),
});
console.log(`Started ${video.id}, reserved ${video.credits_reserved} credits`);

let current = video;
while (current.status !== "completed" && current.status !== "failed") {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  current = await call(`/videos/${video.id}`);
  console.log(`status: ${current.status}`);
}

if (current.status === "failed") {
  console.error(current.error);
  process.exit(1);
}
console.log(`Done: ${current.video_url} (${current.duration_seconds}s, ${current.credits_charged} credits)`);
