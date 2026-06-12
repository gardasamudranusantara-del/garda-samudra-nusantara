import { requireAdminPermission } from "@/lib/adminAuth";
import { assertFinancePeriodOpen, getNextFinanceNumber, getQuotationRequest, insertAdminActivity, insertFinanceReceivable, updateQuotationRequest } from "@/lib/gsnDataStore";

function cleanInvoiceNumber(value, fallback) {
  return String(value || fallback || "")
    .trim()
    .slice(0, 80);
}

export async function POST(request) {
  const permission = await requireAdminPermission(request, "finance_access");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const data = await request.json();
  const amount = Number(data.amount || 0);

  if (!data.quotation_id) {
    return Response.json({ message: "Select a quotation before creating a finance invoice." }, { status: 400 });
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return Response.json({ message: "Invoice amount must be greater than 0." }, { status: 400 });
  }

  const quotation = await getQuotationRequest(data.quotation_id);
  if (!quotation) {
    return Response.json({ message: "Quotation was not found." }, { status: 404 });
  }

  const quotationNumber = quotation.quotation_number || data.quotation_number || "";
  const fallbackInvoiceNumber = quotationNumber
    ? quotationNumber.replace("GSN-QTN", "GSN-INV")
    : await getNextFinanceNumber("receivables", "invoice_number", "GSN-INV");
  const invoiceNumber = cleanInvoiceNumber(data.invoice_number, fallbackInvoiceNumber);
  const invoiceDate = String(data.invoice_date || new Date().toISOString().slice(0, 10)).slice(0, 10);

  try {
    await assertFinancePeriodOpen(invoiceDate);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 423 });
  }

  const result = await insertFinanceReceivable({
    invoice_number: invoiceNumber,
    invoice_date: invoiceDate,
    quotation_id: quotation.id,
    quotation_number: quotationNumber,
    buyer_name: String(data.buyer_name || quotation.buyer_name || quotation.company_name || "Buyer").slice(0, 160),
    commodity: String(data.commodity || quotation.products?.join?.(", ") || quotation.product_details || "Quoted products").slice(0, 240),
    amount,
    paid_amount: 0,
    currency: ["IDR", "USD", "SGD"].includes(data.currency) ? data.currency : "IDR",
    due_date: data.due_date || null,
    status: "Sent"
  });

  await updateQuotationRequest(quotation.id, { status: "Accepted" });

  await insertAdminActivity({
    admin: permission.admin,
    action: "create_finance_invoice_from_quotation",
    label: `Created finance invoice ${invoiceNumber} from ${quotationNumber || "quotation"}`,
    referenceType: "finance_invoice",
    referenceId: result?.[0]?.id || null,
    metadata: {
      quotationNumber,
      after: {
        invoice_number: invoiceNumber,
        quotation_id: quotation.id,
        quotation_number: quotationNumber,
        amount,
        currency: data.currency || "IDR",
        status: "Sent"
      }
    }
  });

  return Response.json({ ok: true, result });
}
