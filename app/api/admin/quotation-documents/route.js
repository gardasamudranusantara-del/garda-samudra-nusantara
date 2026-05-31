import { insertQuotationDocument } from "@/lib/gsnDataStore";
import { isAdminAuthorized } from "@/lib/adminAuth";

export async function POST(request) {
  if (!isAdminAuthorized(request)) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();

  if (!data.document_html && !data.document_text) {
    return Response.json({ message: "Quotation document content is required." }, { status: 400 });
  }

  const result = await insertQuotationDocument({
    ...data,
    document_html: String(data.document_html || "").slice(0, 20000),
    document_text: String(data.document_text || "").slice(0, 12000)
  });

  return Response.json({ ok: true, result });
}
