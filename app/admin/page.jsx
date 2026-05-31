"use client";

import { useMemo, useState } from "react";

const statuses = ["New", "Contacted", "Negotiation", "Quotation Sent", "Converted", "Closed"];
const priorities = ["All", "High", "Medium", "Low"];
const statusFilters = ["All", ...statuses];
const modules = ["Leads", "Investors", "Quotations", "Analytics", "Settings"];
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
  const headers = ["Created At", "Name", "Company", "Email", "WhatsApp", "Country", "Products", "Quantity", "Priority", "Status", "Source", "Message"];
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

function buildQuotationSummary(lead, draft) {
  const products = normalizeProducts(lead);
  return [
    `Buyer: ${lead?.full_name || "-"}${lead?.company_name ? ` (${lead.company_name})` : ""}`,
    `Country: ${lead?.country || "-"}`,
    `Products: ${products.length ? products.join(", ") : "-"}`,
    `Quantity: ${draft.quantity || lead?.quantity || "-"}`,
    `Incoterm: ${draft.incoterm || "-"}`,
    `Indicative Price: ${draft.unit_price || "-"}`,
    `Validity: ${draft.validity || "7 business days"}`,
    "",
    draft.product_details || lead?.product_specification || "Product specification to be confirmed based on buyer requirements.",
    "",
    draft.internal_notes || "Next step: confirm final specification, packaging, destination port, and payment terms."
  ].join("\n");
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
  const [quotationDraft, setQuotationDraft] = useState({
    incoterm: "FOB",
    unit_price: "",
    validity: "7 business days",
    product_details: "",
    internal_notes: ""
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
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading(false);
    }
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

  async function saveQuotation() {
    if (!selected) {
      setNotice("Select a lead before creating a quotation.");
      return;
    }

    const payload = {
      inquiry_id: selected.id,
      buyer_name: selected.full_name || "",
      company_name: selected.company_name || "",
      email: selected.email || "",
      whatsapp: selected.whatsapp || selected.phone || "",
      country: selected.country || "",
      products: normalizeProducts(selected),
      quantity: quotationDraft.quantity || selected.quantity || "",
      incoterm: quotationDraft.incoterm,
      unit_price: quotationDraft.unit_price,
      validity: quotationDraft.validity,
      product_details: quotationDraft.product_details || selected.product_specification || "",
      internal_notes: quotationDraft.internal_notes,
      request_summary: buildQuotationSummary(selected, quotationDraft),
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

    const summary = buildQuotationSummary(selected, quotationDraft);
    const response = await fetch("/api/admin/quotation-documents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(savedCredentials)
      },
      body: JSON.stringify({
        inquiry_id: selected.id,
        buyer_name: selected.full_name || "",
        company_name: selected.company_name || "",
        document_title: `GSN Quotation - ${selected.full_name || selected.company_name || "Buyer"}`,
        document_html: buildQuotationDocumentHtml(selected, quotationDraft),
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

  async function deleteInvestor(id) {
    if (!window.confirm("Delete this investor inquiry?")) {
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

  async function deleteQuotation(id) {
    if (!window.confirm("Delete this quotation request?")) {
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
    const openLeads = leads.filter((lead) => !["Converted", "Closed"].includes(getStatus(lead)));
    const pendingFollowUps = openLeads.filter((lead) => hoursSince(lead.created_at) >= 24);

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
  const unreadNotifications = notifications.filter((item) => !item.is_read);
  const mostClicked = chartData.clicks[0]?.[0] || "-";
  const conversionRate = getConversionRate(leads, events);
  const priorityClass = selected ? getPriority(selected).toLowerCase() : "low";
  const selectedProducts = selected ? normalizeProducts(selected) : [];
  const selectedFollowUpHours = selected ? hoursSince(selected.created_at) : 0;

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
            {modules.map((module) => (
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
                    <dt>Reason</dt><dd>{selected.lead_reason || "-"}</dd>
                  </dl>

                  <label>
                    Status
                    <select value={getStatus(selected)} onChange={(event) => updateLead(selected.id, { status: event.target.value })}>
                      {statuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
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
                    <a href={`https://wa.me/${String(selected.whatsapp || selected.phone || "").replace(/\D/g, "")}`} target="_blank" rel="noreferrer">WhatsApp</a>
                    {selected.email ? <a href={`mailto:${selected.email}`}>Email</a> : null}
                  </div>
                </div>
              ) : <p className="admin-empty">Select a lead to see details.</p>}
            </aside>
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
                            <button onClick={() => updateInvestor(item.id, { internal_notes: window.prompt("Investor notes", item.internal_notes || "") || item.internal_notes || "" })} type="button">Notes</button>
                            <button onClick={() => deleteInvestor(item.id)} type="button">Delete</button>
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
                  <label>Quantity<input value={quotationDraft.quantity || selected?.quantity || ""} onChange={(event) => setQuotationDraft((current) => ({ ...current, quantity: event.target.value }))} placeholder="Example: 1 container / 10 MT" /></label>
                  <label>Incoterm<input value={quotationDraft.incoterm} onChange={(event) => setQuotationDraft((current) => ({ ...current, incoterm: event.target.value }))} placeholder="FOB, CIF, CNF..." /></label>
                  <label>Indicative Price<input value={quotationDraft.unit_price} onChange={(event) => setQuotationDraft((current) => ({ ...current, unit_price: event.target.value }))} placeholder="Example: USD xxx / MT" /></label>
                  <label>Validity<input value={quotationDraft.validity} onChange={(event) => setQuotationDraft((current) => ({ ...current, validity: event.target.value }))} /></label>
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
                      ["Created At", "Buyer", "Company", "Country", "Products", "Quantity", "Incoterm", "Price", "Status"],
                      quotationRequests.map((item) => [item.created_at, item.buyer_name, item.company_name, item.country, Array.isArray(item.products) ? item.products.join("; ") : "", item.quantity, item.incoterm, item.unit_price, item.status])
                    )}
                    type="button"
                  >
                    Export CSV
                  </button>
                </div>
                <div className="admin-event-list quotation-history">
                  {quotationRequests.map((item) => (
                    <article key={item.id}>
                      <strong>{item.buyer_name || item.company_name || "Quotation"}</strong>
                      <span>{Array.isArray(item.products) ? item.products.join(", ") : "-"} | {item.quantity || "-"}</span>
                      <small>{item.status || "Draft"} - {formatDate(item.created_at)}</small>
                      <div className="admin-actions">
                        <button onClick={() => updateQuotation(item.id, { status: item.status === "Sent" ? "Draft" : "Sent" })} type="button">
                          {item.status === "Sent" ? "Mark Draft" : "Mark Sent"}
                        </button>
                        <button onClick={() => updateQuotation(item.id, { internal_notes: window.prompt("Quotation notes", item.internal_notes || "") || item.internal_notes || "" })} type="button">Notes</button>
                        <button onClick={() => deleteQuotation(item.id)} type="button">Delete</button>
                      </div>
                    </article>
                  ))}
                  {!quotationRequests.length ? <p className="admin-empty">No saved quotation requests yet.</p> : null}
                </div>
                <div className="admin-event-list quotation-history">
                  <div className="admin-panel-header compact"><div><p>PDF Records</p><h2>Saved Documents</h2></div></div>
                  {quotationDocuments.map((item) => (
                    <article key={item.id}>
                      <strong>{item.document_title || item.buyer_name || "Quotation Document"}</strong>
                      <span>{item.buyer_name || "-"} | {item.company_name || "-"}</span>
                      <small>{item.status || "Generated"} - {formatDate(item.created_at)}</small>
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

          {activeModule === "Settings" ? (
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
    </main>
  );
}
