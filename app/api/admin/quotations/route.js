import { requireAdminPermission } from "@/lib/adminAuth";
import { insertAdminActivity, insertNotification, insertQuotationRequest } from "@/lib/gsnDataStore";
import { notifyOwner } from "@/lib/ownerNotifications";

export async function POST(request) {
  const permission = requireAdminPermission(request, "edit_quotations");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const data = await request.json();

  if (!data.buyer_name && !data.company_name) {
    return Response.json({ message: "Buyer or company is required." }, { status: 400 });
  }

  const result = await insertQuotationRequest({
    ...data,
    request_summary: String(data.request_summary || "").slice(0, 2400),
    product_details: String(data.product_details || "").slice(0, 2400),
    internal_notes: String(data.internal_notes || "").slice(0, 1200)
  });

  await insertNotification({
    type: "New Quotation Request",
    title: data.buyer_name || data.company_name || "Quotation Draft",
    message: `${data.quantity || "Quantity pending"} | ${data.incoterm || "Incoterm pending"}`,
    reference_type: "quotation",
    reference_id: result?.[0]?.id || null
  });
  await notifyOwner({
    title: "New GSN Quotation Draft",
    message: `${data.buyer_name || data.company_name || "Buyer"} has a quotation record in the admin dashboard.`,
    channels: ["telegram", "whatsapp"],
    lines: [
      `Products: ${Array.isArray(data.products) ? data.products.join(", ") : "-"}`,
      `Quantity: ${data.quantity || "-"}`,
      `Incoterm: ${data.incoterm || "-"}`
    ]
  });
  await insertAdminActivity({
    admin: permission.admin,
    action: "create_quotation",
    label: `Created quotation for ${data.buyer_name || data.company_name || "buyer"}`,
    referenceType: "quotation",
    referenceId: result?.[0]?.id || null
  });

  return Response.json({ ok: true, result });
}
