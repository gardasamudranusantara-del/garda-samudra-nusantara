import { requireAdminPermission } from "@/lib/adminAuth";
import { insertAdminActivity, insertFinanceTransaction } from "@/lib/gsnDataStore";

export async function POST(request) {
  const permission = await requireAdminPermission(request, "finance_access");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const data = await request.json();
  const amount = Number(data.amount || 0);

  if (!Number.isFinite(amount) || amount <= 0) {
    return Response.json({ message: "Amount must be greater than 0." }, { status: 400 });
  }

  const result = await insertFinanceTransaction({
    transaction_type: data.transaction_type === "Cash Out" ? "Cash Out" : "Cash In",
    transaction_date: String(data.transaction_date || new Date().toISOString().slice(0, 10)).slice(0, 10),
    category: String(data.category || "").slice(0, 120),
    description: String(data.description || "").slice(0, 420),
    amount,
    currency: ["IDR", "USD", "SGD"].includes(data.currency) ? data.currency : "IDR",
    payment_method: String(data.payment_method || "").slice(0, 120),
    reference_number: String(data.reference_number || "").slice(0, 120),
    created_by: permission.admin.username
  });

  await insertAdminActivity({
    admin: permission.admin,
    action: "create_finance_transaction",
    label: `Created ${data.transaction_type || "Cash In"} ${data.currency || "IDR"} ${amount}`,
    referenceType: "finance_transaction",
    referenceId: result?.[0]?.id || null,
    metadata: {
      after: {
        transaction_type: data.transaction_type || "Cash In",
        category: data.category || "",
        amount,
        currency: data.currency || "IDR"
      }
    }
  });

  return Response.json({ ok: true, result });
}
