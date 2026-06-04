"use client";

import { useMemo, useState } from "react";

const statuses = ["New", "Contacted", "Negotiation", "Quotation Sent", "Converted", "Closed"];
const priorities = ["All", "High", "Medium", "Low"];
const statusFilters = ["All", ...statuses];
const modules = ["Leads", "Investors", "Quotations", "Analytics", "Activity", "Settings", "Users"];
const futureIntegrations = [
  "WhatsApp API",
  "Telegram Notifications",
  "Slack Notifications",
  "Investor CRM",
  "Email Automation",
  "AI Lead Qualification",
  "Multi Admin Roles"
];

const defaultSettings = {
  company_name: "Garda Samudra Nusantara",
  contact_email: "gardasamudranusantara@gmail.com",
  whatsapp_number: "",
  website_url: "https://www.gardasamudranusantara.com",
  office_location: "Indonesia",
  notification_preferences: {
    new_inquiry: true,
    quotation_request: true,
    nusabot_lead: true,
    follow_up_warning: true
  },
  analytics_settings: {
    ga4_measurement_id: "",
    track_cta_clicks: true,
    track_nusabot: true,
    track_partner_clicks: true
  },
  integration_settings: {
    whatsapp_api: "planned",
    telegram: "planned",
    slack: "planned",
    email_automation: "planned",
    ai_lead_qualification: "planned",
    multi_admin_roles: "planned"
  }
};

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function toDateTimeLocal(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function hoursSince(value) {
  if (!value) {
    return 0;
  }

  return Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 36e5));
}

function normalizeProducts(lead) {
  if (Array.isArray(lead.products)) {
    return lead.products;
  }
  if (Array.isArray(lead.product_interest)) {
    return lead.product_interest;
  }
  if (typeof lead.product_interest === "string") {
    return lead.product_interest.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function getPriority(lead) {
  return lead.lead_priority || lead.priority || "Low";
}

function getStatus(lead) {
  return lead.status || "New";
}

function isOpenLead(lead) {
  return !["Converted", "Closed"].includes(getStatus(lead));
}

function isLeadOverdue(lead) {
  if (!isOpenLead(lead)) {
    return false;
  }

  if (lead.follow_up_deadline) {
    const deadline = new Date(lead.follow_up_deadline).getTime();
    return !Number.isNaN(deadline) && deadline < Date.now();
  }

  return hoursSince(lead.created_at) >= 24;
}

function getLeadType(lead) {
  if (lead.source === "nusabot" || lead.source === "nusabot_lead_capture") {
    return "NusaBot";
  }
  if (lead.source === "investor" || lead.division === "Partnership") {
    return "Investor";
  }
  return "Buyer";
}

function isQuotationLead(lead) {
  return /quotation|quote|price|rfq/i.test(`${lead.source || ""} ${lead.message || ""} ${lead.target_price || ""}`);
}

function buildCountMap(items, getter) {
  const map = new Map();
  items.forEach((item) => {
    const values = getter(item);
    (Array.isArray(values) ? values : [values]).filter(Boolean).forEach((value) => {
      map.set(value, (map.get(value) || 0) + 1);
    });
  });
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

function getConversionRate(leads, events) {
  if (!events.length) {
    return 0;
  }
  return Math.round((leads.length / events.length) * 100);
}

function BarList({ items, empty }) {
  const max = Math.max(1, ...items.map(([, count]) => count));

  if (!items.length) {
    return <p className="admin-empty">{empty}</p>;
  }

  return (
    <div className="admin-bar-list">
      {items.map(([name, count]) => (
        <div className="admin-bar-row" key={name}>
          <div>
            <span>{name}</span>
            <strong>{count}</strong>
          </div>
          <i style={{ width: `${Math.max(8, (count / max) * 100)}%` }} />
        </div>
      ))}
    </div>
  );
}

function exportLeadsCsv(leads) {
  const headers = ["Created At", "Name", "Company", "Email", "WhatsApp", "Country", "Products", "Quantity", "Priority", "Status", "Assigned To", "Follow-Up Deadline", "Source", "Message"];
  const rows = leads.map((lead) => [
    lead.created_at || "",
    lead.full_name || "",
    lead.company_name || "",
    lead.email || "",
    lead.whatsapp || lead.phone || "",
    lead.country || "",
    normalizeProducts(lead).join("; "),
    lead.quantity || "",
    getPriority(lead),
    getStatus(lead),
    lead.assigned_to || "",
    lead.follow_up_deadline || "",
    lead.source || "",
    lead.message || ""
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `gsn-leads-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function exportRowsCsv(filename, headers, rows) {
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function formatAuditValue(value) {
  if (value === null || typeof value === "undefined" || value === "") {
    return "-";
  }
  if (Array.isArray(value)) {
    return value.join(", ") || "-";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

function getAuditChanges(activity) {
  const before = activity.metadata?.before || {};
  const after = activity.metadata?.after || {};
  const fields = activity.metadata?.fields?.length
    ? activity.metadata.fields
    : [...new Set([...Object.keys(before), ...Object.keys(after)])];

  return fields
    .filter((field) => field !== "password")
    .map((field) => ({
      field,
      before: before[field],
      after: after[field]
    }))
    .filter((change) => typeof change.before !== "undefined" || typeof change.after !== "undefined");
}

function makeQuotationNumber(index, year = new Date().getFullYear()) {
  return `GSN-QTN-${year}-${String(index).padStart(4, "0")}`;
}

function getQuotationNumber(item = {}) {
  return item.quotation_number || `${item.request_summary || ""} ${item.document_title || ""} ${item.document_text || ""}`.match(/GSN-QTN-\d{4}-\d{4}/)?.[0] || "";
}

function getNextQuotationNumber(quotationRequests = [], quotationDocuments = []) {
  const year = new Date().getFullYear();
  const existing = [...quotationRequests, ...quotationDocuments]
    .map((item) => getQuotationNumber(item) || `${item.request_summary || ""} ${item.document_title || ""} ${item.document_text || ""}`)
    .map((text) => text.match(new RegExp(`GSN-QTN-${year}-(\\d{4})`))?.[1])
    .filter(Boolean)
    .map((value) => Number(value));
  const nextIndex = existing.length ? Math.max(...existing) + 1 : quotationRequests.length + quotationDocuments.length + 1;
  return makeQuotationNumber(nextIndex, year);
}

function buildQuotationSummary(lead, draft) {
  const items = getQuotationItems(draft, lead);
  const products = items.map((item) => item.product).filter(Boolean);
  return [
    draft.quotation_number ? `Quotation Number: ${draft.quotation_number}` : "",
    `Buyer: ${lead?.full_name || "-"}${lead?.company_name ? ` (${lead.company_name})` : ""}`,
    `Country: ${lead?.country || "-"}`,
    `Products: ${products.length ? products.join(", ") : "-"}`,
    `Quantity: ${draft.quantity || items.map((item) => item.quantity).filter(Boolean).join(", ") || lead?.quantity || "-"}`,
    `Incoterm: ${draft.incoterm || "-"}`,
    `Indicative Price: ${draft.unit_price || items.map((item) => item.unit_price).filter(Boolean).join(", ") || "-"}`,
    `Validity: ${draft.validity || "7 business days"}`,
    "Quotation Items:",
    ...items.map((item, index) => `- ${index + 1}. ${item.product || "Product Requirement"} | Qty: ${item.quantity || "-"} | Unit Price: ${item.unit_price || "-"} | Notes: ${item.notes || "-"}`),
    "",
    draft.product_details || lead?.product_specification || "Product specification to be confirmed based on buyer requirements.",
    "",
    draft.internal_notes || "Next step: confirm final specification, packaging, destination port, and payment terms."
  ].filter((line) => line !== "").join("\n");
}

function makeQuotationItemsFromLead(lead = {}) {
  const products = normalizeProducts(lead);
  return (products.length ? products : ["Product Requirement"]).slice(0, 4).map((product) => ({
    product,
    quantity: lead.quantity || "",
    unit_price: "",
    notes: lead.product_specification || ""
  }));
}

function getQuotationItems(draft = {}, lead = {}) {
  const draftItems = Array.isArray(draft.items) ? draft.items : [];
  const cleaned = draftItems
    .map((item) => ({
      product: String(item.product || "").trim(),
      quantity: String(item.quantity || "").trim(),
      unit_price: String(item.unit_price || "").trim(),
      notes: String(item.notes || "").trim()
    }))
    .filter((item) => item.product || item.quantity || item.unit_price || item.notes);

  return cleaned.length ? cleaned : makeQuotationItemsFromLead(lead);
}

function buildQuotationDocumentHtml(lead, draft) {
  const summary = buildQuotationSummary(lead, draft);

  return `
    <section style="font-family:Arial,sans-serif;color:#172033;padding:42px;">
      <p style="margin:0 0 8px;color:#315bff;font-weight:800;letter-spacing:.12em;text-transform:uppercase;">Garda Samudra Nusantara</p>
      <h1 style="margin:0 0 8px;font-size:30px;">Quotation Request Summary</h1>
      <p style="margin:0 0 24px;color:#667085;">PDF-ready document generated from GSN Admin Dashboard</p>
      <pre style="white-space:pre-wrap;border:1px solid #d0d5dd;border-radius:14px;padding:20px;line-height:1.65;">${summary.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</pre>
    </section>
  `;
}

function leadToDraft(lead = {}) {
  return {
    full_name: lead.full_name || "",
    company_name: lead.company_name || "",
    email: lead.email || "",
    whatsapp: lead.whatsapp || "",
    country: lead.country || "",
    city: lead.city || "",
    division: lead.division || "",
    products: normalizeProducts(lead).join(", "),
    quantity: lead.quantity || "",
    monthly_requirement: lead.monthly_requirement || "",
    packaging_request: lead.packaging_request || "",
    product_specification: lead.product_specification || "",
    target_price: lead.target_price || "",
    message: lead.message || "",
    status: getStatus(lead),
    internal_notes: lead.internal_notes || "",
    assigned_to: lead.assigned_to || "",
    follow_up_deadline: toDateTimeLocal(lead.follow_up_deadline)
  };
}

function investorToDraft(item = {}) {
  return {
    full_name: item.full_name || "",
    company_name: item.company_name || "",
    email: item.email || "",
    country: item.country || "",
    investment_interest: item.investment_interest || "",
    message: item.message || "",
    status: item.status || "New",
    internal_notes: item.internal_notes || ""
  };
}

function quotationToDraft(item = {}) {
  return {
    quotation_number: getQuotationNumber(item),
    buyer_name: item.buyer_name || "",
    company_name: item.company_name || "",
    email: item.email || "",
    whatsapp: item.whatsapp || "",
    country: item.country || "",
    products: Array.isArray(item.products) ? item.products.join(", ") : "",
    quantity: item.quantity || "",
    incoterm: item.incoterm || "",
    unit_price: item.unit_price || "",
    validity: item.validity || "",
    product_details: item.product_details || "",
    request_summary: item.request_summary || "",
    internal_notes: item.internal_notes || "",
    status: item.status || "Draft"
  };
}

function printQuotation(lead, draft) {
  const html = buildQuotationDocumentHtml(lead, draft);
  const popup = window.open("", "_blank", "width=900,height=1100");
  if (!popup) {
    return;
  }
  popup.document.write(`
    <html>
      <head>
        <title>GSN Quotation Summary</title>
      </head>
      <body>
        ${html}
        <script>window.print();</script>
      </body>
    </html>
  `);
  popup.document.close();
}

export default function AdminDashboard() {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [savedCredentials, setSavedCredentials] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [activeModule, setActiveModule] = useState("Leads");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState(defaultSettings);
  const [modal, setModal] = useState(null);
  const [userAccounts, setUserAccounts] = useState([]);
  const [userDraft, setUserDraft] = useState({ username: "", password: "", role: "marketing" });
  const [quotationDraft, setQuotationDraft] = useState({
    quotation_number: "",
    incoterm: "FOB",
    unit_price: "",
    validity: "7 business days",
    product_details: "",
    internal_notes: "",
    items: []
  });
  const [activityFilters, setActivityFilters] = useState({
    admin: "All",
    action: "All",
    from: "",
    to: ""
  });

  function authHeaders(activeCredentials = savedCredentials || credentials) {
    return {
      "x-admin-username": activeCredentials.username,
      "x-admin-password": activeCredentials.password
    };
  }

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setNotice("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: authHeaders(credentials)
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Invalid username or password.");
      }

      setSavedCredentials(credentials);
      setAdminProfile(result.admin || { username: credentials.username, role: "owner" });
      await loadDashboard(credentials);
      if ((result.admin?.role || "owner") === "owner") {
        await loadUsers(credentials);
      }
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadDashboard(activeCredentials = savedCredentials || credentials) {
    setLoading(true);
    setNotice("");

    try {
      const response = await fetch("/api/admin/overview", {
        headers: authHeaders(activeCredentials)
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to load admin dashboard.");
      }

      setSavedCredentials(activeCredentials);
      setData(result);
      setSelected((current) => result.inquiries?.find((lead) => lead.id === current?.id) || result.inquiries?.[0] || null);
      setSettingsDraft({ ...defaultSettings, ...(result.settings || {}) });
      if ((adminProfile?.role || result.admin?.role || activeCredentials.role) === "owner") {
        loadUsers(activeCredentials);
      }
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers(activeCredentials = savedCredentials || credentials) {
    const response = await fetch("/api/admin/users", {
      headers: authHeaders(activeCredentials)
    });

    if (response.ok) {
      const result = await response.json();
      setUserAccounts(result.accounts || []);
    }
  }

  async function saveUserAccount() {
    const method = userAccounts.some((account) => account.username === userDraft.username) ? "PATCH" : "POST";
    const response = await fetch("/api/admin/users", {
      method,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(savedCredentials)
      },
      body: JSON.stringify(userDraft)
    });
    const result = await response.json();

    if (!response.ok) {
      setNotice(result.message || "Unable to save admin user.");
      return;
    }

    setNotice(`Admin user ${userDraft.username} saved.`);
    setUserDraft({ username: "", password: "", role: "marketing" });
    await loadUsers(savedCredentials);
    await loadDashboard(savedCredentials);
  }

  async function updateUserAccount(account, updates) {
    const response = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(savedCredentials)
      },
      body: JSON.stringify({ username: account.username, ...updates })
    });
    const result = await response.json();

    if (!response.ok) {
      setNotice(result.message || "Unable to update admin user.");
      return;
    }

    setNotice(`Admin user ${account.username} updated.`);
    await loadUsers(savedCredentials);
    await loadDashboard(savedCredentials);
  }

  async function deleteUserAccount(account) {
    const response = await fetch(`/api/admin/users?username=${encodeURIComponent(account.username)}`, {
      method: "DELETE",
      headers: authHeaders(savedCredentials)
    });
    const result = await response.json();

    if (!response.ok) {
      setNotice(result.message || "Unable to delete admin user.");
      return;
    }

    setNotice(`Admin user ${account.username} deleted.`);
    await loadUsers(savedCredentials);
    await loadDashboard(savedCredentials);
  }

  async function updateLead(id, updates) {
    const response = await fetch(`/api/admin/inquiries/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(savedCredentials)
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      setNotice("Unable to update lead.");
      return;
    }

    await loadDashboard(savedCredentials);
  }

  async function deleteLead(id) {
    const response = await fetch(`/api/admin/inquiries/${id}`, {
      method: "DELETE",
      headers: authHeaders(savedCredentials)
    });

    if (!response.ok) {
      setNotice("Unable to delete lead.");
      return;
    }

    setModal(null);
    setSelected(null);
    setNotice("Buyer lead deleted.");
    await loadDashboard(savedCredentials);
  }

  function openModal(type, item) {
    const drafts = {
      lead: leadToDraft,
      investor: investorToDraft,
      quotation: quotationToDraft
    };
    setModal({
      type,
      mode: "edit",
      item,
      draft: drafts[type]?.(item) || {}
    });
  }

  function openDeleteModal(type, item) {
    setModal({ type, mode: "delete", item, draft: {} });
  }

  function updateModalField(field, value) {
    setModal((current) => ({
      ...current,
      draft: {
        ...current.draft,
        [field]: value
      }
    }));
  }

  async function saveModal() {
    if (!modal?.item) {
      return;
    }

    if (modal.type === "lead") {
      const { products, ...draft } = modal.draft;
      await updateLead(modal.item.id, {
        ...draft,
        products: products.split(",").map((item) => item.trim()).filter(Boolean)
      });
      setModal(null);
      setNotice("Buyer lead updated.");
      return;
    }

    if (modal.type === "investor") {
      await updateInvestor(modal.item.id, modal.draft);
      setModal(null);
      setNotice("Investor inquiry updated.");
      return;
    }

    if (modal.type === "quotation") {
      const { products, ...draft } = modal.draft;
      await updateQuotation(modal.item.id, {
        ...draft,
        products: products.split(",").map((item) => item.trim()).filter(Boolean)
      });
      setModal(null);
      setNotice("Quotation updated.");
    }
  }

  async function confirmDeleteModal() {
    if (!modal?.item) {
      return;
    }

    if (modal.type === "lead") {
      await deleteLead(modal.item.id);
    }
    if (modal.type === "investor") {
      await deleteInvestor(modal.item.id, true);
    }
    if (modal.type === "quotation") {
      await deleteQuotation(modal.item.id, true);
    }
    setModal(null);
  }

  async function saveQuotation() {
    if (!selected) {
      setNotice("Select a lead before creating a quotation.");
      return;
    }

    const quotationNumber = quotationDraft.quotation_number || getNextQuotationNumber(quotationRequests, quotationDocuments);
    const numberedDraft = { ...quotationDraft, quotation_number: quotationNumber };
    const quoteItems = getQuotationItems(numberedDraft, selected);
    const payload = {
      inquiry_id: selected.id,
      buyer_name: selected.full_name || "",
      company_name: selected.company_name || "",
      email: selected.email || "",
      whatsapp: selected.whatsapp || selected.phone || "",
      country: selected.country || "",
      products: quoteItems.map((item) => item.product).filter(Boolean),
      quotation_number: quotationNumber,
      quantity: numberedDraft.quantity || quoteItems.map((item) => item.quantity).filter(Boolean).join(", ") || selected.quantity || "",
      incoterm: numberedDraft.incoterm,
      unit_price: numberedDraft.unit_price || quoteItems.map((item) => item.unit_price).filter(Boolean).join(", "),
      validity: numberedDraft.validity,
      product_details: numberedDraft.product_details || selected.product_specification || "",
      internal_notes: numberedDraft.internal_notes,
      request_summary: buildQuotationSummary(selected, numberedDraft),
      status: "Draft"
    };

    const response = await fetch("/api/admin/quotations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(savedCredentials)
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
      setNotice(result.message || "Unable to save quotation.");
      return;
    }

    setNotice("Quotation draft saved.");
    await loadDashboard(savedCredentials);
  }

  async function saveQuotationDocument() {
    if (!selected) {
      setNotice("Select a lead before saving a quotation document.");
      return;
    }

    const quotationNumber = quotationDraft.quotation_number || getNextQuotationNumber(quotationRequests, quotationDocuments);
    const numberedDraft = { ...quotationDraft, quotation_number: quotationNumber };
    const summary = buildQuotationSummary(selected, numberedDraft);
    const response = await fetch("/api/admin/quotation-documents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(savedCredentials)
      },
      body: JSON.stringify({
        inquiry_id: selected.id,
        quotation_number: quotationNumber,
        buyer_name: selected.full_name || "",
        company_name: selected.company_name || "",
        document_title: `${quotationNumber} - GSN Quotation - ${selected.full_name || selected.company_name || "Buyer"}`,
        document_html: buildQuotationDocumentHtml(selected, numberedDraft),
        document_text: summary,
        status: "PDF Ready"
      })
    });

    const result = await response.json();
    if (!response.ok) {
      setNotice(result.message || "Unable to save PDF record.");
      return;
    }

    setNotice("PDF-ready quotation record saved.");
    await loadDashboard(savedCredentials);
  }

  async function downloadQuotationPdf(document) {
    const response = await fetch(`/api/admin/quotation-documents/${document.id}/download`, {
      headers: authHeaders(savedCredentials)
    });

    if (!response.ok) {
      setNotice("Unable to download PDF.");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    link.download = `${String(document.document_title || "gsn-quotation").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function updateQuotationItem(index, field, value) {
    setQuotationDraft((current) => {
      const items = getQuotationItems(current, selected).map((item) => ({ ...item }));
      items[index] = { ...items[index], [field]: value };
      return { ...current, items };
    });
  }

  function addQuotationItem() {
    setQuotationDraft((current) => ({
      ...current,
      items: [
        ...getQuotationItems(current, selected),
        { product: "", quantity: "", unit_price: "", notes: "" }
      ]
    }));
  }

  function removeQuotationItem(index) {
    setQuotationDraft((current) => {
      const items = getQuotationItems(current, selected).filter((_, itemIndex) => itemIndex !== index);
      return { ...current, items: items.length ? items : [{ product: "", quantity: "", unit_price: "", notes: "" }] };
    });
  }

  async function updateInvestor(id, updates) {
    const response = await fetch(`/api/admin/investors/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(savedCredentials)
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      setNotice("Unable to update investor inquiry.");
      return;
    }

    await loadDashboard(savedCredentials);
  }

  async function deleteInvestor(id, confirmed = false) {
    if (!confirmed) {
      openDeleteModal("investor", investorInquiries.find((item) => item.id === id));
      return;
    }

    const response = await fetch(`/api/admin/investors/${id}`, {
      method: "DELETE",
      headers: authHeaders(savedCredentials)
    });

    if (!response.ok) {
      setNotice("Unable to delete investor inquiry.");
      return;
    }

    setNotice("Investor inquiry deleted.");
    await loadDashboard(savedCredentials);
  }

  async function updateQuotation(id, updates) {
    const response = await fetch(`/api/admin/quotations/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(savedCredentials)
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      setNotice("Unable to update quotation.");
      return;
    }

    await loadDashboard(savedCredentials);
  }

  async function deleteQuotation(id, confirmed = false) {
    if (!confirmed) {
      openDeleteModal("quotation", quotationRequests.find((item) => item.id === id));
      return;
    }

    const response = await fetch(`/api/admin/quotations/${id}`, {
      method: "DELETE",
      headers: authHeaders(savedCredentials)
    });

    if (!response.ok) {
      setNotice("Unable to delete quotation.");
      return;
    }

    setNotice("Quotation deleted.");
    await loadDashboard(savedCredentials);
  }

  async function markNotificationsRead(all = true, id = null) {
    const response = await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(savedCredentials)
      },
      body: JSON.stringify(all ? { all: true } : { id, is_read: true })
    });

    if (!response.ok) {
      setNotice("Unable to update notifications.");
      return;
    }

    await loadDashboard(savedCredentials);
  }

  async function saveSettings() {
    const response = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(savedCredentials)
      },
      body: JSON.stringify(settingsDraft)
    });

    const result = await response.json();
    if (!response.ok) {
      setNotice(result.message || "Unable to save settings.");
      return;
    }

    setNotice("Admin settings saved.");
    await loadDashboard(savedCredentials);
  }

  async function runAutomation(path, successMessage) {
    const response = await fetch(path, {
      method: "POST",
      headers: authHeaders(savedCredentials)
    });
    const result = await response.json();

    if (!response.ok) {
      setNotice(result.message || "Unable to run automation.");
      return;
    }

    setNotice(successMessage || "Automation completed.");
    await loadDashboard(savedCredentials);
  }

  function updateSetting(path, value) {
    setSettingsDraft((current) => {
      const next = structuredClone(current);
      const keys = path.split(".");
      let target = next;
      keys.slice(0, -1).forEach((key) => {
        target[key] = target[key] || {};
        target = target[key];
      });
      target[keys.at(-1)] = value;
      return next;
    });
  }

  const leads = data?.inquiries || [];
  const investorInquiries = data?.investorInquiries || [];
  const quotationRequests = data?.quotationRequests || [];
  const quotationDocuments = data?.quotationDocuments || [];
  const notifications = data?.notifications || [];
  const events = data?.events || [];
  const adminActivities = data?.adminActivities || [];
  const isOwner = adminProfile?.role === "owner";
  const canDelete = isOwner;
  const canUseSettings = isOwner;
  const visibleModules = modules.filter((module) => {
    if (["Investors", "Settings", "Users"].includes(module)) {
      return isOwner;
    }
    return true;
  });

  const filteredLeads = useMemo(() => {
    const search = query.trim().toLowerCase();
    return leads
      .filter((lead) => {
        const searchable = [
          lead.full_name,
          lead.company_name,
          lead.email,
          lead.whatsapp,
          lead.country,
          lead.quantity,
          lead.message,
          normalizeProducts(lead).join(" ")
        ].join(" ").toLowerCase();
        const matchesSearch = !search || searchable.includes(search);
        const matchesStatus = statusFilter === "All" || getStatus(lead) === statusFilter;
        const matchesPriority = priorityFilter === "All" || getPriority(lead) === priorityFilter;
        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        if (sortBy === "oldest") {
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        }
        if (sortBy === "priority") {
          const rank = { High: 3, Medium: 2, Low: 1 };
          return (rank[getPriority(b)] || 0) - (rank[getPriority(a)] || 0);
        }
        if (sortBy === "company") {
          return String(a.company_name || a.full_name || "").localeCompare(String(b.company_name || b.full_name || ""));
        }
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      });
  }, [leads, query, statusFilter, priorityFilter, sortBy]);

  const metrics = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const openLeads = leads.filter(isOpenLead);
    const pendingFollowUps = openLeads.filter(isLeadOverdue);

    return {
      totalLeads: leads.length,
      newToday: leads.filter((lead) => String(lead.created_at || "").slice(0, 10) === today).length,
      investorInquiries: investorInquiries.length + leads.filter((lead) => getLeadType(lead) === "Investor").length,
      quotationRequests: quotationRequests.length + leads.filter(isQuotationLead).length,
      nusabotLeads: leads.filter((lead) => getLeadType(lead) === "NusaBot").length,
      pendingFollowUps: pendingFollowUps.length,
      highPriority: leads.filter((lead) => getPriority(lead) === "High").length,
      openLeads,
      pendingList: pendingFollowUps.sort((a, b) => hoursSince(b.created_at) - hoursSince(a.created_at)).slice(0, 8)
    };
  }, [leads, investorInquiries.length, quotationRequests.length]);

  const ownerWorkload = useMemo(() => {
    const knownOwners = new Set(userAccounts.filter((account) => account.is_active !== false).map((account) => account.username));
    leads.forEach((lead) => {
      if (lead.assigned_to) {
        knownOwners.add(lead.assigned_to);
      }
    });

    const owners = [...knownOwners, "Unassigned"];
    return owners
      .map((owner) => {
        const ownerLeads = leads.filter((lead) => (lead.assigned_to || "Unassigned") === owner);
        const open = ownerLeads.filter(isOpenLead);
        const overdue = open.filter(isLeadOverdue);
        const highPriority = open.filter((lead) => getPriority(lead) === "High");
        const nextFollowUp = open
          .filter((lead) => lead.follow_up_deadline)
          .sort((a, b) => new Date(a.follow_up_deadline).getTime() - new Date(b.follow_up_deadline).getTime())[0];

        return {
          owner,
          total: ownerLeads.length,
          open: open.length,
          overdue: overdue.length,
          highPriority: highPriority.length,
          nextFollowUp,
          latestLead: ownerLeads.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))[0]
        };
      })
      .filter((item) => item.total || item.owner !== "Unassigned")
      .sort((a, b) => b.overdue - a.overdue || b.highPriority - a.highPriority || b.open - a.open || a.owner.localeCompare(b.owner));
  }, [leads, userAccounts]);

  const chartData = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthly = new Map();
    leads.forEach((lead) => {
      const date = new Date(lead.created_at || Date.now());
      const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      monthly.set(key, (monthly.get(key) || 0) + 1);
    });

    return {
      months: [...monthly.entries()].slice(-6),
      countries: buildCountMap(leads, (lead) => lead.country).slice(0, 6),
      products: buildCountMap(leads, normalizeProducts).slice(0, 6),
      clicks: buildCountMap(events, (event) => event.event).slice(0, 7)
    };
  }, [leads, events]);

  const latestEvents = useMemo(() => events.slice(0, 12), [events]);
  const activityAdminOptions = useMemo(() => ["All", ...new Set(adminActivities.map((activity) => activity.metadata?.admin).filter(Boolean))], [adminActivities]);
  const activityActionOptions = useMemo(() => ["All", ...new Set(adminActivities.map((activity) => activity.metadata?.action).filter(Boolean))], [adminActivities]);
  const filteredAdminActivities = useMemo(() => {
    const fromTime = activityFilters.from ? new Date(`${activityFilters.from}T00:00:00`).getTime() : 0;
    const toTime = activityFilters.to ? new Date(`${activityFilters.to}T23:59:59`).getTime() : Infinity;

    return adminActivities.filter((activity) => {
      const created = new Date(activity.created_at || 0).getTime();
      const matchesAdmin = activityFilters.admin === "All" || activity.metadata?.admin === activityFilters.admin;
      const matchesAction = activityFilters.action === "All" || activity.metadata?.action === activityFilters.action;
      return matchesAdmin && matchesAction && created >= fromTime && created <= toTime;
    });
  }, [adminActivities, activityFilters]);
  const latestAdminActivities = useMemo(() => filteredAdminActivities.slice(0, 40), [filteredAdminActivities]);
  const unreadNotifications = notifications.filter((item) => !item.is_read);
  const mostClicked = chartData.clicks[0]?.[0] || "-";
  const conversionRate = getConversionRate(leads, events);
  const priorityClass = selected ? getPriority(selected).toLowerCase() : "low";
  const selectedProducts = selected ? normalizeProducts(selected) : [];
  const selectedFollowUpHours = selected ? hoursSince(selected.created_at) : 0;
  const assignableUsers = useMemo(() => userAccounts.filter((account) => account.is_active !== false).map((account) => account.username), [userAccounts]);
  const modalTitles = {
    lead: "Buyer Lead",
    investor: "Investor Inquiry",
    quotation: "Quotation Request"
  };
  const modalFields = {
    lead: [
      ["full_name", "Full Name"],
      ["company_name", "Company Name"],
      ["email", "Email"],
      ["whatsapp", "WhatsApp"],
      ["country", "Country"],
      ["city", "City"],
      ["division", "Division"],
      ["products", "Products"],
      ["quantity", "Quantity"],
      ["monthly_requirement", "Monthly Requirement"],
      ["packaging_request", "Packaging Request", "textarea"],
      ["product_specification", "Product Specification", "textarea"],
      ["target_price", "Target Price"],
      ["message", "Message", "textarea"],
      ["status", "Status", "select"],
      ["assigned_to", "Assigned To", "admin"],
      ["follow_up_deadline", "Follow-Up Deadline", "datetime"],
      ["internal_notes", "Internal Notes", "textarea"]
    ],
    investor: [
      ["full_name", "Full Name"],
      ["company_name", "Company Name"],
      ["email", "Email"],
      ["country", "Country"],
      ["investment_interest", "Investment Interest"],
      ["message", "Message", "textarea"],
      ["status", "Status", "select"],
      ["internal_notes", "Internal Notes", "textarea"]
    ],
    quotation: [
      ["quotation_number", "Quotation Number"],
      ["buyer_name", "Buyer Name"],
      ["company_name", "Company Name"],
      ["email", "Email"],
      ["whatsapp", "WhatsApp"],
      ["country", "Country"],
      ["products", "Products"],
      ["quantity", "Quantity"],
      ["incoterm", "Incoterm"],
      ["unit_price", "Indicative Price"],
      ["validity", "Validity"],
      ["product_details", "Product Details", "textarea"],
      ["request_summary", "Request Summary", "textarea"],
      ["internal_notes", "Internal Notes", "textarea"],
      ["status", "Status", "select"]
    ]
  };

  return (
    <main className={`admin-shell ${!savedCredentials ? "admin-login-screen" : ""}`}>
      {savedCredentials ? <section className="admin-hero">
        <div>
          <p>GSN Command Center</p>
          <h1>Lead Management</h1>
          <span>Buyer inquiries, quotation requests, NusaBot leads, and follow-up control in one internal workspace.</span>
          {adminProfile ? <small className="admin-owner-badge">{adminProfile.username} - {adminProfile.role}</small> : null}
        </div>
        <div className="admin-hero-actions">
          {savedCredentials ? (
            <button className="admin-bell" onClick={() => setNotificationsOpen((value) => !value)} type="button">
              Notifications
              {unreadNotifications.length ? <span>{unreadNotifications.length}</span> : null}
            </button>
          ) : null}
          {savedCredentials ? <button onClick={() => loadDashboard(savedCredentials)} type="button">{loading ? "Syncing..." : "Refresh"}</button> : null}
          <a href="/">Open Website</a>
        </div>
      </section> : null}

      {savedCredentials && notificationsOpen ? (
        <section className="admin-panel admin-notifications">
          <div className="admin-panel-header">
            <div>
              <p>Notification Center</p>
              <h2>Internal Alerts</h2>
            </div>
            <button disabled={!unreadNotifications.length} onClick={() => markNotificationsRead(true)} type="button">Mark All Read</button>
          </div>
          <div className="admin-notification-list">
            {notifications.slice(0, 12).map((item) => (
              <button className={item.is_read ? "" : "is-unread"} key={item.id} onClick={() => markNotificationsRead(false, item.id)} type="button">
                <span>{item.type}</span>
                <strong>{item.title}</strong>
                <small>{item.message || "-"} | {formatDate(item.created_at)}</small>
              </button>
            ))}
            {!notifications.length ? <p className="admin-empty">No notifications yet.</p> : null}
          </div>
        </section>
      ) : null}

      {!savedCredentials ? (
        <section className="admin-login">
          <div className="admin-login-brand">
            <img alt="Garda Samudra Nusantara" src="/logos/gsn-admin-logo.png" />
          </div>
          <div className="admin-login-copy">
            <p>GSN Admin</p>
            <h2>Welcome Back</h2>
            <span className="admin-security-note">Internal GSN portal. Authorized access only.</span>
            <form onSubmit={handleLogin}>
              <label>
                Username
                <input
                  autoComplete="username"
                  value={credentials.username}
                  onChange={(event) => setCredentials((current) => ({ ...current, username: event.target.value }))}
                  placeholder="Enter username"
                  type="text"
                />
              </label>
              <label>
                Password
                <input
                  autoComplete="current-password"
                  value={credentials.password}
                  onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))}
                  placeholder="Enter password"
                  type="password"
                />
              </label>
              <button disabled={!credentials.username || !credentials.password || loading} type="submit">{loading ? "Signing in..." : "Sign In"}</button>
            </form>
          </div>
          {notice ? <strong>{notice}</strong> : null}
        </section>
      ) : null}

      {data ? (
        <>
          {!data.configured ? (
            <section className="admin-setup-warning">
              <h2>Supabase is not connected yet.</h2>
              <p>Add SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_DASHBOARD_USERNAME, and ADMIN_DASHBOARD_PASSWORD in Vercel to start storing live GSN data.</p>
            </section>
          ) : null}

          <section className="admin-metrics crm">
            <article><span>Total Leads</span><strong>{metrics.totalLeads}</strong></article>
            <article><span>New Today</span><strong>{metrics.newToday}</strong></article>
            <article><span>Investor Inquiries</span><strong>{metrics.investorInquiries}</strong></article>
            <article><span>Quotation Requests</span><strong>{metrics.quotationRequests}</strong></article>
            <article><span>NusaBot Leads</span><strong>{metrics.nusabotLeads}</strong></article>
            <article><span>Pending Follow-Ups</span><strong>{metrics.pendingFollowUps}</strong></article>
            <article><span>High Priority</span><strong>{metrics.highPriority}</strong></article>
          </section>

          <nav className="admin-module-tabs" aria-label="Admin modules">
            {visibleModules.map((module) => (
              <button className={activeModule === module ? "is-active" : ""} key={module} onClick={() => setActiveModule(module)} type="button">
                {module}
              </button>
            ))}
          </nav>

          {activeModule === "Leads" ? <section className="admin-chart-grid">
            <div className="admin-panel">
              <div className="admin-panel-header compact"><div><p>Leads Per Month</p><h2>Monthly Pipeline</h2></div></div>
              <BarList items={chartData.months} empty="No monthly lead data yet." />
            </div>
            <div className="admin-panel">
              <div className="admin-panel-header compact"><div><p>Lead Geography</p><h2>Countries</h2></div></div>
              <BarList items={chartData.countries} empty="No country data yet." />
            </div>
            <div className="admin-panel">
              <div className="admin-panel-header compact"><div><p>Product Demand</p><h2>Categories</h2></div></div>
              <BarList items={chartData.products} empty="No product interest yet." />
            </div>
            <div className="admin-panel">
              <div className="admin-panel-header compact"><div><p>Click Analytics</p><h2>Website Actions</h2></div></div>
              <BarList items={chartData.clicks} empty="No click tracking yet." />
            </div>
          </section> : null}

          {activeModule === "Leads" ? <section className="admin-grid">
            <div className="admin-panel admin-table-panel">
              <div className="admin-panel-header">
                <div>
                  <p>Lead Database</p>
                  <h2>Inquiries</h2>
                </div>
                <button onClick={() => exportLeadsCsv(filteredLeads)} disabled={!filteredLeads.length} type="button">Export CSV</button>
              </div>

              <div className="admin-toolbar">
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search buyer, company, product, country..." />
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  {statusFilters.map((item) => <option key={item}>{item}</option>)}
                </select>
                <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
                  {priorities.map((item) => <option key={item}>{item}</option>)}
                </select>
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="priority">Priority</option>
                  <option value="company">Company</option>
                </select>
              </div>

              <div className="admin-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Lead</th>
                      <th>Type</th>
                      <th>Country</th>
                      <th>Products</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Owner</th>
                      <th>Deadline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr className={selected?.id === lead.id ? "is-selected" : ""} key={lead.id} onClick={() => setSelected(lead)}>
                        <td>{formatDate(lead.created_at)}</td>
                        <td><strong>{lead.full_name || "-"}</strong><span>{lead.company_name || lead.email || "-"}</span></td>
                        <td>{getLeadType(lead)}</td>
                        <td>{lead.country || "-"}</td>
                        <td>{normalizeProducts(lead).length ? normalizeProducts(lead).join(", ") : "-"}</td>
                        <td><span className={`admin-priority ${getPriority(lead).toLowerCase()}`}>{getPriority(lead)}</span></td>
                        <td>{getStatus(lead)}</td>
                        <td>{lead.assigned_to || "Unassigned"}</td>
                        <td>{lead.follow_up_deadline ? formatDate(lead.follow_up_deadline) : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!filteredLeads.length ? <p className="admin-empty table">No matching leads yet.</p> : null}
              </div>
            </div>

            <aside className="admin-panel admin-detail">
              <div className="admin-panel-header">
                <div>
                  <p>Lead Detail</p>
                  <h2>{selected?.full_name || "No lead selected"}</h2>
                </div>
                {selected ? <span className={`admin-priority ${priorityClass}`}>{getPriority(selected)}</span> : null}
              </div>

              {selected ? (
                <div className="admin-detail-body">
                  <dl>
                    <dt>Company</dt><dd>{selected.company_name || "-"}</dd>
                    <dt>WhatsApp</dt><dd>{selected.whatsapp || selected.phone || "-"}</dd>
                    <dt>Email</dt><dd>{selected.email || "-"}</dd>
                    <dt>Country</dt><dd>{selected.country || "-"}</dd>
                    <dt>Products</dt><dd>{selectedProducts.length ? selectedProducts.join(", ") : "-"}</dd>
                    <dt>Quantity</dt><dd>{selected.quantity || "-"}</dd>
                    <dt>Lead Score</dt><dd>{selected.lead_score ?? 0}/100</dd>
                    <dt>Follow-Up</dt><dd>{selectedFollowUpHours >= 24 ? `${selectedFollowUpHours} hours waiting` : "Within 24 hours"}</dd>
                    <dt>Assigned To</dt><dd>{selected.assigned_to || "Unassigned"}</dd>
                    <dt>Deadline</dt><dd>{selected.follow_up_deadline ? formatDate(selected.follow_up_deadline) : "-"}</dd>
                    <dt>Reason</dt><dd>{selected.lead_reason || "-"}</dd>
                  </dl>

                  <label>
                    Status
                    <select value={getStatus(selected)} onChange={(event) => updateLead(selected.id, { status: event.target.value })}>
                      {statuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </label>

                  <label>
                    Assigned To
                    <select value={selected.assigned_to || ""} onChange={(event) => updateLead(selected.id, { assigned_to: event.target.value })}>
                      <option value="">Unassigned</option>
                      {assignableUsers.map((username) => <option key={username} value={username}>{username}</option>)}
                    </select>
                  </label>

                  <label>
                    Follow-Up Deadline
                    <input
                      type="datetime-local"
                      value={toDateTimeLocal(selected.follow_up_deadline)}
                      onChange={(event) => updateLead(selected.id, { follow_up_deadline: event.target.value })}
                    />
                  </label>

                  <label>
                    Internal Notes
                    <textarea
                      defaultValue={selected.internal_notes || ""}
                      onBlur={(event) => updateLead(selected.id, { internal_notes: event.target.value })}
                      placeholder="Add follow-up notes, quotation status, buyer preference..."
                    />
                  </label>

                  <div className="admin-actions">
                    <button onClick={() => openModal("lead", selected)} type="button">Edit Lead</button>
                    <a href={`https://wa.me/${String(selected.whatsapp || selected.phone || "").replace(/\D/g, "")}`} target="_blank" rel="noreferrer">WhatsApp</a>
                    {selected.email ? <a href={`mailto:${selected.email}`}>Email</a> : null}
                    {canDelete ? <button className="danger" onClick={() => openDeleteModal("lead", selected)} type="button">Delete</button> : null}
                  </div>
                </div>
              ) : <p className="admin-empty">Select a lead to see details.</p>}
            </aside>
            <div className="admin-panel wide">
              <div className="admin-panel-header">
                <div>
                  <p>Owner Workload</p>
                  <h2>Lead Assignment</h2>
                </div>
                <span className="admin-muted">{metrics.openLeads.length} open leads</span>
              </div>
              <div className="admin-workload-list">
                {ownerWorkload.map((item) => (
                  <button
                    className={item.overdue ? "is-overdue" : ""}
                    key={item.owner}
                    onClick={() => item.latestLead ? setSelected(item.latestLead) : null}
                    type="button"
                  >
                    <span>
                      <strong>{item.owner}</strong>
                      <small>{item.open} open / {item.total} total leads</small>
                    </span>
                    <span className="admin-workload-metrics">
                      <em>{item.highPriority} high</em>
                      <em className={item.overdue ? "danger" : ""}>{item.overdue} overdue</em>
                      <em>{item.nextFollowUp ? formatDate(item.nextFollowUp.follow_up_deadline) : "No deadline"}</em>
                    </span>
                  </button>
                ))}
                {!ownerWorkload.length ? <p className="admin-empty">No assigned leads yet.</p> : null}
              </div>
            </div>
          </section> : null}

          {activeModule === "Investors" ? (
            <section className="admin-panel">
              <div className="admin-panel-header">
                <div>
                  <p>Investor CRM</p>
                  <h2>Investor Inquiries</h2>
                </div>
                <button
                  disabled={!investorInquiries.length}
                  onClick={() => exportRowsCsv(
                    `gsn-investors-${new Date().toISOString().slice(0, 10)}.csv`,
                    ["Created At", "Name", "Company", "Email", "Country", "Interest", "Status", "Message"],
                    investorInquiries.map((item) => [item.created_at, item.full_name, item.company_name, item.email, item.country, item.investment_interest, item.status, item.message])
                  )}
                  type="button"
                >
                  Export CSV
                </button>
              </div>
              <div className="admin-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Investor</th>
                      <th>Country</th>
                      <th>Interest</th>
                      <th>Status</th>
                      <th>Message</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investorInquiries.map((item) => (
                      <tr key={item.id}>
                        <td>{formatDate(item.created_at)}</td>
                        <td><strong>{item.full_name || "-"}</strong><span>{item.company_name || item.email || "-"}</span></td>
                        <td>{item.country || "-"}</td>
                        <td>{item.investment_interest || "-"}</td>
                        <td>
                          <select value={item.status || "New"} onChange={(event) => updateInvestor(item.id, { status: event.target.value })}>
                            {statuses.map((status) => <option key={status}>{status}</option>)}
                          </select>
                        </td>
                        <td>{item.message || "-"}</td>
                        <td>
                          <div className="admin-table-actions">
                            <button onClick={() => openModal("investor", item)} type="button">Edit</button>
                            {canDelete ? <button onClick={() => deleteInvestor(item.id)} type="button">Delete</button> : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!investorInquiries.length ? <p className="admin-empty table">No dedicated investor inquiries yet. Partnership leads from the main form still appear in Leads.</p> : null}
              </div>
            </section>
          ) : null}

          {activeModule === "Quotations" ? (
            <section className="admin-grid quotation">
              <div className="admin-panel">
                <div className="admin-panel-header">
                  <div>
                    <p>Quotation Builder</p>
                    <h2>Request Summary</h2>
                  </div>
                  <button disabled={!selected} onClick={() => printQuotation(selected, quotationDraft)} type="button">Print / PDF</button>
                </div>
                <div className="admin-quotation-builder">
                  <p className="admin-empty">Selected lead: <strong>{selected?.full_name || "Select a lead in Leads tab first"}</strong></p>
                  <label>Quotation Number<input value={quotationDraft.quotation_number || getNextQuotationNumber(quotationRequests, quotationDocuments)} onChange={(event) => setQuotationDraft((current) => ({ ...current, quotation_number: event.target.value }))} placeholder="GSN-QTN-2026-0001" /></label>
                  <label>Incoterm<input value={quotationDraft.incoterm} onChange={(event) => setQuotationDraft((current) => ({ ...current, incoterm: event.target.value }))} placeholder="FOB, CIF, CNF..." /></label>
                  <label>Validity<input value={quotationDraft.validity} onChange={(event) => setQuotationDraft((current) => ({ ...current, validity: event.target.value }))} /></label>
                  <div className="admin-quote-items">
                    <div className="admin-panel-header compact">
                      <div><p>Line Items</p><h2>Product Table</h2></div>
                      <button onClick={addQuotationItem} type="button">Add Item</button>
                    </div>
                    {getQuotationItems(quotationDraft, selected).map((item, index) => (
                      <div className="admin-quote-item-row" key={`${index}-${item.product}`}>
                        <label>Product<input value={item.product} onChange={(event) => updateQuotationItem(index, "product", event.target.value)} placeholder="Product name" /></label>
                        <label>Quantity<input value={item.quantity} onChange={(event) => updateQuotationItem(index, "quantity", event.target.value)} placeholder="10 MT / 1 container" /></label>
                        <label>Unit Price<input value={item.unit_price} onChange={(event) => updateQuotationItem(index, "unit_price", event.target.value)} placeholder="USD xxx / MT" /></label>
                        <label>Notes<input value={item.notes} onChange={(event) => updateQuotationItem(index, "notes", event.target.value)} placeholder="Packaging, grade, spec..." /></label>
                        <button className="danger" onClick={() => removeQuotationItem(index)} type="button">Remove</button>
                      </div>
                    ))}
                  </div>
                  <label>Product Details<textarea value={quotationDraft.product_details} onChange={(event) => setQuotationDraft((current) => ({ ...current, product_details: event.target.value }))} placeholder="Specification, packaging, origin, loading port..." /></label>
                  <label>Internal Notes<textarea value={quotationDraft.internal_notes} onChange={(event) => setQuotationDraft((current) => ({ ...current, internal_notes: event.target.value }))} placeholder="Negotiation notes, margin, supplier readiness..." /></label>
                  <div className="admin-actions">
                    <button disabled={!selected} onClick={saveQuotation} type="button">Save Draft</button>
                    <button disabled={!selected} onClick={saveQuotationDocument} type="button">Save PDF Record</button>
                    <button disabled={!selected} onClick={() => printQuotation(selected, quotationDraft)} type="button">Print Version</button>
                  </div>
                </div>
              </div>

              <div className="admin-panel">
                <div className="admin-panel-header">
                  <div>
                    <p>Quotation History</p>
                    <h2>Saved Requests</h2>
                  </div>
                  <button
                    disabled={!quotationRequests.length}
                    onClick={() => exportRowsCsv(
                      `gsn-quotations-${new Date().toISOString().slice(0, 10)}.csv`,
                      ["Created At", "Quotation Number", "Buyer", "Company", "Country", "Products", "Quantity", "Incoterm", "Price", "Status"],
                      quotationRequests.map((item) => [item.created_at, getQuotationNumber(item), item.buyer_name, item.company_name, item.country, Array.isArray(item.products) ? item.products.join("; ") : "", item.quantity, item.incoterm, item.unit_price, item.status])
                    )}
                    type="button"
                  >
                    Export CSV
                  </button>
                </div>
                <div className="admin-event-list quotation-history">
                  {quotationRequests.map((item) => (
                    <article key={item.id}>
                      <strong>{getQuotationNumber(item) || item.buyer_name || item.company_name || "Quotation"}</strong>
                      <span>{Array.isArray(item.products) ? item.products.join(", ") : "-"} | {item.quantity || "-"}</span>
                      <small>{item.buyer_name || item.company_name || "Buyer"} - {item.status || "Draft"} - {formatDate(item.created_at)}</small>
                      <div className="admin-actions">
                        <button onClick={() => updateQuotation(item.id, { status: item.status === "Sent" ? "Draft" : "Sent" })} type="button">
                          {item.status === "Sent" ? "Mark Draft" : "Mark Sent"}
                        </button>
                        <button onClick={() => openModal("quotation", item)} type="button">Edit</button>
                        {canDelete ? <button onClick={() => deleteQuotation(item.id)} type="button">Delete</button> : null}
                      </div>
                    </article>
                  ))}
                  {!quotationRequests.length ? <p className="admin-empty">No saved quotation requests yet.</p> : null}
                </div>
                <div className="admin-event-list quotation-history">
                  <div className="admin-panel-header compact"><div><p>PDF Records</p><h2>Saved Documents</h2></div></div>
                  {quotationDocuments.map((item) => (
                    <article key={item.id}>
                      <strong>{getQuotationNumber(item) || item.document_title || item.buyer_name || "Quotation Document"}</strong>
                      <span>{item.buyer_name || "-"} | {item.company_name || "-"}</span>
                      <small>{item.status || "Generated"} - {formatDate(item.created_at)}</small>
                      <div className="admin-actions">
                        <button onClick={() => downloadQuotationPdf(item)} type="button">Download PDF</button>
                      </div>
                    </article>
                  ))}
                  {!quotationDocuments.length ? <p className="admin-empty">No PDF-ready records yet.</p> : null}
                </div>
              </div>
            </section>
          ) : null}

          {activeModule === "Analytics" ? (
            <>
              <section className="admin-metrics analytics">
                <article><span>Total Clicks</span><strong>{events.length}</strong></article>
                <article><span>Conversion Rate</span><strong>{conversionRate}%</strong></article>
                <article><span>Most Clicked</span><strong className="text-small">{mostClicked}</strong></article>
                <article><span>Visitor Actions</span><strong>{new Set(events.map((event) => event.event)).size}</strong></article>
              </section>
              <section className="admin-chart-grid analytics">
                <div className="admin-panel">
                  <div className="admin-panel-header compact"><div><p>Feature Clicks</p><h2>Most Clicked</h2></div></div>
                  <BarList items={chartData.clicks} empty="No click tracking yet." />
                </div>
                <div className="admin-panel">
                  <div className="admin-panel-header compact"><div><p>Lead Conversion</p><h2>Lead Sources</h2></div></div>
                  <BarList items={buildCountMap(leads, (lead) => lead.source || "inquiry_form").slice(0, 7)} empty="No lead source data yet." />
                </div>
                <div className="admin-panel wide">
                  <div className="admin-panel-header">
                    <div>
                      <p>Visitor Actions</p>
                      <h2>Latest Click Timeline</h2>
                    </div>
                  </div>
                  <div className="admin-event-list">
                    {latestEvents.map((event) => (
                      <article key={event.id}>
                        <strong>{event.event}</strong>
                        <span>{event.label || event.path || "-"}</span>
                        <small>{formatDate(event.created_at)}</small>
                      </article>
                    ))}
                    {!latestEvents.length ? <p className="admin-empty">No visitor actions recorded yet.</p> : null}
                  </div>
                </div>
              </section>
            </>
          ) : null}

          {activeModule === "Activity" ? (
            <section className="admin-panel">
              <div className="admin-panel-header">
                <div>
                  <p>Activity Log</p>
                  <h2>Admin Actions</h2>
                </div>
                <button
                  disabled={!latestAdminActivities.length}
                  onClick={() => exportRowsCsv(
                    `gsn-admin-activity-${new Date().toISOString().slice(0, 10)}.csv`,
                    ["Created At", "Admin", "Role", "Action", "Label", "Reference Type", "Reference ID", "Changed Fields", "Before", "After", "Details"],
                    latestAdminActivities.map((activity) => {
                      const changes = getAuditChanges(activity);
                      return [
                      activity.created_at || "",
                      activity.metadata?.admin || "",
                      activity.metadata?.role || "",
                      activity.metadata?.action || "",
                      activity.label || "",
                      activity.metadata?.referenceType || activity.path || "",
                      activity.metadata?.referenceId || "",
                      changes.map((change) => change.field).join("; "),
                      changes.map((change) => `${change.field}: ${formatAuditValue(change.before)}`).join("; "),
                      changes.map((change) => `${change.field}: ${formatAuditValue(change.after)}`).join("; "),
                      JSON.stringify(activity.metadata || {})
                    ];
                    })
                  )}
                  type="button"
                >
                  Export Audit CSV
                </button>
              </div>
              <div className="admin-filter-row activity">
                <select value={activityFilters.admin} onChange={(event) => setActivityFilters((current) => ({ ...current, admin: event.target.value }))}>
                  {activityAdminOptions.map((admin) => <option key={admin}>{admin}</option>)}
                </select>
                <select value={activityFilters.action} onChange={(event) => setActivityFilters((current) => ({ ...current, action: event.target.value }))}>
                  {activityActionOptions.map((action) => <option key={action}>{action}</option>)}
                </select>
                <input type="date" value={activityFilters.from} onChange={(event) => setActivityFilters((current) => ({ ...current, from: event.target.value }))} />
                <input type="date" value={activityFilters.to} onChange={(event) => setActivityFilters((current) => ({ ...current, to: event.target.value }))} />
                <button onClick={() => setActivityFilters({ admin: "All", action: "All", from: "", to: "" })} type="button">Reset</button>
              </div>
              <div className="admin-event-list">
                {latestAdminActivities.map((activity) => {
                  const changes = getAuditChanges(activity);
                  return (
                    <article key={activity.id}>
                      <strong>{activity.metadata?.admin || "admin"} <span className="admin-role-chip">{activity.metadata?.role || "role"}</span></strong>
                      <span>{activity.label || activity.metadata?.action || "Admin activity"}</span>
                      {activity.metadata?.quotationNumber ? <em>Quotation: {activity.metadata.quotationNumber}</em> : null}
                      {changes.length ? (
                        <div className="admin-audit-diff">
                          {changes.slice(0, 6).map((change) => (
                            <div key={change.field}>
                              <b>{change.field}</b>
                              <span>{formatAuditValue(change.before)}</span>
                              <i>to</i>
                              <strong>{formatAuditValue(change.after)}</strong>
                            </div>
                          ))}
                          {changes.length > 6 ? <small>+{changes.length - 6} more changed fields</small> : null}
                        </div>
                      ) : null}
                      <small>{formatDate(activity.created_at)}</small>
                    </article>
                  );
                })}
                {!latestAdminActivities.length ? <p className="admin-empty">No admin actions recorded yet.</p> : null}
              </div>
            </section>
          ) : null}

          {activeModule === "Settings" && canUseSettings ? (
            <section className="admin-settings-grid">
              <div className="admin-panel">
                <div className="admin-panel-header">
                  <div>
                    <p>Company Settings</p>
                    <h2>Business Profile</h2>
                  </div>
                  <button onClick={saveSettings} type="button">Save Settings</button>
                </div>
                <div className="admin-settings-form">
                  <label>Company Name<input value={settingsDraft.company_name || ""} onChange={(event) => updateSetting("company_name", event.target.value)} /></label>
                  <label>Contact Email<input value={settingsDraft.contact_email || ""} onChange={(event) => updateSetting("contact_email", event.target.value)} /></label>
                  <label>WhatsApp Number<input value={settingsDraft.whatsapp_number || ""} onChange={(event) => updateSetting("whatsapp_number", event.target.value)} /></label>
                  <label>Website URL<input value={settingsDraft.website_url || ""} onChange={(event) => updateSetting("website_url", event.target.value)} /></label>
                  <label>Office Location<textarea value={settingsDraft.office_location || ""} onChange={(event) => updateSetting("office_location", event.target.value)} /></label>
                </div>
              </div>

              <div className="admin-panel">
                <div className="admin-panel-header">
                  <div>
                    <p>Preferences</p>
                    <h2>Notifications & Analytics</h2>
                  </div>
                </div>
                <div className="admin-toggle-list">
                  {[
                    ["notification_preferences.new_inquiry", "New inquiry notifications"],
                    ["notification_preferences.quotation_request", "Quotation request notifications"],
                    ["notification_preferences.nusabot_lead", "NusaBot lead notifications"],
                    ["notification_preferences.follow_up_warning", "Follow-up warning notifications"],
                    ["analytics_settings.track_cta_clicks", "Track CTA clicks"],
                    ["analytics_settings.track_nusabot", "Track NusaBot activity"],
                    ["analytics_settings.track_partner_clicks", "Track partnership clicks"]
                  ].map(([path, label]) => {
                    const value = path.split(".").reduce((obj, key) => obj?.[key], settingsDraft);
                    return (
                      <label key={path}>
                        <span>{label}</span>
                        <input checked={Boolean(value)} onChange={(event) => updateSetting(path, event.target.checked)} type="checkbox" />
                      </label>
                    );
                  })}
                </div>
                <div className="admin-settings-form compact">
                  <label>GA4 Measurement ID<input value={settingsDraft.analytics_settings?.ga4_measurement_id || ""} onChange={(event) => updateSetting("analytics_settings.ga4_measurement_id", event.target.value)} placeholder="G-XXXXXXXXXX" /></label>
                </div>
              </div>

              <div className="admin-panel admin-future-panel">
                <div className="admin-panel-header">
                  <div>
                    <p>Automation Center</p>
                    <h2>Live Workflows</h2>
                  </div>
                </div>
                <div className="admin-actions">
                  <button onClick={() => runAutomation("/api/automation/followups", "Follow-up automation checked.")} type="button">Run Follow-Up Check</button>
                  <button onClick={() => runAutomation("/api/automation/daily-report", "Daily report sent.")} type="button">Send Daily Report</button>
                </div>
                <p className="admin-empty">Vercel Cron runs follow-up checks hourly and sends the daily lead report at 08:00 Jakarta time after deployment.</p>
              </div>

              <div className="admin-panel admin-future-panel">
                <div className="admin-panel-header">
                  <div>
                    <p>Future Ready</p>
                    <h2>Integration Roadmap</h2>
                  </div>
                </div>
                <div className="admin-integration-list">
                  {futureIntegrations.map((name) => (
                    <article key={name}>
                      <strong>{name}</strong>
                      <span>Planned integration layer ready</span>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {activeModule === "Users" && isOwner ? (
            <section className="admin-settings-grid">
              <div className="admin-panel">
                <div className="admin-panel-header">
                  <div>
                    <p>User Management</p>
                    <h2>Admin Accounts</h2>
                  </div>
                  <button onClick={() => loadUsers(savedCredentials)} type="button">Refresh Users</button>
                </div>
                <div className="admin-user-list">
                  {userAccounts.map((account) => (
                    <article key={account.username}>
                      <div>
                        <strong>{account.username}</strong>
                        <span>{account.role} | {account.source || "dashboard"} | {account.is_active === false ? "inactive" : "active"}</span>
                      </div>
                      <small>{account.role === "owner" ? "Full access to dashboard, settings, users, delete actions, and automation." : "Marketing access: leads, quotations, analytics, activity log, and PDF download only."}</small>
                      {account.source !== "env" ? (
                        <div className="admin-user-actions">
                          <select value={account.role} onChange={(event) => updateUserAccount(account, { role: event.target.value })}>
                            <option value="marketing">marketing</option>
                            <option value="owner">owner</option>
                          </select>
                          <button onClick={() => updateUserAccount(account, { is_active: account.is_active === false })} type="button">
                            {account.is_active === false ? "Activate" : "Deactivate"}
                          </button>
                          <button className="danger" onClick={() => deleteUserAccount(account)} type="button">Delete</button>
                        </div>
                      ) : (
                        <small>Environment account. Edit this one in Vercel env if needed.</small>
                      )}
                    </article>
                  ))}
                </div>
              </div>
              <div className="admin-panel">
                <div className="admin-panel-header">
                  <div>
                    <p>Create Account</p>
                    <h2>Dashboard User</h2>
                  </div>
                </div>
                <div className="admin-settings-form">
                  <label>Username<input value={userDraft.username} onChange={(event) => setUserDraft((current) => ({ ...current, username: event.target.value }))} placeholder="marketing" /></label>
                  <label>Password<input value={userDraft.password} onChange={(event) => setUserDraft((current) => ({ ...current, password: event.target.value }))} placeholder="minimum 6 characters" type="password" /></label>
                  <label>Role
                    <select value={userDraft.role} onChange={(event) => setUserDraft((current) => ({ ...current, role: event.target.value }))}>
                      <option value="marketing">marketing</option>
                      <option value="owner">owner</option>
                    </select>
                  </label>
                  <button onClick={saveUserAccount} type="button">Save User</button>
                </div>
                <div className="admin-modal-confirm">
                  <p>Recommended staff account:</p>
                  <strong>marketing / marketing123</strong>
                  <p>Marketing role can manage leads and quotations, but cannot open Settings, Users, delete records, or run owner automation.</p>
                </div>
              </div>
            </section>
          ) : null}

          {activeModule === "Leads" ? <section className="admin-grid lower">
            <div className="admin-panel">
              <div className="admin-panel-header">
                <div>
                  <p>Follow-Up Reminder</p>
                  <h2>Pending Leads</h2>
                </div>
              </div>
              <div className="admin-follow-list">
                {metrics.pendingList.map((lead) => {
                  const hours = hoursSince(lead.created_at);
                  const severity = hours >= 72 ? "critical" : hours >= 48 ? "warning" : "reminder";
                  return (
                    <button key={lead.id} onClick={() => setSelected(lead)} type="button">
                      <span>{lead.full_name || "Unnamed Buyer"}<small>{lead.company_name || lead.country || "-"}</small></span>
                      <strong className={severity}>{hours}h</strong>
                    </button>
                  );
                })}
                {!metrics.pendingList.length ? <p className="admin-empty">No pending follow-ups beyond 24 hours.</p> : null}
              </div>
            </div>

            <div className="admin-panel">
              <div className="admin-panel-header">
                <div>
                  <p>Traffic Signals</p>
                  <h2>Latest Events</h2>
                </div>
              </div>
              <div className="admin-event-list">
                {latestEvents.map((event) => (
                  <article key={event.id}>
                    <strong>{event.event}</strong>
                    <span>{event.label || "-"}</span>
                    <small>{formatDate(event.created_at)}</small>
                  </article>
                ))}
                {!latestEvents.length ? <p className="admin-empty">No visitor actions recorded yet.</p> : null}
              </div>
            </div>
          </section> : null}
        </>
      ) : null}

      {modal ? (
        <section className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-label={`${modal.mode === "delete" ? "Delete" : "Edit"} ${modalTitles[modal.type]}`}>
          <div className="admin-modal">
            <div className="admin-panel-header">
              <div>
                <p>{modal.mode === "delete" ? "Confirm Delete" : "Edit Record"}</p>
                <h2>{modalTitles[modal.type]}</h2>
              </div>
              <button onClick={() => setModal(null)} type="button">Close</button>
            </div>

            {modal.mode === "delete" ? (
              <div className="admin-modal-confirm">
                <p>This record will be removed from the GSN admin dashboard.</p>
                <strong>{modal.item?.full_name || modal.item?.buyer_name || modal.item?.company_name || "Selected record"}</strong>
                <div className="admin-actions">
                  <button className="danger" onClick={confirmDeleteModal} type="button">Delete Record</button>
                  <button onClick={() => setModal(null)} type="button">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="admin-modal-form">
                  {(modalFields[modal.type] || []).map(([field, label, kind]) => (
                    <label key={field} className={kind === "textarea" ? "wide" : ""}>
                      {label}
                      {kind === "textarea" ? (
                        <textarea value={modal.draft[field] || ""} onChange={(event) => updateModalField(field, event.target.value)} />
                      ) : kind === "select" ? (
                        <select value={modal.draft[field] || "New"} onChange={(event) => updateModalField(field, event.target.value)}>
                          {(modal.type === "quotation" ? ["Draft", "Sent", "Accepted", "Rejected", "Closed"] : statuses).map((status) => <option key={status}>{status}</option>)}
                        </select>
                      ) : kind === "admin" ? (
                        <select value={modal.draft[field] || ""} onChange={(event) => updateModalField(field, event.target.value)}>
                          <option value="">Unassigned</option>
                          {assignableUsers.map((username) => <option key={username} value={username}>{username}</option>)}
                        </select>
                      ) : kind === "datetime" ? (
                        <input type="datetime-local" value={modal.draft[field] || ""} onChange={(event) => updateModalField(field, event.target.value)} />
                      ) : (
                        <input value={modal.draft[field] || ""} onChange={(event) => updateModalField(field, event.target.value)} />
                      )}
                    </label>
                  ))}
                </div>
                <div className="admin-actions">
                  <button onClick={saveModal} type="button">Save Changes</button>
                  <button onClick={() => setModal(null)} type="button">Cancel</button>
                </div>
              </>
            )}
          </div>
        </section>
      ) : null}
    </main>
  );
}
