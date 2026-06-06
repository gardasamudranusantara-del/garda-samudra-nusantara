import { requireAdminPermission } from "@/lib/adminAuth";
import { insertAdminActivity, insertBankAccount } from "@/lib/gsnDataStore";

export async function POST(request) {
  const permission = await requireAdminPermission(request, "finance_access");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const data = await request.json();
  const result = await insertBankAccount({
    account_name: String(data.account_name || "").slice(0, 160),
    bank_name: String(data.bank_name || "").slice(0, 120),
    account_number: String(data.account_number || "").slice(0, 80),
    currency: String(data.currency || "IDR").slice(0, 8),
    current_balance: data.current_balance,
    status: String(data.status || "Active").slice(0, 40)
  });

  await insertAdminActivity({
    admin: permission.admin,
    action: "create_bank_account",
    label: `Created bank account ${data.account_name || data.bank_name || ""}`,
    referenceType: "bank_account",
    referenceId: result?.[0]?.id || null,
    metadata: {
      after: {
        account_name: data.account_name || "",
        bank_name: data.bank_name || "",
        currency: data.currency || "IDR",
        current_balance: data.current_balance || 0
      }
    }
  });

  return Response.json({ ok: true, result });
}
