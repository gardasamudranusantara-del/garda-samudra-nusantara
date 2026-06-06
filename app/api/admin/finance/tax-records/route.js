import { requireAdminPermission } from "@/lib/adminAuth";
import { insertAdminActivity, insertTaxRecord } from "@/lib/gsnDataStore";

export async function POST(request) {
  const permission = await requireAdminPermission(request, "finance_access");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const data = await request.json();
  const result = await insertTaxRecord({
    tax_period: String(data.tax_period || "").slice(0, 40),
    tax_type: String(data.tax_type || "").slice(0, 120),
    reference_number: String(data.reference_number || "").slice(0, 160),
    taxable_amount: data.taxable_amount,
    tax_amount: data.tax_amount,
    currency: String(data.currency || "IDR").slice(0, 8),
    document_url: String(data.document_url || "").slice(0, 500),
    due_date: data.due_date || null,
    status: String(data.status || "Draft").slice(0, 40),
    notes: String(data.notes || "").slice(0, 1200),
    created_by: permission.admin.username
  });

  await insertAdminActivity({
    admin: permission.admin,
    action: "create_tax_record",
    label: `Created tax record ${data.tax_type || ""}`,
    referenceType: "tax_record",
    referenceId: result?.[0]?.id || null,
    metadata: { after: data }
  });

  return Response.json({ ok: true, result });
}
