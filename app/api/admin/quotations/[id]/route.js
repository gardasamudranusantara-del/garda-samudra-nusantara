import { deleteQuotationRequest, updateQuotationRequest } from "@/lib/gsnDataStore";
import { isAdminAuthorized } from "@/lib/adminAuth";

export async function PATCH(request, { params }) {
  if (!isAdminAuthorized(request)) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
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
  return Response.json({ ok: true, result });
}

export async function DELETE(request, { params }) {
  if (!isAdminAuthorized(request)) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const result = await deleteQuotationRequest(params.id);
  return Response.json({ ok: true, result });
}
