import { insertAdminActivity, insertQuotationDocument } from "@/lib/gsnDataStore";
import { requireAdminPermission } from "@/lib/adminAuth";

export async function POST(request) {
  const permission = await requireAdminPermission(request, "edit_quotations");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const data = await request.json();

  if (!data.document_html && !data.document_text) {
    return Response.json({ message: "Quotation document content is required." }, { status: 400 });
  }

  const result = await insertQuotationDocument({
    ...data,
    quotation_number: String(data.quotation_number || "").slice(0, 48),
    document_html: String(data.document_html || "").slice(0, 20000),
    document_text: String(data.document_text || "").slice(0, 12000)
  });
  await insertAdminActivity({
    admin: permission.admin,
    action: "create_quotation_document",
    label: `Saved quotation PDF record ${data.quotation_number || data.document_title || ""}`.trim(),
    referenceType: "quotation_document",
    referenceId: result?.[0]?.id || null,
    metadata: {
      quotationNumber: data.quotation_number || "",
      buyer: data.buyer_name || data.company_name || "",
      status: data.status || "Generated"
    }
  });

  return Response.json({ ok: true, result });
}
