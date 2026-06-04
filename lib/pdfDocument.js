import { readFileSync } from "node:fs";
import { join } from "node:path";
import { deflateSync, inflateSync } from "node:zlib";

const pageWidth = 595;
const pageHeight = 842;

const colors = {
  ink: [0.08, 0.09, 0.16],
  muted: [0.39, 0.41, 0.5],
  light: [0.96, 0.95, 1],
  line: [0.82, 0.83, 0.9],
  purple: [0.28, 0.2, 0.63],
  violet: [0.53, 0.35, 0.95],
  dark: [0.05, 0.05, 0.11],
  white: [1, 1, 1]
};

function escapePdf(value) {
  return String(value || "")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function colorCommand(color, mode = "rg") {
  return `${color.map((value) => value.toFixed(3)).join(" ")} ${mode}`;
}

function rect(x, y, width, height, color, strokeColor = null) {
  const commands = ["q", colorCommand(color), `${x} ${y} ${width} ${height} re f`];
  if (strokeColor) {
    commands.push(colorCommand(strokeColor, "RG"), `${x} ${y} ${width} ${height} re S`);
  }
  commands.push("Q");
  return commands.join("\n");
}

function image(name, x, y, width, height) {
  return ["q", `${width} 0 0 ${height} ${x} ${y} cm`, `/${name} Do`, "Q"].join("\n");
}

function line(x1, y1, x2, y2, color = colors.line, width = 1) {
  return ["q", colorCommand(color, "RG"), `${width} w`, `${x1} ${y1} m`, `${x2} ${y2} l S`, "Q"].join("\n");
}

function paethPredictor(left, up, upLeft) {
  const p = left + up - upLeft;
  const pa = Math.abs(p - left);
  const pb = Math.abs(p - up);
  const pc = Math.abs(p - upLeft);
  if (pa <= pb && pa <= pc) return left;
  if (pb <= pc) return up;
  return upLeft;
}

function decodePng(buffer) {
  if (!buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return null;
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idat = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    }
    if (type === "IDAT") {
      idat.push(data);
    }
    if (type === "IEND") {
      break;
    }
  }

  if (!width || !height || bitDepth !== 8 || ![2, 6].includes(colorType)) {
    return null;
  }

  const channels = colorType === 6 ? 4 : 3;
  const bytesPerPixel = channels;
  const scanlineLength = width * channels;
  const inflated = inflateSync(Buffer.concat(idat));
  const raw = Buffer.alloc(height * scanlineLength);
  let sourceOffset = 0;

  for (let y = 0; y < height; y += 1) {
    const filter = inflated[sourceOffset];
    sourceOffset += 1;
    const rowOffset = y * scanlineLength;
    const previousRowOffset = rowOffset - scanlineLength;

    for (let x = 0; x < scanlineLength; x += 1) {
      const value = inflated[sourceOffset + x];
      const left = x >= bytesPerPixel ? raw[rowOffset + x - bytesPerPixel] : 0;
      const up = y > 0 ? raw[previousRowOffset + x] : 0;
      const upLeft = y > 0 && x >= bytesPerPixel ? raw[previousRowOffset + x - bytesPerPixel] : 0;
      let decoded = value;

      if (filter === 1) decoded = value + left;
      if (filter === 2) decoded = value + up;
      if (filter === 3) decoded = value + Math.floor((left + up) / 2);
      if (filter === 4) decoded = value + paethPredictor(left, up, upLeft);

      raw[rowOffset + x] = decoded & 255;
    }
    sourceOffset += scanlineLength;
  }

  const rgb = Buffer.alloc(width * height * 3);
  for (let index = 0, target = 0; index < raw.length; index += channels, target += 3) {
    const alpha = channels === 4 ? raw[index + 3] / 255 : 1;
    rgb[target] = Math.round(raw[index] * alpha + 255 * (1 - alpha));
    rgb[target + 1] = Math.round(raw[index + 1] * alpha + 255 * (1 - alpha));
    rgb[target + 2] = Math.round(raw[index + 2] * alpha + 255 * (1 - alpha));
  }

  return {
    width,
    height,
    data: deflateSync(rgb)
  };
}

function loadLogoImage() {
  try {
    return decodePng(readFileSync(join(process.cwd(), "public", "logos", "gsn-clear-logo.png")));
  } catch {
    return null;
  }
}

function circle(cx, cy, r, color, strokeColor = null) {
  const c = r * 0.5522847498;
  const commands = [
    "q",
    colorCommand(color),
    `${cx + r} ${cy} m`,
    `${cx + r} ${cy + c} ${cx + c} ${cy + r} ${cx} ${cy + r} c`,
    `${cx - c} ${cy + r} ${cx - r} ${cy + c} ${cx - r} ${cy} c`,
    `${cx - r} ${cy - c} ${cx - c} ${cy - r} ${cx} ${cy - r} c`,
    `${cx + c} ${cy - r} ${cx + r} ${cy - c} ${cx + r} ${cy} c`,
    "f"
  ];
  if (strokeColor) {
    commands.push(colorCommand(strokeColor, "RG"));
    commands.push(`${cx + r} ${cy} m`);
    commands.push(`${cx + r} ${cy + c} ${cx + c} ${cy + r} ${cx} ${cy + r} c`);
    commands.push(`${cx - c} ${cy + r} ${cx - r} ${cy + c} ${cx - r} ${cy} c`);
    commands.push(`${cx - r} ${cy - c} ${cx - c} ${cy - r} ${cx} ${cy - r} c`);
    commands.push(`${cx + c} ${cy - r} ${cx + r} ${cy - c} ${cx + r} ${cy} c`);
    commands.push("S");
  }
  commands.push("Q");
  return commands.join("\n");
}

function text(value, x, y, options = {}) {
  const size = options.size || 10;
  const font = options.bold ? "F2" : "F1";
  const color = options.color || colors.ink;
  return [
    "BT",
    colorCommand(color),
    `/${font} ${size} Tf`,
    `${x} ${y} Td`,
    `(${escapePdf(value)}) Tj`,
    "ET"
  ].join("\n");
}

function wrapWords(value, maxChars = 58) {
  const words = String(value || "-").replace(/\s+/g, " ").trim().split(" ");
  const lines = [];
  let current = "";

  words.forEach((word) => {
    if (!current) {
      current = word;
      return;
    }
    if (`${current} ${word}`.length > maxChars) {
      lines.push(current);
      current = word;
      return;
    }
    current = `${current} ${word}`;
  });

  if (current) {
    lines.push(current);
  }

  return lines.length ? lines : ["-"];
}

function textBlock(value, x, y, options = {}) {
  const size = options.size || 9;
  const leading = options.leading || size + 4;
  const lines = wrapWords(value, options.maxChars || 58).slice(0, options.maxLines || 4);
  return lines.map((item, index) => text(item, x, y - index * leading, { ...options, size })).join("\n");
}

function field(label, value, x, y, width = 31) {
  return [
    text(label.toUpperCase(), x, y, { size: 7, bold: true, color: colors.violet }),
    textBlock(value || "-", x, y - 13, { size: 9, maxChars: width, maxLines: 3, color: colors.ink })
  ].join("\n");
}

function findLine(source, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return String(source || "").match(new RegExp(`^${escaped}:\\s*(.+)$`, "im"))?.[1]?.trim() || "";
}

function parseQuotation(document) {
  const raw = document.document_text || "";
  const title = document.document_title || "GSN Quotation";
  const quoteNumber = document.quotation_number || findLine(raw, "Quotation Number") || title.match(/GSN-QTN-\d{4}-\d{4}/)?.[0] || "GSN-QTN-DRAFT";
  const products = (findLine(raw, "Products") || "Product Requirement")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);

  const itemLines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^-\s*\d+\./.test(line))
    .map((line) => {
      const cleaned = line.replace(/^-\s*\d+\.\s*/, "");
      const parts = cleaned.split("|").map((part) => part.trim());
      return {
        product: parts[0] || "Product Requirement",
        quantity: parts.find((part) => /^Qty:/i.test(part))?.replace(/^Qty:\s*/i, "") || "",
        unitPrice: parts.find((part) => /^Unit Price:/i.test(part))?.replace(/^Unit Price:\s*/i, "") || "",
        notes: parts.find((part) => /^Notes:/i.test(part))?.replace(/^Notes:\s*/i, "") || ""
      };
    })
    .slice(0, 4);

  return {
    quoteNumber,
    buyer: findLine(raw, "Buyer") || document.buyer_name || "-",
    company: document.company_name || findLine(raw, "Company") || "-",
    country: findLine(raw, "Country") || "-",
    products: products.length ? products : ["Product Requirement"],
    items: itemLines.length ? itemLines : products.map((product) => ({
      product,
      quantity: findLine(raw, "Quantity") || "-",
      unitPrice: findLine(raw, "Indicative Price") || "-",
      notes: ""
    })),
    quantity: findLine(raw, "Quantity") || "-",
    incoterm: findLine(raw, "Incoterm") || "-",
    unitPrice: findLine(raw, "Indicative Price") || "-",
    validity: findLine(raw, "Validity") || "7 business days",
    details: raw
      .split(/\r?\n/)
      .filter((item) => !/^(Quotation Number|Buyer|Country|Products|Quantity|Incoterm|Indicative Price|Validity|Quotation Items):/i.test(item))
      .filter((item) => !/^-\s*\d+\./.test(item.trim()))
      .join(" ")
      .trim() || "Product specification to be confirmed based on buyer requirements.",
    status: document.status || "PDF Ready"
  };
}

function buildQuotationContent(document, logoImage = null) {
  const data = parseQuotation(document);
  const generatedDate = new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta"
  }).format(new Date());
  const commands = [];

  commands.push(rect(0, 0, pageWidth, pageHeight, [0.985, 0.982, 1]));
  commands.push(rect(38, 60, 519, 720, colors.white, [0.87, 0.86, 0.94]));
  commands.push(rect(38, 740, 519, 40, colors.purple));
  commands.push(rect(38, 60, 519, 10, colors.purple));

  if (logoImage) {
    commands.push(image("Logo", 56, 680, 54, 54));
  } else {
    commands.push(circle(83, 700, 30, colors.dark, colors.violet));
    commands.push(text("GSN", 60, 694, { size: 18, bold: true, color: colors.white }));
  }
  commands.push(text("GARDA SAMUDRA", 122, 712, { size: 15, bold: true, color: colors.ink }));
  commands.push(text("NUSANTARA", 122, 696, { size: 15, bold: true, color: colors.ink }));
  commands.push(text("Quality  |  Reliability  |  Consistency", 122, 679, { size: 8, bold: true, color: colors.violet }));
  commands.push(text("Indonesian commodity sourcing and export cooperation", 122, 666, { size: 8, color: colors.muted }));

  commands.push(text("QUOTATION", 398, 711, { size: 28, bold: true, color: colors.purple }));
  commands.push(text(data.quoteNumber, 400, 688, { size: 10, bold: true, color: colors.ink }));
  commands.push(text(`Generated: ${generatedDate}`, 400, 674, { size: 8, color: colors.muted }));
  commands.push(text(`Status: ${data.status}`, 400, 661, { size: 8, color: colors.muted }));

  commands.push(line(78, 642, 517, 642, colors.line, 1));
  commands.push(field("From", "Garda Samudra Nusantara, Indonesia", 78, 620, 38));
  commands.push(field("Contact", "gardasamudranusantara@gmail.com | www.gardasamudranusantara.com", 78, 571, 48));
  commands.push(field("To", data.buyer, 345, 620, 36));
  commands.push(field("Company", data.company, 345, 571, 34));
  commands.push(field("Destination", data.country, 345, 522, 34));

  commands.push(rect(78, 464, 439, 28, colors.purple));
  commands.push(text("Items Description", 94, 473, { size: 9, bold: true, color: colors.white }));
  commands.push(text("Incoterm", 318, 473, { size: 9, bold: true, color: colors.white }));
  commands.push(text("Qty", 389, 473, { size: 9, bold: true, color: colors.white }));
  commands.push(text("Indicative Price", 431, 473, { size: 9, bold: true, color: colors.white }));

  const rowHeight = 52;
  data.items.slice(0, 4).forEach((item, index) => {
    const y = 464 - (index + 1) * rowHeight;
    if (index % 2 === 0) {
      commands.push(rect(78, y, 439, rowHeight, [0.985, 0.982, 1]));
    }
    commands.push(text(item.product, 94, y + 32, { size: 10, bold: true, color: colors.ink }));
    commands.push(textBlock(item.notes || data.details, 94, y + 18, { size: 7, maxChars: 58, maxLines: 2, color: colors.muted, leading: 9 }));
    commands.push(text(data.incoterm, 318, y + 28, { size: 9, bold: true, color: colors.ink }));
    commands.push(textBlock(item.quantity || data.quantity, 389, y + 28, { size: 8, maxChars: 11, maxLines: 2, color: colors.ink, leading: 10 }));
    commands.push(textBlock(item.unitPrice || data.unitPrice, 431, y + 28, { size: 8, maxChars: 18, maxLines: 2, bold: true, color: colors.ink, leading: 10 }));
    commands.push(line(78, y, 517, y, colors.line, 0.8));
  });

  const tableEndY = 464 - data.items.slice(0, 4).length * rowHeight;
  const noteY = Math.max(tableEndY - 34, 205);
  commands.push(text("Commercial Notes", 78, noteY, { size: 10, bold: true, color: colors.purple }));
  commands.push(textBlock("Final quotation depends on confirmed specification, product availability, MOQ, packaging, loading port, destination, and logistics terms.", 78, noteY - 16, { size: 8, maxChars: 70, maxLines: 3, color: colors.muted }));

  commands.push(rect(345, noteY - 70, 172, 58, colors.purple));
  commands.push(text("TOTAL / PRICE BASIS", 361, noteY - 35, { size: 9, bold: true, color: colors.white }));
  commands.push(text(data.unitPrice === "-" ? "To be confirmed" : data.unitPrice, 361, noteY - 53, { size: 14, bold: true, color: colors.white }));

  commands.push(line(78, 166, 517, 166, colors.line, 1));
  commands.push(text("Terms & Conditions", 78, 145, { size: 9, bold: true, color: colors.purple }));
  commands.push(textBlock(`Validity: ${data.validity}. Prices, samples, documents, and shipping schedules remain subject to supplier and logistics confirmation.`, 78, 130, { size: 7, maxChars: 54, maxLines: 4, color: colors.muted, leading: 9 }));
  commands.push(text("Payment / Export Info", 263, 145, { size: 9, bold: true, color: colors.purple }));
  commands.push(textBlock("Payment terms, invoice details, tax, and shipping documents will be confirmed after buyer approval and internal validation.", 263, 130, { size: 7, maxChars: 40, maxLines: 4, color: colors.muted, leading: 9 }));
  commands.push(text("Authorized By", 420, 145, { size: 9, bold: true, color: colors.purple }));
  commands.push(line(420, 108, 517, 108, colors.ink, 0.8));
  commands.push(text("GSN Export Team", 420, 94, { size: 8, bold: true, color: colors.ink }));

  commands.push(text("Thank you for your business collaboration.", 78, 82, { size: 10, bold: true, color: colors.purple }));
  return commands.join("\n");
}

export function createSimplePdfBuffer(title, textValue) {
  const content = [
    text(title || "GSN Document", 50, 790, { size: 16, bold: true, color: colors.purple }),
    textBlock(textValue || "", 50, 760, { size: 10, maxChars: 88, maxLines: 44, color: colors.ink, leading: 13 })
  ].join("\n");

  return createPdfBuffer(content);
}

export function createQuotationPdfBuffer(document) {
  const logoImage = loadLogoImage();
  return createPdfBuffer(buildQuotationContent(document, logoImage), logoImage);
}

function createPdfBuffer(content, logoImage = null) {
  const resources = logoImage
    ? "/Resources << /Font << /F1 4 0 R /F2 5 0 R >> /XObject << /Logo 7 0 R >> >>"
    : "/Resources << /Font << /F1 4 0 R /F2 5 0 R >> >>";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] ${resources} /Contents 6 0 R >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`
  ];

  if (logoImage) {
    objects.push(Buffer.concat([
      Buffer.from(`<< /Type /XObject /Subtype /Image /Width ${logoImage.width} /Height ${logoImage.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /Length ${logoImage.data.length} >>\nstream\n`, "utf8"),
      logoImage.data,
      Buffer.from("\nendstream", "utf8")
    ]));
  }

  let pdf = Buffer.from("%PDF-1.4\n", "utf8");
  const offsets = [0];

  objects.forEach((object, index) => {
    const objectBuffer = Buffer.isBuffer(object) ? object : Buffer.from(object, "utf8");
    offsets.push(pdf.length);
    pdf = Buffer.concat([
      pdf,
      Buffer.from(`${index + 1} 0 obj\n`, "utf8"),
      objectBuffer,
      Buffer.from("\nendobj\n", "utf8")
    ]);
  });

  const xrefStart = pdf.length;
  let trailer = `xref\n0 ${objects.length + 1}\n`;
  trailer += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    trailer += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  trailer += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return Buffer.concat([pdf, Buffer.from(trailer, "utf8")]);
}
