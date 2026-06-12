import { requireAdminPermission } from "@/lib/adminAuth";
import { assertFinancePeriodOpen, getNextFinanceNumber, insertAdminActivity, insertFinancePayable } from "@/lib/gsnDataStore";

const payableStatuses = ["Unpaid", "Partial", "Paid", "Overdue"];

export async function POST(request) {
  const permission = await requireAdminPermission(request, "finance_access");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const data = await request.json();
  const amount = Number(data.amount || 0);

  if (!data.supplier_name && !data.invoice_number) {
    return Response.json({ message: "Supplier name or invoice number is required." }, { status: 400 });
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return Response.json({ message: "Payable amount must be greater than 0." }, { status: 400 });
  }

  const payableDate = String(data.due_date || new Date().toISOString().slice(0, 10)).slice(0, 10);
  try {
    await assertFinancePeriodOpen(payableDate);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 423 });
  }

  const invoiceNumber = String(data.invoice_number || "").trim().slice(0, 120) || await getNextFinanceNumber("payables", "invoice_number", "GSN-AP");

  const result = await insertFinancePayable({
    supplier_name: String(data.supplier_name || "").slice(0, 160),
    commodity: String(data.commodity || "").slice(0, 160),
    invoice_number: invoiceNumber,
    amount,
    currency: ["IDR", "USD", "SGD"].includes(data.currency) ? data.currency : "IDR",
    due_date: data.due_date ? payableDate : null,
    status: payableStatuses.includes(data.status) ? data.status : "Unpaid"
  });

  await insertAdminActivity({
    admin: permission.admin,
    action: "create_finance_payable",
    label: `Created payable ${data.currency || "IDR"} ${amount} for ${data.supplier_name || data.invoice_number || "supplier"}`,
    referenceType: "finance_payable",
    referenceId: result?.[0]?.id || null,
    metadata: {
      after: {
        supplier_name: data.supplier_name || "",
        commodity: data.commodity || "",
        invoice_number: invoiceNumber,
        amount,
        currency: data.currency || "IDR",
        due_date: data.due_date || "",
        status: data.status || "Unpaid"
      }
    }
  });

  return Response.json({ ok: true, result });
}
