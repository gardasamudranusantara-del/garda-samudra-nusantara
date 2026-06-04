import { requireAdminPermission } from "@/lib/adminAuth";
import { createQuotationPdfBuffer } from "@/lib/pdfDocument";
import { getQuotationDocument, insertAdminActivity } from "@/lib/gsnDataStore";

function safeFileName(value) {
  return String(value || "gsn-quotation")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80) || "gsn-quotation";
}

export async function GET(request, { params }) {
  const permission = await requireAdminPermission(request, "download_pdf");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const document = await getQuotationDocument(params.id);
  if (!document) {
    return Response.json({ message: "Quotation document not found." }, { status: 404 });
  }

  const title = document.document_title || "GSN Quotation";
  const pdf = createQuotationPdfBuffer(document);
  await insertAdminActivity({
    admin: permission.admin,
    action: "download_quotation_pdf",
    label: `Downloaded ${title}`,
    referenceType: "quotation_document",
    referenceId: params.id
  });

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeFileName(title)}.pdf"`
    }
  });
}
