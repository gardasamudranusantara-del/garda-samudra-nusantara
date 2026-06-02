import { isAdminAuthorized } from "@/lib/adminAuth";
import { createQuotationPdfBuffer } from "@/lib/pdfDocument";
import { getQuotationDocument } from "@/lib/gsnDataStore";

function safeFileName(value) {
  return String(value || "gsn-quotation")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80) || "gsn-quotation";
}

export async function GET(request, { params }) {
  if (!isAdminAuthorized(request)) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const document = await getQuotationDocument(params.id);
  if (!document) {
    return Response.json({ message: "Quotation document not found." }, { status: 404 });
  }

  const title = document.document_title || "GSN Quotation";
  const pdf = createQuotationPdfBuffer(document);

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeFileName(title)}.pdf"`
    }
  });
}
