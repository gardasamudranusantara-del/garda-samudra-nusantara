import { deleteInquiry, updateInquiry } from "@/lib/gsnDataStore";
import { isAdminAuthorized } from "@/lib/adminAuth";

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
  "internal_notes"
];

export async function PATCH(request, { params }) {
  if (!isAdminAuthorized(request)) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
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

  const result = await updateInquiry(params.id, updates);
  return Response.json({ ok: true, result });
}

export async function DELETE(request, { params }) {
  if (!isAdminAuthorized(request)) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const result = await deleteInquiry(params.id);
  return Response.json({ ok: true, result });
}
