import { requireAdminPermission } from "@/lib/adminAuth";
import { insertAdminActivity, insertInquiry } from "@/lib/gsnDataStore";

function scoreAdminProspect(data) {
  let score = 20;
  const reasons = ["created by admin"];

  if (data.country) {
    score += 15;
    reasons.push("country provided");
  }
  if (data.whatsapp) {
    score += 15;
    reasons.push("WhatsApp provided");
  }
  if (data.selectedProducts?.length) {
    score += 20;
    reasons.push("product interest provided");
  }

  return {
    priority: score >= 60 ? "Medium" : "Low",
    score,
    reasons: reasons.join(", ")
  };
}

export async function POST(request) {
  const permission = await requireAdminPermission(request, "edit_leads");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const data = await request.json();
  const fullName = String(data.fullName || data.companyName || "").slice(0, 160);

  if (!fullName) {
    return Response.json({ message: "Prospect name or company is required." }, { status: 400 });
  }

  const payload = {
    fullName,
    companyName: String(data.companyName || "").slice(0, 160),
    email: String(data.email || "").slice(0, 180),
    whatsapp: String(data.whatsapp || "").slice(0, 80),
    country: String(data.country || "").slice(0, 120),
    city: String(data.city || "").slice(0, 120),
    selectedDivision: String(data.selectedDivision || "").slice(0, 120),
    selectedProducts: Array.isArray(data.selectedProducts) ? data.selectedProducts.slice(0, 8) : [],
    quantity: String(data.quantity || "").slice(0, 120),
    monthlyRequirement: String(data.monthlyRequirement || "").slice(0, 120),
    packagingRequest: String(data.packagingRequest || "").slice(0, 180),
    productSpecification: String(data.productSpecification || "").slice(0, 240),
    targetPrice: String(data.targetPrice || "").slice(0, 120),
    message: String(data.message || "").slice(0, 500),
    source: String(data.source || "admin").slice(0, 80)
  };

  const result = await insertInquiry(payload, scoreAdminProspect(payload));

  await insertAdminActivity({
    admin: permission.admin,
    action: "create_admin_prospect",
    label: `Created prospect ${payload.companyName || payload.fullName}`,
    referenceType: "inquiry",
    referenceId: result?.[0]?.id || null,
    metadata: { after: payload }
  });

  return Response.json({ ok: true, result });
}
