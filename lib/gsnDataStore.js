const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseServiceKey);
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

export async function listTrackingEvents() {
  return supabaseRequest("tracking_events?select=*&order=created_at.desc&limit=160") || [];
}

export async function listAdminActivities() {
  return supabaseRequest("tracking_events?select=*&source=eq.admin&order=created_at.desc&limit=120") || [];
}

export async function listStoredAdminUsers() {
  return supabaseRequest("admin_users?select=username,role,is_active,created_at,updated_at&order=created_at.asc") || [];
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
      role: data.role === "owner" ? "owner" : "marketing",
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
