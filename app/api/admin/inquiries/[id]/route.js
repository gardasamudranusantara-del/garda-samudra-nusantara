import { deleteInquiry, getInquiry, insertAdminActivity, updateInquiry } from "@/lib/gsnDataStore";
import { requireAdminPermission } from "@/lib/adminAuth";

const textFields = [
  "full_name",
  "company_name",
  "email",
  "whatsapp",
  "country",
  "city",
  "division",
  "quantity",
  "monthly_requirement",
  "packaging_request",
  "product_specification",
  "target_price",
  "message",
  "status",
  "internal_notes",
  "assigned_to"
];

export async function PATCH(request, { params }) {
  const permission = await requireAdminPermission(request, "edit_leads");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const data = await request.json();
  const updates = {};

  textFields.forEach((field) => {
    if (typeof data[field] === "string") {
      updates[field] = data[field].slice(0, field === "message" || field === "internal_notes" ? 1400 : 300);
    }
  });
  if (Array.isArray(data.products)) {
    updates.products = data.products.map((item) => String(item).trim()).filter(Boolean).slice(0, 20);
  }
  if (typeof data.follow_up_at === "string") {
    updates.follow_up_at = data.follow_up_at || null;
  }
  if (typeof data.follow_up_deadline === "string") {
    updates.follow_up_deadline = data.follow_up_deadline || null;
  }

  const before = await getInquiry(params.id);
  const result = await updateInquiry(params.id, updates);
  await insertAdminActivity({
    admin: permission.admin,
    action: "edit_lead",
    label: `Edited buyer lead ${params.id}`,
    referenceType: "inquiry",
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
  const permission = await requireAdminPermission(request, "delete_leads");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const before = await getInquiry(params.id);
  const result = await deleteInquiry(params.id);
  await insertAdminActivity({
    admin: permission.admin,
    action: "delete_lead",
    label: `Deleted buyer lead ${params.id}`,
    referenceType: "inquiry",
    referenceId: params.id,
    metadata: { before }
  });
  return Response.json({ ok: true, result });
}
