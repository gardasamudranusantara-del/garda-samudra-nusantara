import { requireAdminPermission } from "@/lib/adminAuth";
import { assertFinancePeriodOpen, getFinanceRecord, insertAdminActivity, insertSupplierPayment, updateFinanceRecord } from "@/lib/gsnDataStore";

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

  const result = await insertSupplierPayment({
    payment_date: paymentDate,
    supplier_name: String(data.supplier_name || "").slice(0, 160),
    supplier_account: String(data.supplier_account || "").slice(0, 240),
    payable_id: data.payable_id || null,
    invoice_number: String(data.invoice_number || "").slice(0, 160),
    amount: data.amount,
    currency: String(data.currency || "IDR").slice(0, 8),
    payment_method: String(data.payment_method || "").slice(0, 80),
    proof_url: String(data.proof_url || "").slice(0, 500),
    status: String(data.status || "Scheduled").slice(0, 40),
    notes: String(data.notes || "").slice(0, 1200),
    created_by: permission.admin.username
  });

  if (data.payable_id && ["Paid", "Completed"].includes(data.status)) {
    const payable = await getFinanceRecord("payables", data.payable_id);
    const amount = Number(data.amount || 0);
    const payableAmount = Number(payable?.amount || 0);
    await updateFinanceRecord("payables", data.payable_id, {
      status: amount >= payableAmount ? "Paid" : "Partial"
    });
  }

  await insertAdminActivity({
    admin: permission.admin,
    action: "record_supplier_payment",
    label: `Recorded supplier payment ${data.invoice_number || ""}`,
    referenceType: "supplier_payment",
    referenceId: result?.[0]?.id || null,
    metadata: { after: data }
  });

  return Response.json({ ok: true, result });
}
