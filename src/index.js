import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// This token must match what we put in Render later
const VERIFY_TOKEN = process.env.WA_VERIFY_TOKEN;

// --------------------
// Webhook verification (Meta calls this once)
// --------------------
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// --------------------
// Receive WhatsApp messages here
// --------------------
app.post("/webhook", async (req, res) => {
  // WhatsApp needs fast response
  res.sendStatus(200);

  try {
    const msg =
      req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!msg) return;

    const from = msg.from; // phone number
    const text = msg?.text?.body;

    if (!text) return;

    await sendText(
      from,
      `🌞 Apna Solar Bot\n\nYou said: "${text}"\n\nReply with:\n1️⃣ Quote\n2️⃣ Subsidy\n3️⃣ Site Visit`
    );
  } catch (err) {
    console.error("Webhook error:", err.message);
  }
});

// --------------------
// Send WhatsApp text message
// --------------------
async function sendText(to, body) {
  const url = `https://graph.facebook.com/v20.0/${process.env.WA_PHONE_NUMBER_ID}/messages`;

  await axios.post(
    url,
    {
      messaging_product: "whatsapp",
      to,
      text: { body }
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.WA_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );
}

// --------------------
// Health check
// --------------------
app.get("/", (req, res) => {
  res.send("Apna Solar WhatsApp Bot is running ✅");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
