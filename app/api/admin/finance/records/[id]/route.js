import { requireAdminPermission } from "@/lib/adminAuth";
import { deleteFinanceRecord, getFinanceRecord, insertAdminActivity, updateFinanceRecord } from "@/lib/gsnDataStore";

const financeRecordFields = {
  finance_transactions: {
    text: ["transaction_type", "transaction_date", "category", "description", "currency", "payment_method", "reference_number"],
    number: ["amount"]
  },
  bank_accounts: {
    text: ["account_name", "bank_name", "account_number", "currency", "status"],
    number: ["current_balance"]
  },
  petty_cash: {
    text: ["cash_date", "description", "currency", "responsible_person", "status"],
    number: ["amount"]
  },
  revenues: {
    text: ["invoice_number", "buyer_name", "country", "division", "category", "product", "unit", "currency", "transaction_date", "status"],
    number: ["quantity", "unit_price", "total_revenue"]
  },
  expenses: {
    text: ["expense_date", "expense_category", "expense_subcategory", "vendor", "description", "currency", "payment_method", "receipt_url", "status"],
    number: ["amount"]
  },
  receivables: {
    text: ["invoice_number", "buyer_name", "commodity", "currency", "due_date", "status"],
    number: ["amount"]
  },
  payables: {
    text: ["supplier_name", "commodity", "invoice_number", "currency", "due_date", "status"],
    number: ["amount"]
  },
  budgets: {
    text: ["budget_category", "currency"],
    number: ["fiscal_year", "planned_budget", "actual_spending", "remaining_budget"]
  },
  financial_reports: {
    text: ["report_type", "title", "date_from", "date_to", "generated_by"],
    json: ["filters", "report_data"]
  }
};

function cleanFinanceUpdates(table, data) {
  const config = financeRecordFields[table];
  if (!config) {
    return null;
  }

  const updates = {};
  (config.text || []).forEach((field) => {
    if (typeof data[field] === "string") {
      updates[field] = data[field].slice(0, field === "description" ? 2400 : 240);
    }
  });
  (config.number || []).forEach((field) => {
    if (typeof data[field] !== "undefined") {
      const value = Number(data[field] || 0);
      updates[field] = Number.isFinite(value) ? value : 0;
    }
  });
  (config.json || []).forEach((field) => {
    if (typeof data[field] === "object" && data[field] !== null) {
      updates[field] = data[field];
    }
  });

  if (table === "budgets" && (typeof updates.planned_budget !== "undefined" || typeof updates.actual_spending !== "undefined")) {
    const planned = Number(updates.planned_budget ?? data.planned_budget ?? 0);
    const actual = Number(updates.actual_spending ?? data.actual_spending ?? 0);
    updates.remaining_budget = planned - actual;
  }

  return updates;
}

export async function PATCH(request, { params }) {
  const permission = await requireAdminPermission(request, "finance_access");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const data = await request.json();
  const table = String(data.table || "");
  const updates = cleanFinanceUpdates(table, data.updates || {});

  if (!updates || !Object.keys(updates).length) {
    return Response.json({ message: "No valid finance updates provided." }, { status: 400 });
  }

  const before = await getFinanceRecord(table, params.id);
  const result = await updateFinanceRecord(table, params.id, updates);
  await insertAdminActivity({
    admin: permission.admin,
    action: "edit_finance_record",
    label: `Edited ${table} ${params.id}`,
    referenceType: table,
    referenceId: params.id,
    metadata: {
      fields: Object.keys(updates),
      before: Object.fromEntries(Object.keys(updates).map((field) => [field, before?.[field] ?? null])),
      after: updates
    }
  });

  return Response.json({ ok: true, result });
}

export async function DELETE(request, { params }) {
  const permission = await requireAdminPermission(request, "finance_access");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const table = new URL(request.url).searchParams.get("table") || "";
  if (!financeRecordFields[table]) {
    return Response.json({ message: "Unsupported finance table." }, { status: 400 });
  }

  const before = await getFinanceRecord(table, params.id);
  const result = await deleteFinanceRecord(table, params.id);
  await insertAdminActivity({
    admin: permission.admin,
    action: "delete_finance_record",
    label: `Deleted ${table} ${params.id}`,
    referenceType: table,
    referenceId: params.id,
    metadata: { before }
  });

  return Response.json({ ok: true, result });
}
