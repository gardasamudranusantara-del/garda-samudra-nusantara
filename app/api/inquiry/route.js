const resendEndpoint = "https://api.resend.com/emails";
const inquiryRecipient = "gardasamudranusantara@gmail.com";

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function line(label, value) {
  return `<tr><td style="padding:8px 12px;color:#8b93a8;">${label}</td><td style="padding:8px 12px;color:#ffffff;font-weight:700;">${escapeHtml(value || "-")}</td></tr>`;
}

function buildInquiryHtml(data) {
  const products = Array.isArray(data.selectedProducts) && data.selectedProducts.length
    ? data.selectedProducts.join(", ")
    : "-";

  return `
    <div style="font-family:Inter,Arial,sans-serif;background:#070713;color:#ffffff;padding:28px;">
      <div style="max-width:760px;margin:auto;border:1px solid rgba(137,111,255,.35);border-radius:24px;background:linear-gradient(145deg,rgba(255,255,255,.08),rgba(255,255,255,.03));overflow:hidden;">
        <div style="padding:26px 28px;border-bottom:1px solid rgba(137,111,255,.25);">
          <p style="margin:0 0 8px;color:#9fd7ff;font-size:12px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;">Global Export Network</p>
          <h1 style="margin:0;font-size:28px;">New GSN Inquiry</h1>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          ${line("Full Name", data.fullName)}
          ${line("Company", data.companyName)}
          ${line("Email", data.email)}
          ${line("WhatsApp", data.whatsapp)}
          ${line("Country", data.country)}
          ${line("City", data.city)}
          ${line("Division", data.selectedDivision)}
          ${line("Products", products)}
          ${line("Quantity", data.quantity)}
          ${line("Monthly Requirement", data.monthlyRequirement)}
          ${line("Packaging Request", data.packagingRequest)}
          ${line("Product Specification", data.productSpecification)}
          ${line("Target Price", data.targetPrice)}
          ${line("Additional Message", data.message)}
        </table>
      </div>
    </div>
  `;
}

async function sendResendEmail(payload) {
  const resendApiKey = process.env.RESEND_API_KEY?.trim();

  const response = await fetch(resendEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Resend API request failed.");
  }

  return response.json();
}

export async function POST(request) {
  try {
    const data = await request.json();

    if (!data.fullName || !data.email || !data.whatsapp || !data.country || !data.agreement) {
      return Response.json({ message: "Please complete the required inquiry fields." }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY?.trim();

    if (!resendApiKey || resendApiKey.startsWith("replace_with_")) {
      return Response.json(
        { message: "Resend API key is not configured. Please add RESEND_API_KEY to your environment." },
        { status: 503 }
      );
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || "GSN Inquiry <onboarding@resend.dev>";
    const replyTo = data.email;

    await sendResendEmail({
      from: fromEmail,
      to: inquiryRecipient,
      reply_to: replyTo,
      subject: `New GSN Inquiry from ${data.fullName}`,
      html: buildInquiryHtml(data)
    });

    await sendResendEmail({
      from: fromEmail,
      to: data.email,
      subject: "Thank you for contacting Garda Samudra Nusantara",
      html: `
        <div style="font-family:Inter,Arial,sans-serif;background:#070713;color:#ffffff;padding:28px;">
          <div style="max-width:620px;margin:auto;border:1px solid rgba(137,111,255,.35);border-radius:24px;background:linear-gradient(145deg,rgba(255,255,255,.08),rgba(255,255,255,.03));padding:28px;">
            <p style="margin:0 0 8px;color:#9fd7ff;font-size:12px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;">Garda Samudra Nusantara</p>
            <h1 style="margin:0 0 14px;font-size:26px;">Thank you for contacting Garda Samudra Nusantara.</h1>
            <p style="margin:0;color:#dce4ff;line-height:1.7;">Our team will contact you shortly regarding your inquiry.</p>
          </div>
        </div>
      `
    });

    return Response.json({ message: "Inquiry sent successfully." });
  } catch (error) {
    return Response.json({ message: error.message || "Unable to send inquiry." }, { status: 500 });
  }
}
