import { requireAdminPermission } from "@/lib/adminAuth";
import { assertFinancePeriodOpen, getFinanceRecord, insertAdminActivity, insertPaymentMatch, updateFinanceRecord } from "@/lib/gsnDataStore";

export async function POST(request) {
  const permission = await requireAdminPermission(request, "finance_access");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const data = await request.json();
  const paymentDate = String(data.payment_date || new Date().toISOString().slice(0, 10)).slice(0, 10);
  try {
    await assertFinancePeriodOpen(paymentDate);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 423 });
  }

  const result = await insertPaymentMatch({
    payment_date: paymentDate,
    invoice_number: String(data.invoice_number || "").slice(0, 160),
    buyer_name: String(data.buyer_name || "").slice(0, 160),
    receivable_id: data.receivable_id || null,
    cash_transaction_id: data.cash_transaction_id || null,
    amount: data.amount,
    currency: String(data.currency || "IDR").slice(0, 8),
    payment_method: String(data.payment_method || "").slice(0, 80),
    proof_url: String(data.proof_url || "").slice(0, 500),
    status: String(data.status || "Matched").slice(0, 40),
    notes: String(data.notes || "").slice(0, 1200),
    created_by: permission.admin.username
  });

  if (data.receivable_id) {
    const receivable = await getFinanceRecord("receivables", data.receivable_id);
    const amount = Number(data.amount || 0);
    const receivableAmount = Number(receivable?.amount || 0);
    const paidAmount = Number(receivable?.paid_amount || 0) + amount;
    await updateFinanceRecord("receivables", data.receivable_id, {
      paid_amount: paidAmount,
      status: paidAmount >= receivableAmount ? "Paid" : "Partially Paid"
    });
  }

  await insertAdminActivity({
    admin: permission.admin,
    action: "match_buyer_payment",
    label: `Matched buyer payment ${data.invoice_number || ""}`,
    referenceType: "payment_match",
    referenceId: result?.[0]?.id || null,
    metadata: { after: data }
  });

  return Response.json({ ok: true, result });
}
