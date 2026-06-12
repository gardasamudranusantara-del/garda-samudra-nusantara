import { requireAdminPermission } from "@/lib/adminAuth";
import { assertFinancePeriodOpen, deleteFinanceRecord, getFinanceRecord, insertAdminActivity, updateFinanceRecord } from "@/lib/gsnDataStore";

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
    text: ["expense_date", "expense_category", "expense_subcategory", "vendor", "description", "currency", "payment_method", "receipt_url", "status", "approved_by", "approved_at", "approval_note"],
    number: ["amount"]
  },
  receivables: {
    text: ["invoice_number", "invoice_date", "quotation_id", "quotation_number", "buyer_name", "commodity", "currency", "due_date", "status"],
    number: ["amount", "paid_amount"]
  },
  payables: {
    text: ["supplier_name", "commodity", "invoice_number", "currency", "due_date", "status"],
    number: ["amount"]
  },
  payment_matches: {
    text: ["payment_date", "invoice_number", "buyer_name", "currency", "payment_method", "proof_url", "status", "notes"],
    number: ["amount"]
  },
  supplier_payments: {
    text: ["payment_date", "supplier_name", "supplier_account", "invoice_number", "currency", "payment_method", "proof_url", "status", "notes"],
    number: ["amount"]
  },
  tax_records: {
    text: ["tax_period", "tax_type", "reference_number", "currency", "document_url", "due_date", "status", "notes"],
    number: ["taxable_amount", "tax_amount"]
  },
  exchange_rates: {
    text: ["rate_date", "base_currency", "target_currency", "source", "notes"],
    number: ["rate"]
  },
  budgets: {
    text: ["budget_category", "currency"],
    number: ["fiscal_year", "planned_budget", "actual_spending", "remaining_budget"]
  },
  financial_reports: {
    text: ["report_type", "title", "date_from", "date_to", "generated_by"],
    json: ["filters", "report_data"]
  },
  finance_period_locks: {
    text: ["period_label", "date_from", "date_to", "status", "locked_by", "lock_note", "updated_at"]
  }
};

const financeDateFields = {
  finance_transactions: "transaction_date",
  petty_cash: "cash_date",
  revenues: "transaction_date",
  expenses: "expense_date",
  receivables: "invoice_date",
  payables: "due_date",
  payment_matches: "payment_date",
  supplier_payments: "payment_date",
  tax_records: "due_date",
  exchange_rates: "rate_date",
  financial_reports: "date_from"
};

async function assertRecordPeriodOpen(table, before, updates = {}) {
  const dateField = financeDateFields[table];
  if (!dateField) {
    return;
  }

  const targetDate = updates[dateField] || before?.[dateField] || before?.created_at;
  await assertFinancePeriodOpen(targetDate);
}

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
  try {
    await assertRecordPeriodOpen(table, before, updates);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 423 });
  }

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
  try {
    await assertRecordPeriodOpen(table, before);
  } catch (error) {
    return Response.json({ message: error.message }, { status: 423 });
  }

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
