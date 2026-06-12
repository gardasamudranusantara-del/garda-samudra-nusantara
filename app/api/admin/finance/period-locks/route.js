import { requireAdminPermission } from "@/lib/adminAuth";
import { getFinanceRecord, insertAdminActivity, insertFinancePeriodLock, updateFinanceRecord } from "@/lib/gsnDataStore";

function isDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

export async function POST(request) {
  const permission = await requireAdminPermission(request, "finance_manage_access");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const data = await request.json();
  const periodLabel = String(data.period_label || "").trim().slice(0, 80);
  const dateFrom = String(data.date_from || "").slice(0, 10);
  const dateTo = String(data.date_to || "").slice(0, 10);

  if (!periodLabel) {
    return Response.json({ message: "Period label is required." }, { status: 400 });
  }

  if (!isDate(dateFrom) || !isDate(dateTo) || dateFrom > dateTo) {
    return Response.json({ message: "Use a valid date range before locking the period." }, { status: 400 });
  }

  const result = await insertFinancePeriodLock({
    period_label: periodLabel,
    date_from: dateFrom,
    date_to: dateTo,
    status: "Locked",
    locked_by: permission.admin.username,
    lock_note: String(data.lock_note || "").slice(0, 800)
  });

  await insertAdminActivity({
    admin: permission.admin,
    action: "lock_finance_period",
    label: `Locked finance period ${periodLabel}`,
    referenceType: "finance_period_lock",
    referenceId: result?.[0]?.id || null,
    metadata: {
      after: {
        period_label: periodLabel,
        date_from: dateFrom,
        date_to: dateTo,
        status: "Locked",
        locked_by: permission.admin.username
      }
    }
  });

  return Response.json({ ok: true, result });
}

export async function PATCH(request) {
  const permission = await requireAdminPermission(request, "finance_manage_access");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const data = await request.json();
  const id = String(data.id || "");
  if (!id) {
    return Response.json({ message: "Finance period lock ID is required." }, { status: 400 });
  }

  const before = await getFinanceRecord("finance_period_locks", id);
  if (!before) {
    return Response.json({ message: "Finance period lock was not found." }, { status: 404 });
  }

  const updates = {
    status: "Reopened",
    locked_by: permission.admin.username,
    lock_note: String(data.lock_note || before.lock_note || "Reopened for official correction.").slice(0, 800),
    updated_at: new Date().toISOString()
  };
  const result = await updateFinanceRecord("finance_period_locks", id, updates);

  await insertAdminActivity({
    admin: permission.admin,
    action: "reopen_finance_period",
    label: `Reopened finance period ${before.period_label}`,
    referenceType: "finance_period_lock",
    referenceId: id,
    metadata: {
      fields: Object.keys(updates),
      before: Object.fromEntries(Object.keys(updates).map((field) => [field, before?.[field] ?? null])),
      after: updates
    }
  });

  return Response.json({ ok: true, result });
}
