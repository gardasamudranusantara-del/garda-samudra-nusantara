function escapePdf(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapLine(line, maxLength = 92) {
  const words = String(line || "").split(/\s+/);
  const lines = [];
  let current = "";

  words.forEach((word) => {
    if (!current) {
      current = word;
      return;
    }
    if (`${current} ${word}`.length > maxLength) {
      lines.push(current);
      current = word;
      return;
    }
    current = `${current} ${word}`;
  });

  if (current) {
    lines.push(current);
  }

  return lines.length ? lines : [""];
}

function textToPdfCommands(text) {
  const sourceLines = String(text || "GSN Quotation").split(/\r?\n/);
  const lines = sourceLines.flatMap((line) => wrapLine(line));
  const commands = ["BT", "/F1 11 Tf", "50 790 Td", "14 TL"];

  lines.slice(0, 52).forEach((line, index) => {
    if (index > 0) {
      commands.push("T*");
    }
    commands.push(`(${escapePdf(line)}) Tj`);
  });

  commands.push("ET");
  return commands.join("\n");
}

export function createSimplePdfBuffer(title, text) {
  const content = textToPdfCommands(`${title}\n\n${text}`);
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefStart = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
}

function line(label, value) {
  return `${label}: ${value || "-"}`;
}

export function createQuotationPdfBuffer(document) {
  const title = document.document_title || "GSN Quotation Request Summary";
  const today = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "Asia/Jakarta"
  }).format(new Date());

  const content = [
    "GARDA SAMUDRA NUSANTARA",
    "Trading, distribution, and development of Indonesian commodities",
    "Quality | Reliability | Consistency",
    "Email: gardasamudranusantara@gmail.com | Website: www.gardasamudranusantara.com",
    "",
    title.toUpperCase(),
    line("Generated", today),
    line("Document Status", document.status || "Generated"),
    "",
    "BUYER INFORMATION",
    line("Buyer Name", document.buyer_name),
    line("Company", document.company_name),
    "",
    "REQUEST SUMMARY",
    document.document_text || "Quotation details are stored in the GSN Admin Dashboard.",
    "",
    "COMMERCIAL NOTES",
    "- Final quotation depends on confirmed specification, quantity, destination, packaging, and logistics terms.",
    "- Product availability, MOQ, sample availability, and export documents may vary by product category.",
    "- Indicative pricing is subject to supplier confirmation, currency changes, and shipping requirements.",
    "",
    "NEXT STEP",
    "GSN team should confirm buyer requirements, prepare supplier validation, and send an official quotation after internal review.",
    "",
    "AUTHORIZED BY",
    "Garda Samudra Nusantara",
    "Export & Business Development Team"
  ].join("\n");

  return createSimplePdfBuffer(title, content);
}
