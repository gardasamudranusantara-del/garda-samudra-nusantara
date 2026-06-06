import { requireAdminPermission } from "@/lib/adminAuth";
import { insertAdminActivity, insertFinanceReceivable } from "@/lib/gsnDataStore";

const receivableStatuses = ["Pending", "Partial Payment", "Paid", "Overdue"];

export async function POST(request) {
  const permission = await requireAdminPermission(request, "finance_access");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const data = await request.json();
  const amount = Number(data.amount || 0);

  if (!data.buyer_name && !data.invoice_number) {
    return Response.json({ message: "Buyer name or invoice number is required." }, { status: 400 });
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return Response.json({ message: "Receivable amount must be greater than 0." }, { status: 400 });
  }

  const result = await insertFinanceReceivable({
    invoice_number: String(data.invoice_number || "").slice(0, 120),
    buyer_name: String(data.buyer_name || "").slice(0, 160),
    commodity: String(data.commodity || "").slice(0, 160),
    amount,
    currency: ["IDR", "USD", "SGD"].includes(data.currency) ? data.currency : "IDR",
    due_date: data.due_date ? String(data.due_date).slice(0, 10) : null,
    status: receivableStatuses.includes(data.status) ? data.status : "Pending"
  });

  await insertAdminActivity({
    admin: permission.admin,
    action: "create_finance_receivable",
    label: `Created receivable ${data.currency || "IDR"} ${amount} for ${data.buyer_name || data.invoice_number || "buyer"}`,
    referenceType: "finance_receivable",
    referenceId: result?.[0]?.id || null,
    metadata: {
      after: {
        invoice_number: data.invoice_number || "",
        buyer_name: data.buyer_name || "",
        commodity: data.commodity || "",
        amount,
        currency: data.currency || "IDR",
        due_date: data.due_date || "",
        status: data.status || "Pending"
      }
    }
  });

  return Response.json({ ok: true, result });
}
