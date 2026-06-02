const resendEndpoint = "https://api.resend.com/emails";
const defaultOwnerEmail = "gardasamudranusantara@gmail.com";

function getOwnerEmail() {
  return process.env.OWNER_NOTIFICATION_EMAIL || process.env.REPORT_RECIPIENT_EMAIL || defaultOwnerEmail;
}

function buildPlainText({ title, message, lines = [] }) {
  return [
    title,
    "",
    message,
    "",
    ...lines.filter(Boolean)
  ].filter(Boolean).join("\n");
}

async function sendOwnerEmail(payload) {
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  if (!resendApiKey) {
    return { ok: false, channel: "email", skipped: "RESEND_API_KEY missing" };
  }

  const from = process.env.RESEND_FROM_EMAIL || "GSN Notification <onboarding@resend.dev>";
  const to = getOwnerEmail();
  const text = buildPlainText(payload);
  const response = await fetch(resendEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to,
      subject: payload.title,
      text
    })
  });

  return { ok: response.ok, channel: "email", status: response.status };
}

async function sendTelegram(payload) {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) {
    return { ok: false, channel: "telegram", skipped: "Telegram env missing" };
  }

  const text = buildPlainText(payload);
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true
    })
  });

  return { ok: response.ok, channel: "telegram", status: response.status };
}

async function sendWhatsApp(payload) {
  const token = process.env.WHATSAPP_CLOUD_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const ownerNumber = process.env.WHATSAPP_OWNER_NUMBER?.trim();
  if (!token || !phoneNumberId || !ownerNumber) {
    return { ok: false, channel: "whatsapp", skipped: "WhatsApp Cloud env missing" };
  }

  const text = buildPlainText(payload);
  const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: ownerNumber,
      type: "text",
      text: { preview_url: false, body: text.slice(0, 3500) }
    })
  });

  return { ok: response.ok, channel: "whatsapp", status: response.status };
}

export async function notifyOwner(payload) {
  const title = String(payload.title || "GSN Notification").slice(0, 120);
  const message = String(payload.message || "").slice(0, 1200);
  const lines = Array.isArray(payload.lines) ? payload.lines.map((line) => String(line).slice(0, 500)) : [];
  const channels = Array.isArray(payload.channels) && payload.channels.length
    ? new Set(payload.channels)
    : new Set(["email", "telegram", "whatsapp"]);

  const normalized = { title, message, lines };
  const tasks = [
    channels.has("email") ? sendOwnerEmail(normalized) : Promise.resolve({ ok: false, channel: "email", skipped: "disabled" }),
    channels.has("telegram") ? sendTelegram(normalized) : Promise.resolve({ ok: false, channel: "telegram", skipped: "disabled" }),
    channels.has("whatsapp") ? sendWhatsApp(normalized) : Promise.resolve({ ok: false, channel: "whatsapp", skipped: "disabled" })
  ];

  const results = await Promise.allSettled(tasks);

  return results.map((result) => result.status === "fulfilled" ? result.value : { ok: false, error: result.reason?.message });
}
