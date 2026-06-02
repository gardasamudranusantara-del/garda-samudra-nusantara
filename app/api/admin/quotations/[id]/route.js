import { deleteQuotationRequest, insertAdminActivity, updateQuotationRequest } from "@/lib/gsnDataStore";
import { requireAdminPermission } from "@/lib/adminAuth";

export async function PATCH(request, { params }) {
  const permission = requireAdminPermission(request, "edit_quotations");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const data = await request.json();
  const updates = {};

  ["quantity", "incoterm", "unit_price", "validity", "status"].forEach((key) => {
    if (typeof data[key] === "string") {
      updates[key] = data[key].slice(0, 160);
    }
  });
  ["request_summary", "product_details", "internal_notes"].forEach((key) => {
    if (typeof data[key] === "string") {
      updates[key] = data[key].slice(0, 2400);
    }
  });
  if (Array.isArray(data.products)) {
    updates.products = data.products;
  }

  const result = await updateQuotationRequest(params.id, updates);
  await insertAdminActivity({
    admin: permission.admin,
    action: "edit_quotation",
    label: `Edited quotation ${params.id}`,
    referenceType: "quotation",
    referenceId: params.id,
    metadata: { fields: Object.keys(updates) }
  });
  return Response.json({ ok: true, result });
}

export async function DELETE(request, { params }) {
  const permission = requireAdminPermission(request, "delete_quotations");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const result = await deleteQuotationRequest(params.id);
  await insertAdminActivity({
    admin: permission.admin,
    action: "delete_quotation",
    label: `Deleted quotation ${params.id}`,
    referenceType: "quotation",
    referenceId: params.id
  });
  return Response.json({ ok: true, result });
}
