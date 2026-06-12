import { requireAdminPermission } from "@/lib/adminAuth";
import { assertFinancePeriodOpen, getNextFinanceNumber, insertAdminActivity, insertFinanceReceivable } from "@/lib/gsnDataStore";

const receivableStatuses = ["Draft", "Sent", "Partially Paid", "Paid", "Overdue", "Cancelled"];

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

  const invoiceDate = String(data.invoice_date || new Date().toISOString().slice(0, 10)).slice(0, 10);
  try {
    await assertFinancePeriodOpen(invoiceDate);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 423 });
  }

  const invoiceNumber = String(data.invoice_number || "").trim().slice(0, 120) || await getNextFinanceNumber("receivables", "invoice_number", "GSN-INV");

  const result = await insertFinanceReceivable({
    invoice_number: invoiceNumber,
    invoice_date: invoiceDate,
    quotation_id: data.quotation_id || null,
    quotation_number: String(data.quotation_number || "").slice(0, 120),
    buyer_name: String(data.buyer_name || "").slice(0, 160),
    commodity: String(data.commodity || "").slice(0, 160),
    amount,
    currency: ["IDR", "USD", "SGD"].includes(data.currency) ? data.currency : "IDR",
    due_date: data.due_date ? String(data.due_date).slice(0, 10) : null,
    status: receivableStatuses.includes(data.status) ? data.status : "Draft"
  });

  await insertAdminActivity({
    admin: permission.admin,
    action: "create_finance_receivable",
    label: `Created receivable ${data.currency || "IDR"} ${amount} for ${data.buyer_name || data.invoice_number || "buyer"}`,
    referenceType: "finance_receivable",
    referenceId: result?.[0]?.id || null,
    metadata: {
      after: {
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        quotation_number: data.quotation_number || "",
        buyer_name: data.buyer_name || "",
        commodity: data.commodity || "",
        amount,
        currency: data.currency || "IDR",
        due_date: data.due_date || "",
        status: data.status || "Draft"
      }
    }
  });

  return Response.json({ ok: true, result });
}
