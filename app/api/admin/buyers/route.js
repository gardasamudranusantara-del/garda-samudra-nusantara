import { requireAdminPermission } from "@/lib/adminAuth";
import { insertAdminActivity, insertBuyerProfile } from "@/lib/gsnDataStore";

function cleanList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

export async function POST(request) {
  const permission = await requireAdminPermission(request, "edit_leads");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const data = await request.json();
  if (!data.buyer_name && !data.company_name) {
    return Response.json({ message: "Buyer name or company name is required." }, { status: 400 });
  }

  const payload = {
    buyer_name: String(data.buyer_name || "").slice(0, 160),
    company_name: String(data.company_name || "").slice(0, 180),
    email: String(data.email || "").slice(0, 180),
    whatsapp: String(data.whatsapp || "").slice(0, 80),
    country: String(data.country || "").slice(0, 120),
    city: String(data.city || "").slice(0, 120),
    preferred_division: String(data.preferred_division || "").slice(0, 120),
    products: cleanList(data.products),
    buyer_stage: String(data.buyer_stage || "New").slice(0, 80),
    relationship_status: String(data.relationship_status || "Prospect").slice(0, 80),
    source: String(data.source || "admin").slice(0, 80),
    assigned_to: String(data.assigned_to || "").slice(0, 80),
    last_inquiry_at: data.last_inquiry_at || null,
    last_quotation_at: data.last_quotation_at || null,
    total_inquiries: Number(data.total_inquiries || 0),
    total_quotations: Number(data.total_quotations || 0),
    notes: String(data.notes || "").slice(0, 1200)
  };

  const result = await insertBuyerProfile(payload);
  await insertAdminActivity({
    admin: permission.admin,
    action: "create_buyer_profile",
    label: `Created buyer profile ${payload.company_name || payload.buyer_name}`,
    referenceType: "buyer_profile",
    referenceId: result?.[0]?.id || null,
    metadata: { after: payload }
  });

  return Response.json({ ok: true, result });
}
