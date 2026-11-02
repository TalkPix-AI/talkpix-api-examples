// Verify a TalkPix webhook delivery before trusting it.
// Header: TalkPix-Signature: t=<unix seconds>,v1=<hex HMAC-SHA256 of `${t}.${rawBody}`>
import { createHmac, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";

export function verifyTalkPixSignature(secret, header, rawBody, toleranceSeconds = 300) {
  const parts = Object.fromEntries(header.split(",").map((p) => p.trim().split("=")));
  const t = Number(parts.t);
  if (!Number.isFinite(t) || Math.abs(Date.now() / 1000 - t) > toleranceSeconds) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  return (
    expected.length === parts.v1?.length &&
    timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(parts.v1, "hex"))
  );
}

// Minimal receiver: TALKPIX_WEBHOOK_SECRET=... node verify-webhook.mjs
const secret = process.env.TALKPIX_WEBHOOK_SECRET;
if (secret) {
  createServer((req, res) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      const ok = verifyTalkPixSignature(secret, req.headers["talkpix-signature"] ?? "", raw);
      if (!ok) {
        res.writeHead(400).end("bad signature");
        return;
      }
      const event = JSON.parse(raw);
      console.log(event.type, event.data.id, event.data.video_url);
      res.writeHead(200).end("ok");
    });
  }).listen(3000, () => console.log("Listening on :3000"));
}
