import { requireAdminPermission } from "@/lib/adminAuth";
import { deleteBuyerProfile, getBuyerProfile, insertAdminActivity, updateBuyerProfile } from "@/lib/gsnDataStore";

function cleanList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

function cleanUpdates(data = {}) {
  const updates = {};
  const textFields = [
    "buyer_name", "company_name", "email", "whatsapp", "country", "city", "preferred_division",
    "buyer_stage", "relationship_status", "source", "assigned_to", "notes"
  ];
  textFields.forEach((field) => {
    if (typeof data[field] === "string") {
      updates[field] = data[field].slice(0, field === "notes" ? 1200 : 180);
    }
  });
  if (typeof data.products !== "undefined") {
    updates.products = cleanList(data.products);
  }
  ["last_inquiry_at", "last_quotation_at"].forEach((field) => {
    if (typeof data[field] !== "undefined") {
      updates[field] = data[field] || null;
    }
  });
  ["total_inquiries", "total_quotations"].forEach((field) => {
    if (typeof data[field] !== "undefined") {
      const value = Number(data[field] || 0);
      updates[field] = Number.isFinite(value) ? value : 0;
    }
  });
  return updates;
}

export async function PATCH(request, { params }) {
  const permission = await requireAdminPermission(request, "edit_leads");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const data = await request.json();
  const updates = cleanUpdates(data);
  if (!Object.keys(updates).length) {
    return Response.json({ message: "No valid buyer updates provided." }, { status: 400 });
  }

  const before = await getBuyerProfile(params.id);
  const result = await updateBuyerProfile(params.id, updates);
  await insertAdminActivity({
    admin: permission.admin,
    action: "edit_buyer_profile",
    label: `Edited buyer profile ${before?.company_name || before?.buyer_name || params.id}`,
    referenceType: "buyer_profile",
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

  const before = await getBuyerProfile(params.id);
  const result = await deleteBuyerProfile(params.id);
  await insertAdminActivity({
    admin: permission.admin,
    action: "delete_buyer_profile",
    label: `Deleted buyer profile ${before?.company_name || before?.buyer_name || params.id}`,
    referenceType: "buyer_profile",
    referenceId: params.id,
    metadata: { before }
  });

  return Response.json({ ok: true, result });
}
