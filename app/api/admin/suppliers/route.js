import { requireSupplierAccess } from "@/lib/adminAuth";
import { insertAdminActivity, insertSupplier } from "@/lib/gsnDataStore";

function cleanList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

export async function POST(request) {
  const permission = await requireSupplierAccess(request);
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const data = await request.json();
  if (!data.supplier_name && !data.company_name) {
    return Response.json({ message: "Supplier name or company name is required." }, { status: 400 });
  }

  const payload = {
    supplier_name: String(data.supplier_name || "").slice(0, 160),
    company_name: String(data.company_name || "").slice(0, 180),
    contact_person: String(data.contact_person || "").slice(0, 160),
    email: String(data.email || "").slice(0, 180),
    whatsapp: String(data.whatsapp || "").slice(0, 80),
    country: String(data.country || "Indonesia").slice(0, 120),
    city: String(data.city || "").slice(0, 120),
    product_categories: cleanList(data.product_categories),
    products: cleanList(data.products),
    capacity: String(data.capacity || "").slice(0, 180),
    payment_terms: String(data.payment_terms || "").slice(0, 240),
    lead_time: String(data.lead_time || "").slice(0, 120),
    quality_rating: Number(data.quality_rating || 0),
    status: String(data.status || "Active").slice(0, 80),
    notes: String(data.notes || "").slice(0, 1200)
  };

  const result = await insertSupplier(payload);
  await insertAdminActivity({
    admin: permission.admin,
    action: "create_supplier",
    label: `Created supplier ${payload.company_name || payload.supplier_name}`,
    referenceType: "supplier",
    referenceId: result?.[0]?.id || null,
    metadata: { after: payload }
  });

  return Response.json({ ok: true, result });
}
