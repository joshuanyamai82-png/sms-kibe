// api/send-sms.js
// Server-side only. Credentials are hardcoded below.
// Do not publish this file or put it in a public repo.

// ─── CONFIGURE HERE ──────────────────────────────────────────────
const AT_USERNAME = "Mteesms";              // sandbox = literal "sandbox"
const AT_API_KEY  = "atsk_f3b874492113243b1542deb3c8dffb3366703ee75c891cd283185b5c2e927c5da60eabe4";
const AT_SENDER_ID = "";                    // optional, leave "" if none
const SMS_API_TOKEN = "";                   // optional gate; "" disables it
const AT_API_URL =
  "https://api.africastalking.com/version1/messaging";
// ─────────────────────────────────────────────────────────────────

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Sms-Token");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  if (SMS_API_TOKEN && req.headers["x-sms-token"] !== SMS_API_TOKEN) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  const body = req.body || {};
  const to = String(body.to || "").trim();
  const message = String(body.message || "").trim();
  const senderId = String(body.senderId || "").trim();

  if (!to || !message) {
    return res
      .status(400)
      .json({ ok: false, error: "Both 'to' and 'message' are required." });
  }

  const params = new URLSearchParams({
    username: AT_USERNAME,
    to,
    message,
  });
  const from = AT_SENDER_ID || senderId;
  if (from) params.set("from", from);

  try {
    const atResponse = await fetch(AT_API_URL, {
      method: "POST",
      headers: {
        apiKey: AT_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: params.toString(),
    });

    const raw = await atResponse.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }

    return res.status(atResponse.status).json({ ok: atResponse.ok, data });
  } catch (err) {
    return res.status(502).json({
      ok: false,
      error: `Could not reach Africa's Talking: ${err.message}`,
    });
  }
};