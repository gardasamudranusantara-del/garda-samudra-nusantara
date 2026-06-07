import { requireAdminPermission } from "@/lib/adminAuth";
import { getFinanceRecord, insertAdminActivity, updateFinanceRecord } from "@/lib/gsnDataStore";

const approvalStatuses = new Set(["Approved", "Rejected"]);

export async function POST(request, { params }) {
  const permission = await requireAdminPermission(request, "finance_manage_access");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const data = await request.json();
  const status = String(data.status || "");

  if (!approvalStatuses.has(status)) {
    return Response.json({ message: "Approval status must be Approved or Rejected." }, { status: 400 });
  }

  const before = await getFinanceRecord("expenses", params.id);
  if (!before) {
    return Response.json({ message: "Expense record was not found." }, { status: 404 });
  }

  const updates = {
    status,
    approved_by: permission.admin.username,
    approved_at: new Date().toISOString(),
    approval_note: String(data.approval_note || "").slice(0, 1200)
  };

  const result = await updateFinanceRecord("expenses", params.id, updates);

  await insertAdminActivity({
    admin: permission.admin,
    action: status === "Approved" ? "approve_finance_expense" : "reject_finance_expense",
    label: `${status} expense ${before.expense_category || params.id}`,
    referenceType: "expenses",
    referenceId: params.id,
    metadata: {
      fields: Object.keys(updates),
      before: Object.fromEntries(Object.keys(updates).map((field) => [field, before?.[field] ?? null])),
      after: updates
    }
  });

  return Response.json({ ok: true, result });
}
