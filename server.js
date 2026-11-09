// server.js — local dev only. On Vercel you don't need this file.
const path = require("path");
const express = require("express");
const sendSms = require("./api/send-sms.js");

const app = express();
app.use(express.json());

// Serve index.html explicitly.
// Do NOT use express.static(__dirname) — it would serve api/send-sms.js
// and expose the hardcoded API key.
app.get(["/", "/index.html"], (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/api/send-sms", sendSms);
app.options("/api/send-sms", sendSms);

const port = 3000;
app.listen(port, () => console.log(`Open http://localhost:${port}/`));