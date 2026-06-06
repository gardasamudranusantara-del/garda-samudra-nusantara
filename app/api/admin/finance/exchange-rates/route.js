import { requireAdminPermission } from "@/lib/adminAuth";
import { insertAdminActivity, insertExchangeRate } from "@/lib/gsnDataStore";

export async function POST(request) {
  const permission = await requireAdminPermission(request, "finance_access");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const data = await request.json();
  const result = await insertExchangeRate({
    rate_date: String(data.rate_date || new Date().toISOString().slice(0, 10)).slice(0, 10),
    base_currency: String(data.base_currency || "IDR").slice(0, 8),
    target_currency: String(data.target_currency || "USD").slice(0, 8),
    rate: data.rate,
    source: String(data.source || "").slice(0, 120),
    notes: String(data.notes || "").slice(0, 1200),
    created_by: permission.admin.username
  });

  await insertAdminActivity({
    admin: permission.admin,
    action: "upsert_exchange_rate",
    label: `Saved exchange rate ${data.base_currency || "IDR"} to ${data.target_currency || "USD"}`,
    referenceType: "exchange_rate",
    referenceId: result?.[0]?.id || null,
    metadata: { after: data }
  });

  return Response.json({ ok: true, result });
}
