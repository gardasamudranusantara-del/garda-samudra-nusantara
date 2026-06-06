import { requireAdminPermission } from "@/lib/adminAuth";
import { insertAdminActivity, insertFinanceExpense } from "@/lib/gsnDataStore";

const expenseStatuses = ["Draft", "Pending Approval", "Approved", "Rejected"];

export async function POST(request) {
  const permission = await requireAdminPermission(request, "finance_access");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const data = await request.json();
  const amount = Number(data.amount || 0);

  if (!Number.isFinite(amount) || amount <= 0) {
    return Response.json({ message: "Expense amount must be greater than 0." }, { status: 400 });
  }

  if (!data.expense_category) {
    return Response.json({ message: "Expense category is required." }, { status: 400 });
  }

  const result = await insertFinanceExpense({
    expense_date: String(data.expense_date || new Date().toISOString().slice(0, 10)).slice(0, 10),
    expense_category: String(data.expense_category || "").slice(0, 120),
    expense_subcategory: String(data.expense_subcategory || "").slice(0, 120),
    vendor: String(data.vendor || "").slice(0, 160),
    description: String(data.description || "").slice(0, 420),
    amount,
    currency: ["IDR", "USD", "SGD"].includes(data.currency) ? data.currency : "IDR",
    payment_method: String(data.payment_method || "").slice(0, 120),
    receipt_url: String(data.receipt_url || "").slice(0, 300),
    status: expenseStatuses.includes(data.status) ? data.status : "Draft",
    created_by: permission.admin.username
  });

  await insertAdminActivity({
    admin: permission.admin,
    action: "create_finance_expense",
    label: `Recorded expense ${data.currency || "IDR"} ${amount} for ${data.expense_category || "expense"}`,
    referenceType: "finance_expense",
    referenceId: result?.[0]?.id || null,
    metadata: {
      after: {
        expense_category: data.expense_category || "",
        expense_subcategory: data.expense_subcategory || "",
        vendor: data.vendor || "",
        amount,
        currency: data.currency || "IDR",
        status: data.status || "Draft"
      }
    }
  });

  return Response.json({ ok: true, result });
}
