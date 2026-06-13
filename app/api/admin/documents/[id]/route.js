import { requireAdminPermission } from "@/lib/adminAuth";
import { deleteBusinessDocument, getBusinessDocument, insertAdminActivity, updateBusinessDocument } from "@/lib/gsnDataStore";

function cleanUpdates(data = {}) {
  const updates = {};
  const textFields = ["document_type", "title", "related_type", "related_name", "file_url", "status", "owner", "notes"];
  textFields.forEach((field) => {
    if (typeof data[field] === "string") {
      updates[field] = data[field].slice(0, field === "notes" || field === "file_url" ? 1200 : 220);
    }
  });
  if (typeof data.expiry_date !== "undefined") {
    updates.expiry_date = data.expiry_date || null;
  }
  return updates;
}

export async function PATCH(request, { params }) {
  const permission = await requireAdminPermission(request, "edit_quotations");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const updates = cleanUpdates(await request.json());
  if (!Object.keys(updates).length) {
    return Response.json({ message: "No valid document updates provided." }, { status: 400 });
  }

  const before = await getBusinessDocument(params.id);
  const result = await updateBusinessDocument(params.id, updates);
  await insertAdminActivity({
    admin: permission.admin,
    action: "edit_business_document",
    label: `Edited document ${before?.title || params.id}`,
    referenceType: "business_document",
    referenceId: params.id,
    metadata: {
      fields: Object.keys(updates),
      before: Object.fromEntries(Object.keys(updates).map((field) => [field, before?.[field] ?? null])),
      after: updates
    }
  });

  return Response.json({ ok: true, result });
}

export async function DELETE(request, { params }) {
  const permission = await requireAdminPermission(request, "delete_quotations");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const before = await getBusinessDocument(params.id);
  const result = await deleteBusinessDocument(params.id);
  await insertAdminActivity({
    admin: permission.admin,
    action: "delete_business_document",
    label: `Deleted document ${before?.title || params.id}`,
    referenceType: "business_document",
    referenceId: params.id,
    metadata: { before }
  });

  return Response.json({ ok: true, result });
}
