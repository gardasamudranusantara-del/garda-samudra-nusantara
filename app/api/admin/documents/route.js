import { requireAdminPermission } from "@/lib/adminAuth";
import { insertAdminActivity, insertBusinessDocument } from "@/lib/gsnDataStore";

export async function POST(request) {
  const permission = await requireAdminPermission(request, "edit_quotations");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const data = await request.json();
  if (!data.title) {
    return Response.json({ message: "Document title is required." }, { status: 400 });
  }

  const payload = {
    document_type: String(data.document_type || "General").slice(0, 120),
    title: String(data.title || "").slice(0, 220),
    related_type: String(data.related_type || "").slice(0, 120),
    related_name: String(data.related_name || "").slice(0, 180),
    file_url: String(data.file_url || "").slice(0, 600),
    status: String(data.status || "Active").slice(0, 80),
    expiry_date: data.expiry_date || null,
    owner: String(data.owner || "").slice(0, 120),
    notes: String(data.notes || "").slice(0, 1200),
    created_by: permission.admin.username
  };

  const result = await insertBusinessDocument(payload);
  await insertAdminActivity({
    admin: permission.admin,
    action: "create_business_document",
    label: `Created document ${payload.title}`,
    referenceType: "business_document",
    referenceId: result?.[0]?.id || null,
    metadata: { after: payload }
  });

  return Response.json({ ok: true, result });
}
