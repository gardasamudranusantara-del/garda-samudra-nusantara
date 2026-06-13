import { requireSupplierAccess } from "@/lib/adminAuth";
import { deleteSupplier, getSupplier, insertAdminActivity, updateSupplier } from "@/lib/gsnDataStore";

function cleanList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

function cleanUpdates(data = {}) {
  const updates = {};
  const textFields = [
    "supplier_name", "company_name", "contact_person", "email", "whatsapp", "country", "city",
    "capacity", "payment_terms", "lead_time", "status", "notes"
  ];
  textFields.forEach((field) => {
    if (typeof data[field] === "string") {
      updates[field] = data[field].slice(0, field === "notes" ? 1200 : 240);
    }
  });
  ["product_categories", "products"].forEach((field) => {
    if (typeof data[field] !== "undefined") {
      updates[field] = cleanList(data[field]);
    }
  });
  if (typeof data.quality_rating !== "undefined") {
    const value = Number(data.quality_rating || 0);
    updates.quality_rating = Number.isFinite(value) ? value : 0;
  }
  return updates;
}

export async function PATCH(request, { params }) {
  const permission = await requireSupplierAccess(request);
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const updates = cleanUpdates(await request.json());
  if (!Object.keys(updates).length) {
    return Response.json({ message: "No valid supplier updates provided." }, { status: 400 });
  }

  const before = await getSupplier(params.id);
  const result = await updateSupplier(params.id, updates);
  await insertAdminActivity({
    admin: permission.admin,
    action: "edit_supplier",
    label: `Edited supplier ${before?.company_name || before?.supplier_name || params.id}`,
    referenceType: "supplier",
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
  const permission = await requireSupplierAccess(request);
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const before = await getSupplier(params.id);
  const result = await deleteSupplier(params.id);
  await insertAdminActivity({
    admin: permission.admin,
    action: "delete_supplier",
    label: `Deleted supplier ${before?.company_name || before?.supplier_name || params.id}`,
    referenceType: "supplier",
    referenceId: params.id,
    metadata: { before }
  });

  return Response.json({ ok: true, result });
}
