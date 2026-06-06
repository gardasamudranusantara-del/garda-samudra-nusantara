import { requireAdminPermission } from "@/lib/adminAuth";
import { insertAdminActivity, insertFinancialReport } from "@/lib/gsnDataStore";

const reportTypes = ["Profit & Loss Statement", "Cash Flow Statement", "Revenue Report", "Expense Report", "Budget Report", "Financial Summary"];

export async function POST(request) {
  const permission = await requireAdminPermission(request, "finance_export");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const data = await request.json();
  const reportType = reportTypes.includes(data.report_type) ? data.report_type : "Financial Summary";
  const result = await insertFinancialReport({
    report_type: reportType,
    title: String(data.title || reportType).slice(0, 180),
    date_from: data.date_from ? String(data.date_from).slice(0, 10) : null,
    date_to: data.date_to ? String(data.date_to).slice(0, 10) : null,
    filters: data.filters || {},
    report_data: data.report_data || {},
    generated_by: permission.admin.username
  });

  await insertAdminActivity({
    admin: permission.admin,
    action: "create_financial_report",
    label: `Saved ${reportType}`,
    referenceType: "financial_report",
    referenceId: result?.[0]?.id || null,
    metadata: {
      after: {
        report_type: reportType,
        title: data.title || reportType,
        date_from: data.date_from || "",
        date_to: data.date_to || ""
      }
    }
  });

  return Response.json({ ok: true, result });
}
