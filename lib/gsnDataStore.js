const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminRoles = new Set(["ceo", "cso", "owner", "marketing"]);

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseServiceKey);
}

export function getSupabaseStorageConfig() {
  return {
    supabaseUrl,
    supabaseServiceKey
  };
}

function headers(extra = {}) {
  return {
    apikey: supabaseServiceKey,
    Authorization: `Bearer ${supabaseServiceKey}`,
    "Content-Type": "application/json",
    ...extra
  };
}

export async function supabaseRequest(path, options = {}) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: headers(options.headers)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Supabase request failed.");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function supabaseOptionalRequest(path, fallback = []) {
  try {
    return await supabaseRequest(path);
  } catch {
    return fallback;
  }
}

async function supabaseWriteWithColumnFallback(path, options, fallbackColumns = []) {
  try {
    return await supabaseRequest(path, options);
  } catch (error) {
    const message = String(error?.message || "");
    const missingColumn = fallbackColumns.find((column) => message.includes(column));

    if (!missingColumn || !options?.body) {
      throw error;
    }

    const payload = JSON.parse(options.body);
    fallbackColumns.forEach((column) => {
      delete payload[column];
    });

    return supabaseRequest(path, {
      ...options,
      body: JSON.stringify(payload)
    });
  }
}

export async function insertInquiry(data, lead) {
  const products = Array.isArray(data.selectedProducts) ? data.selectedProducts : [];

  const result = await supabaseWriteWithColumnFallback("inquiries", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      full_name: data.fullName || "",
      company_name: data.companyName || "",
      email: data.email || "",
      whatsapp: data.whatsapp || "",
      country: data.country || "",
      city: data.city || "",
      division: data.selectedDivision || "",
      products,
      quantity: data.quantity || "",
      monthly_requirement: data.monthlyRequirement || "",
      packaging_request: data.packagingRequest || "",
      product_specification: data.productSpecification || "",
      target_price: data.targetPrice || "",
      message: data.message || "",
      lead_priority: lead.priority,
      lead_score: lead.score,
      lead_reason: lead.reasons,
      status: "New",
      source: data.source || "inquiry_form",
      assigned_to: data.assignedTo || "",
      follow_up_deadline: data.followUpDeadline || null
    })
  }, ["assigned_to", "follow_up_deadline"]);

  try {
    await insertNotification({
      type: data.source === "nusabot" ? "New NusaBot Lead" : "New Buyer Inquiry",
      title: data.fullName || data.companyName || "New GSN Inquiry",
      message: `${lead.priority} priority lead${data.country ? ` from ${data.country}` : ""}`,
      reference_type: "inquiry",
      reference_id: result?.[0]?.id || null
    });
  } catch {
    // Notification storage should not block buyer inquiry delivery.
  }

  return result;
}

export async function insertTrackingEvent(data) {
  return supabaseRequest("tracking_events", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      event: String(data.event || "unknown").slice(0, 80),
      label: String(data.label || "").slice(0, 160),
      path: String(data.path || "").slice(0, 240),
      source: String(data.source || "website").slice(0, 80),
      metadata: data.metadata || {}
    })
  });
}

export async function listInquiries() {
  return supabaseRequest("inquiries?select=*&order=created_at.desc&limit=100") || [];
}

export async function getInquiry(id) {
  const result = await supabaseRequest(`inquiries?select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
  return result?.[0] || null;
}

export async function listOpenInquiries() {
  return supabaseRequest("inquiries?select=*&status=not.in.(Converted,Closed)&order=created_at.asc&limit=200") || [];
}

export async function listInvestorInquiries() {
  return supabaseRequest("investor_inquiries?select=*&order=created_at.desc&limit=100") || [];
}

export async function getInvestorInquiry(id) {
  const result = await supabaseRequest(`investor_inquiries?select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
  return result?.[0] || null;
}

export async function listQuotationRequests() {
  return supabaseRequest("quotation_requests?select=*&order=created_at.desc&limit=100") || [];
}

export async function getQuotationRequest(id) {
  const result = await supabaseRequest(`quotation_requests?select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
  return result?.[0] || null;
}

export async function listQuotationDocuments() {
  return supabaseRequest("quotation_documents?select=*&order=created_at.desc&limit=100") || [];
}

export async function getQuotationDocument(id) {
  const result = await supabaseRequest(`quotation_documents?select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
  return result?.[0] || null;
}

export async function listNotifications() {
  return supabaseRequest("admin_notifications?select=*&order=created_at.desc&limit=80") || [];
}

export async function getAdminSettings() {
  const result = await supabaseRequest("admin_settings?select=*&id=eq.gsn-default&limit=1");
  return result?.[0] || null;
}

export async function getDefaultAdminSettings() {
  return {
    id: "gsn-default",
    company_name: "Garda Samudra Nusantara",
    contact_email: "gardasamudranusantara@gmail.com",
    whatsapp_number: "",
    website_url: "https://www.gardasamudranusantara.com",
    office_location: "Indonesia",
    notification_preferences: {
      email: true,
      telegram: false,
      whatsapp: false,
      daily_report: true,
      finance_reminder: true
    },
    analytics_settings: {
      track_cta_clicks: true,
      track_nusabot: true,
      track_partner_clicks: true
    },
    integration_settings: {
      supabase: "connected",
      resend: "connected",
      telegram: "planned",
      whatsapp_api: "planned"
    }
  };
}

export async function getEffectiveAdminSettings() {
  const settings = await getAdminSettings();
  return settings || getDefaultAdminSettings();
}

export async function listTrackingEvents() {
  return supabaseRequest("tracking_events?select=*&order=created_at.desc&limit=160") || [];
}

export async function listAdminActivities() {
  return supabaseRequest("tracking_events?select=*&source=eq.admin&order=created_at.desc&limit=120") || [];
}

export async function listStoredAdminUsers() {
  return supabaseRequest("admin_users?select=username,role,is_active,created_at,updated_at&order=created_at.asc") || [];
}

export async function listAttendanceRecords() {
  return supabaseOptionalRequest("attendance_records?select=*&order=attendance_date.desc,created_at.desc&limit=160", []);
}

export async function getAttendanceRecord(id) {
  const result = await supabaseRequest(`attendance_records?select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
  return result?.[0] || null;
}

export async function upsertAttendanceRecord(data) {
  return supabaseRequest("attendance_records", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      attendance_date: data.attendance_date || new Date().toISOString().slice(0, 10),
      username: String(data.username || "").trim(),
      role: String(data.role || "").trim(),
      status: data.status || "Present",
      check_in_at: data.check_in_at || null,
      check_out_at: data.check_out_at || null,
      work_mode: data.work_mode || "Office",
      location: data.location || "",
      notes: data.notes || "",
      updated_at: new Date().toISOString()
    })
  });
}

export async function updateAttendanceRecord(id, updates) {
  return supabaseRequest(`attendance_records?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      ...updates,
      updated_at: new Date().toISOString()
    })
  });
}

export async function deleteAttendanceRecord(id) {
  return supabaseRequest(`attendance_records?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Prefer: "return=representation" }
  });
}

export async function getStoredAdminUser(username) {
  if (!username) {
    return null;
  }

  const result = await supabaseRequest(`admin_users?select=*&username=eq.${encodeURIComponent(username)}&is_active=eq.true&limit=1`);
  return result?.[0] || null;
}

export async function getStoredAdminUserForAudit(username) {
  if (!username) {
    return null;
  }

  const result = await supabaseRequest(`admin_users?select=username,role,is_active,created_at,updated_at&username=eq.${encodeURIComponent(username)}&limit=1`);
  return result?.[0] || null;
}

export async function upsertStoredAdminUser(data) {
  return supabaseRequest("admin_users", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      username: String(data.username || "").trim(),
      password: String(data.password || "").trim(),
      role: adminRoles.has(data.role) ? data.role : "marketing",
      is_active: data.is_active !== false,
      updated_at: new Date().toISOString()
    })
  });
}

export async function updateStoredAdminUser(username, updates) {
  return supabaseRequest(`admin_users?username=eq.${encodeURIComponent(username)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      ...updates,
      updated_at: new Date().toISOString()
    })
  });
}

export async function deleteStoredAdminUser(username) {
  return supabaseRequest(`admin_users?username=eq.${encodeURIComponent(username)}`, {
    method: "DELETE",
    headers: { Prefer: "return=representation" }
  });
}

export async function insertAdminActivity({ admin, action, label, referenceType, referenceId, metadata = {} }) {
  return insertTrackingEvent({
    event: "admin_activity",
    label: String(label || action || "Admin activity").slice(0, 160),
    path: referenceType || "admin",
    source: "admin",
    metadata: {
      action,
      referenceType,
      referenceId,
      admin: admin?.username || "unknown",
      role: admin?.role || "unknown",
      ...metadata
    }
  });
}

export async function listFinanceSnapshot() {
  const [
    transactions,
    bankAccounts,
    pettyCash,
    revenues,
    expenses,
    receivables,
    payables,
    paymentMatches,
    supplierPayments,
    taxRecords,
    exchangeRates,
    budgets,
    financialReports,
    financePermissions,
    financeAccessLogs,
    investorReports,
    financePeriodLocks
  ] = await Promise.all([
    supabaseOptionalRequest("finance_transactions?select=*&order=transaction_date.desc&limit=120"),
    supabaseOptionalRequest("bank_accounts?select=*&order=created_at.desc&limit=60"),
    supabaseOptionalRequest("petty_cash?select=*&order=cash_date.desc&limit=120"),
    supabaseOptionalRequest("revenues?select=*&order=transaction_date.desc&limit=120"),
    supabaseOptionalRequest("expenses?select=*&order=expense_date.desc&limit=120"),
    supabaseOptionalRequest("receivables?select=*&order=due_date.asc&limit=120"),
    supabaseOptionalRequest("payables?select=*&order=due_date.asc&limit=120"),
    supabaseOptionalRequest("payment_matches?select=*&order=payment_date.desc&limit=120"),
    supabaseOptionalRequest("supplier_payments?select=*&order=payment_date.desc&limit=120"),
    supabaseOptionalRequest("tax_records?select=*&order=created_at.desc&limit=120"),
    supabaseOptionalRequest("exchange_rates?select=*&order=rate_date.desc&limit=120"),
    supabaseOptionalRequest("budgets?select=*&order=fiscal_year.desc&limit=80"),
    supabaseOptionalRequest("financial_reports?select=*&order=created_at.desc&limit=80"),
    supabaseOptionalRequest("finance_permissions?select=*&order=created_at.desc&limit=160"),
    supabaseOptionalRequest("finance_access_logs?select=*&order=created_at.desc&limit=120"),
    supabaseOptionalRequest("investor_reports?select=*&order=created_at.desc&limit=80"),
    supabaseOptionalRequest("finance_period_locks?select=*&order=date_from.desc&limit=80")
  ]);

  return {
    transactions,
    bankAccounts,
    pettyCash,
    revenues,
    expenses,
    receivables,
    payables,
    paymentMatches,
    supplierPayments,
    taxRecords,
    exchangeRates,
    budgets,
    financialReports,
    financePermissions,
    financeAccessLogs,
    investorReports,
    financePeriodLocks
  };
}

export async function getLockedFinancePeriod(dateValue) {
  if (!dateValue) {
    return null;
  }

  const date = String(dateValue).slice(0, 10);
  const result = await supabaseOptionalRequest(
    `finance_period_locks?select=*&status=eq.Locked&date_from=lte.${encodeURIComponent(date)}&date_to=gte.${encodeURIComponent(date)}&limit=1`,
    []
  );
  return result?.[0] || null;
}

export async function assertFinancePeriodOpen(dateValue) {
  const lockedPeriod = await getLockedFinancePeriod(dateValue);
  if (lockedPeriod) {
    throw new Error(`Finance period ${lockedPeriod.period_label} is locked. Unlock or use a different date before changing this record.`);
  }
}

export async function insertFinancePeriodLock(data) {
  return supabaseRequest("finance_period_locks", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      period_label: data.period_label || "",
      date_from: data.date_from,
      date_to: data.date_to,
      status: data.status || "Locked",
      locked_by: data.locked_by || "",
      lock_note: data.lock_note || "",
      updated_at: new Date().toISOString()
    })
  });
}

export async function getNextFinanceNumber(table, field, prefix) {
  const year = new Date().getFullYear();
  const pattern = `${prefix}-${year}-`;
  const rows = await supabaseOptionalRequest(`${table}?select=${field}&${field}=like.${pattern}*&limit=500`, []);
  const maxNumber = rows
    .map((item) => String(item?.[field] || "").match(new RegExp(`^${prefix}-${year}-(\\d{4})$`))?.[1])
    .filter(Boolean)
    .map((value) => Number(value))
    .reduce((max, value) => Math.max(max, value), 0);

  return `${prefix}-${year}-${String(maxNumber + 1).padStart(4, "0")}`;
}

export async function insertBankAccount(data) {
  return supabaseRequest("bank_accounts", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      account_name: data.account_name || "",
      bank_name: data.bank_name || "",
      account_number: data.account_number || "",
      currency: data.currency || "IDR",
      current_balance: Number(data.current_balance || 0),
      status: data.status || "Active"
    })
  });
}

export async function insertPettyCash(data) {
  return supabaseRequest("petty_cash", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      cash_date: data.cash_date || new Date().toISOString().slice(0, 10),
      description: data.description || "",
      amount: Number(data.amount || 0),
      currency: data.currency || "IDR",
      responsible_person: data.responsible_person || "",
      status: data.status || "Recorded"
    })
  });
}

export async function insertFinanceTransaction(data) {
  return supabaseRequest("finance_transactions", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      transaction_type: data.transaction_type || "Cash In",
      transaction_date: data.transaction_date || new Date().toISOString().slice(0, 10),
      category: data.category || "",
      description: data.description || "",
      amount: Number(data.amount || 0),
      currency: data.currency || "IDR",
      payment_method: data.payment_method || "",
      reference_number: data.reference_number || "",
      created_by: data.created_by || ""
    })
  });
}

export async function insertFinanceRevenue(data) {
  const quantity = Number(data.quantity || 0);
  const unitPrice = Number(data.unit_price || 0);
  const totalRevenue = Number(data.total_revenue || quantity * unitPrice || 0);

  return supabaseRequest("revenues", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      invoice_number: data.invoice_number || "",
      buyer_name: data.buyer_name || "",
      country: data.country || "",
      division: data.division || "",
      category: data.category || "",
      product: data.product || "",
      quantity,
      unit: data.unit || "",
      unit_price: unitPrice,
      currency: data.currency || "IDR",
      total_revenue: totalRevenue,
      transaction_date: data.transaction_date || new Date().toISOString().slice(0, 10),
      status: data.status || "Recorded"
    })
  });
}

export async function insertFinanceExpense(data) {
  return supabaseRequest("expenses", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      expense_date: data.expense_date || new Date().toISOString().slice(0, 10),
      expense_category: data.expense_category || "",
      expense_subcategory: data.expense_subcategory || "",
      vendor: data.vendor || "",
      description: data.description || "",
      amount: Number(data.amount || 0),
      currency: data.currency || "IDR",
      payment_method: data.payment_method || "",
      receipt_url: data.receipt_url || "",
      status: data.status || "Draft",
      created_by: data.created_by || ""
    })
  });
}

export async function insertFinanceReceivable(data) {
  return supabaseWriteWithColumnFallback("receivables", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      invoice_number: data.invoice_number || "",
      invoice_date: data.invoice_date || null,
      quotation_id: data.quotation_id || null,
      quotation_number: data.quotation_number || "",
      buyer_name: data.buyer_name || "",
      commodity: data.commodity || "",
      amount: Number(data.amount || 0),
      paid_amount: Number(data.paid_amount || 0),
      currency: data.currency || "IDR",
      due_date: data.due_date || null,
      status: data.status || "Draft"
    })
  }, ["invoice_date", "quotation_id", "quotation_number", "paid_amount"]);
}

export async function insertFinancePayable(data) {
  return supabaseRequest("payables", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      supplier_name: data.supplier_name || "",
      commodity: data.commodity || "",
      invoice_number: data.invoice_number || "",
      amount: Number(data.amount || 0),
      currency: data.currency || "IDR",
      due_date: data.due_date || null,
      status: data.status || "Unpaid"
    })
  });
}

export async function insertPaymentMatch(data) {
  return supabaseRequest("payment_matches", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      payment_date: data.payment_date || new Date().toISOString().slice(0, 10),
      invoice_number: data.invoice_number || "",
      buyer_name: data.buyer_name || "",
      receivable_id: data.receivable_id || null,
      cash_transaction_id: data.cash_transaction_id || null,
      amount: Number(data.amount || 0),
      currency: data.currency || "IDR",
      payment_method: data.payment_method || "",
      proof_url: data.proof_url || "",
      status: data.status || "Matched",
      notes: data.notes || "",
      created_by: data.created_by || ""
    })
  });
}

export async function insertSupplierPayment(data) {
  return supabaseRequest("supplier_payments", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      payment_date: data.payment_date || new Date().toISOString().slice(0, 10),
      supplier_name: data.supplier_name || "",
      supplier_account: data.supplier_account || "",
      payable_id: data.payable_id || null,
      invoice_number: data.invoice_number || "",
      amount: Number(data.amount || 0),
      currency: data.currency || "IDR",
      payment_method: data.payment_method || "",
      proof_url: data.proof_url || "",
      status: data.status || "Scheduled",
      notes: data.notes || "",
      created_by: data.created_by || ""
    })
  });
}

export async function insertTaxRecord(data) {
  return supabaseRequest("tax_records", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      tax_period: data.tax_period || "",
      tax_type: data.tax_type || "",
      reference_number: data.reference_number || "",
      taxable_amount: Number(data.taxable_amount || 0),
      tax_amount: Number(data.tax_amount || 0),
      currency: data.currency || "IDR",
      document_url: data.document_url || "",
      due_date: data.due_date || null,
      status: data.status || "Draft",
      notes: data.notes || "",
      created_by: data.created_by || ""
    })
  });
}

export async function insertExchangeRate(data) {
  return supabaseRequest("exchange_rates", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      rate_date: data.rate_date || new Date().toISOString().slice(0, 10),
      base_currency: data.base_currency || "IDR",
      target_currency: data.target_currency || "USD",
      rate: Number(data.rate || 1),
      source: data.source || "",
      notes: data.notes || "",
      created_by: data.created_by || ""
    })
  });
}

export async function insertFinanceBudget(data) {
  const plannedBudget = Number(data.planned_budget || 0);
  const actualSpending = Number(data.actual_spending || 0);

  return supabaseRequest("budgets", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      fiscal_year: Number(data.fiscal_year || new Date().getFullYear()),
      budget_category: data.budget_category || "",
      planned_budget: plannedBudget,
      actual_spending: actualSpending,
      remaining_budget: Number(data.remaining_budget ?? plannedBudget - actualSpending),
      currency: data.currency || "IDR"
    })
  });
}

export async function insertFinancialReport(data) {
  return supabaseRequest("financial_reports", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      report_type: data.report_type || "Financial Summary",
      title: data.title || "GSN Financial Report",
      date_from: data.date_from || null,
      date_to: data.date_to || null,
      filters: data.filters || {},
      report_data: data.report_data || {},
      generated_by: data.generated_by || ""
    })
  });
}

const financeTables = new Set([
  "finance_transactions",
  "bank_accounts",
  "petty_cash",
  "revenues",
  "expenses",
  "receivables",
  "payables",
  "payment_matches",
  "supplier_payments",
  "tax_records",
  "exchange_rates",
  "budgets",
  "financial_reports",
  "finance_period_locks"
]);

export async function getFinanceRecord(table, id) {
  if (!financeTables.has(table)) {
    throw new Error("Unsupported finance table.");
  }

  const result = await supabaseRequest(`${table}?select=*&id=eq.${encodeURIComponent(id)}&limit=1`);
  return result?.[0] || null;
}

export async function updateFinanceRecord(table, id, updates) {
  if (!financeTables.has(table)) {
    throw new Error("Unsupported finance table.");
  }

  return supabaseRequest(`${table}?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(updates)
  });
}

export async function deleteFinanceRecord(table, id) {
  if (!financeTables.has(table)) {
    throw new Error("Unsupported finance table.");
  }

  return supabaseRequest(`${table}?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Prefer: "return=representation" }
  });
}

export async function updateInquiry(id, updates) {
  return supabaseRequest(`inquiries?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(updates)
  });
}

export async function deleteInquiry(id) {
  return supabaseRequest(`inquiries?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Prefer: "return=representation" }
  });
}

export async function insertQuotationRequest(data) {
  return supabaseWriteWithColumnFallback("quotation_requests", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      quotation_number: data.quotation_number || "",
      inquiry_id: data.inquiry_id || null,
      buyer_name: data.buyer_name || "",
      company_name: data.company_name || "",
      email: data.email || "",
      whatsapp: data.whatsapp || "",
      country: data.country || "",
      products: Array.isArray(data.products) ? data.products : [],
      quantity: data.quantity || "",
      incoterm: data.incoterm || "",
      unit_price: data.unit_price || "",
      validity: data.validity || "",
      request_summary: data.request_summary || "",
      product_details: data.product_details || "",
      internal_notes: data.internal_notes || "",
      status: data.status || "Draft"
    })
  }, ["quotation_number"]);
}

export async function updateInvestorInquiry(id, updates) {
  return supabaseRequest(`investor_inquiries?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(updates)
  });
}

export async function deleteInvestorInquiry(id) {
  return supabaseRequest(`investor_inquiries?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Prefer: "return=representation" }
  });
}

export async function updateQuotationRequest(id, updates) {
  return supabaseWriteWithColumnFallback(`quotation_requests?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(updates)
  }, ["quotation_number"]);
}

export async function deleteQuotationRequest(id) {
  return supabaseRequest(`quotation_requests?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Prefer: "return=representation" }
  });
}

export async function insertQuotationDocument(data) {
  return supabaseWriteWithColumnFallback("quotation_documents", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      quotation_number: data.quotation_number || "",
      quotation_id: data.quotation_id || null,
      inquiry_id: data.inquiry_id || null,
      buyer_name: data.buyer_name || "",
      company_name: data.company_name || "",
      document_title: data.document_title || "GSN Quotation",
      document_html: data.document_html || "",
      document_text: data.document_text || "",
      status: data.status || "Generated"
    })
  }, ["quotation_number"]);
}

export async function insertNotification(data) {
  return supabaseRequest("admin_notifications", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      type: String(data.type || "Notification").slice(0, 80),
      title: String(data.title || "GSN Update").slice(0, 160),
      message: String(data.message || "").slice(0, 320),
      reference_type: String(data.reference_type || "").slice(0, 80),
      reference_id: data.reference_id || null,
      is_read: Boolean(data.is_read)
    })
  });
}

export async function updateNotification(id, updates) {
  return supabaseRequest(`admin_notifications?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(updates)
  });
}

export async function markAllNotificationsRead() {
  return supabaseRequest("admin_notifications?is_read=eq.false", {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ is_read: true })
  });
}

export async function upsertAdminSettings(data) {
  return supabaseRequest("admin_settings", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      id: "gsn-default",
      company_name: data.company_name || "Garda Samudra Nusantara",
      contact_email: data.contact_email || "",
      whatsapp_number: data.whatsapp_number || "",
      website_url: data.website_url || "",
      office_location: data.office_location || "",
      notification_preferences: data.notification_preferences || {},
      analytics_settings: data.analytics_settings || {},
      integration_settings: data.integration_settings || {},
      updated_at: new Date().toISOString()
    })
  });
}
