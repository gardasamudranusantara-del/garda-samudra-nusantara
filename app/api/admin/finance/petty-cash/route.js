import { requireAdminPermission } from "@/lib/adminAuth";
import { insertAdminActivity, insertPettyCash } from "@/lib/gsnDataStore";

export async function POST(request) {
  const permission = await requireAdminPermission(request, "finance_access");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const data = await request.json();
  const result = await insertPettyCash({
    cash_date: String(data.cash_date || new Date().toISOString().slice(0, 10)).slice(0, 10),
    description: String(data.description || "").slice(0, 1200),
    amount: data.amount,
    currency: String(data.currency || "IDR").slice(0, 8),
    responsible_person: String(data.responsible_person || permission.admin.username).slice(0, 120),
    status: String(data.status || "Recorded").slice(0, 40)
  });

  await insertAdminActivity({
    admin: permission.admin,
    action: "create_petty_cash",
    label: `Created petty cash record ${data.description || ""}`,
    referenceType: "petty_cash",
    referenceId: result?.[0]?.id || null,
    metadata: {
      after: {
        cash_date: data.cash_date || "",
        description: data.description || "",
        amount: data.amount || 0,
        currency: data.currency || "IDR",
        responsible_person: data.responsible_person || permission.admin.username
      }
    }
  });

  return Response.json({ ok: true, result });
}
