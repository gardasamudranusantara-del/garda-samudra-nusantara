import { requireAdminPermission } from "@/lib/adminAuth";
import { insertAdminActivity, insertFinanceRevenue } from "@/lib/gsnDataStore";

export async function POST(request) {
  const permission = await requireAdminPermission(request, "finance_access");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const data = await request.json();
  const quantity = Number(data.quantity || 0);
  const unitPrice = Number(data.unit_price || 0);
  const totalRevenue = Number(data.total_revenue || quantity * unitPrice || 0);

  if (!data.buyer_name && !data.invoice_number) {
    return Response.json({ message: "Buyer name or invoice number is required." }, { status: 400 });
  }

  if (!Number.isFinite(totalRevenue) || totalRevenue <= 0) {
    return Response.json({ message: "Total revenue must be greater than 0." }, { status: 400 });
  }

  const result = await insertFinanceRevenue({
    invoice_number: String(data.invoice_number || "").slice(0, 120),
    buyer_name: String(data.buyer_name || "").slice(0, 160),
    country: String(data.country || "").slice(0, 120),
    division: String(data.division || "").slice(0, 80),
    category: String(data.category || "").slice(0, 120),
    product: String(data.product || "").slice(0, 160),
    quantity: Number.isFinite(quantity) ? quantity : 0,
    unit: String(data.unit || "").slice(0, 40),
    unit_price: Number.isFinite(unitPrice) ? unitPrice : 0,
    currency: ["IDR", "USD", "SGD"].includes(data.currency) ? data.currency : "IDR",
    total_revenue: totalRevenue,
    transaction_date: String(data.transaction_date || new Date().toISOString().slice(0, 10)).slice(0, 10),
    status: String(data.status || "Recorded").slice(0, 80)
  });

  await insertAdminActivity({
    admin: permission.admin,
    action: "create_finance_revenue",
    label: `Recorded revenue ${data.currency || "IDR"} ${totalRevenue} for ${data.buyer_name || data.invoice_number || "buyer"}`,
    referenceType: "finance_revenue",
    referenceId: result?.[0]?.id || null,
    metadata: {
      after: {
        invoice_number: data.invoice_number || "",
        buyer_name: data.buyer_name || "",
        division: data.division || "",
        product: data.product || "",
        total_revenue: totalRevenue,
        currency: data.currency || "IDR"
      }
    }
  });

  return Response.json({ ok: true, result });
}
