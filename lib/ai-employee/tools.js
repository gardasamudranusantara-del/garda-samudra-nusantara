function headers(ctx, extra = {}) {
  return {
    "Content-Type": "application/json",
    Authorization: ctx.userToken ? `Bearer ${ctx.userToken}` : "",
    "x-admin-session": ctx.userToken || "",
    ...extra
  };
}

async function adminFetch(ctx, path, options = {}) {
  const url = new URL(path, ctx.baseUrl);
  const response = await fetch(url, {
    ...options,
    headers: headers(ctx, options.headers || {})
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request gagal (${response.status})`);
  }

  return data;
}

async function loadOverview(ctx) {
  return adminFetch(ctx, "/api/admin/overview");
}

const supplierAllowedUsers = new Set(["dapi", "pici"]);

function canReadSupplierData(ctx) {
  const permissions = ctx.permissions || [];
  return supplierAllowedUsers.has(String(ctx.username || "").toLowerCase()) ||
    permissions.includes("supplier_access") ||
    permissions.some((permission) => String(permission).startsWith("crm_suppliers_"));
}

function normalizeDate(value) {
  return String(value || "").slice(0, 10);
}

function dateMatchesPeriod(dateValue, period) {
  const date = normalizeDate(dateValue);
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const month = today.slice(0, 7);

  if (!period || period === "all") return true;
  if (period === "today") return date === today;
  if (period === "this_month") return date.startsWith(month);
  if (period === "this_week") {
    const input = new Date(`${date}T00:00:00`);
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    return input >= start;
  }
  return true;
}

function toLower(value) {
  return String(value || "").toLowerCase();
}

function includesText(value, query) {
  return toLower(value).includes(query);
}

function matchesBuyer(record, query) {
  const products = Array.isArray(record.products) ? record.products.join(" ") : "";
  return [
    record.full_name,
    record.buyer_name,
    record.company_name,
    record.email,
    record.whatsapp,
    record.country,
    record.city,
    record.buyer_stage,
    record.relationship_status,
    record.invoice_number,
    record.quotation_number,
    record.message,
    record.notes,
    products
  ].some((field) => includesText(field, query));
}

function hoursSince(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return null;
  return Math.max(0, Math.round((Date.now() - date.getTime()) / 36e5));
}

function compactList(items, limit = 10) {
  return items.slice(0, limit);
}

export const TOOLS = [
  {
    name: "get_unpaid_invoices",
    description: "Menampilkan invoice/AR yang belum lunas dari modul finance.",
    parameters: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Jumlah maksimal data, default 10" }
      }
    },
    isWriteAction: false,
    allowedRoles: ["direksi", "finance"],
    execute: async (args, ctx) => {
      const overview = await loadOverview(ctx);
      const limit = Number(args.limit || 10);
      const receivables = overview.finance?.receivables || [];
      const invoices = receivables
        .filter((invoice) => !["Paid", "Cancelled"].includes(invoice.status))
        .slice(0, limit)
        .map((invoice) => ({
          invoice_number: invoice.invoice_number,
          buyer_name: invoice.buyer_name,
          amount: invoice.amount,
          paid_amount: invoice.paid_amount || 0,
          currency: invoice.currency || "IDR",
          due_date: invoice.due_date,
          status: invoice.status
        }));

      return { invoices, total: invoices.length };
    }
  },
  {
    name: "get_buyer_history",
    description: "Melihat memory CRM buyer: inquiry lama, profil buyer, quotation, invoice/AR, status follow-up, dan rekomendasi langkah berikutnya.",
    parameters: {
      type: "object",
      properties: {
        buyerQuery: { type: "string", description: "Nama buyer, perusahaan, email, negara, WhatsApp, atau nomor invoice/quotation" },
        limit: { type: "number", description: "Jumlah maksimal data per kategori, default 8" }
      },
      required: ["buyerQuery"]
    },
    isWriteAction: false,
    allowedRoles: ["direksi", "finance", "marketing", "procurement"],
    execute: async (args, ctx) => {
      const overview = await loadOverview(ctx);
      const query = toLower(args.buyerQuery);
      const limit = Number(args.limit || 8);
      const inquiries = compactList((overview.inquiries || []).filter((item) => matchesBuyer(item, query)), limit);
      const buyerProfiles = compactList((overview.buyerProfiles || []).filter((item) => matchesBuyer(item, query)), limit);
      const quotations = compactList((overview.quotationRequests || []).filter((item) => matchesBuyer(item, query)), limit);
      const receivables = compactList((overview.finance?.receivables || []).filter((item) => matchesBuyer(item, query)), limit);

      const openFollowUps = inquiries
        .filter((item) => !["Converted", "Closed"].includes(item.status))
        .map((item) => ({
          id: item.id,
          name: item.full_name,
          company: item.company_name,
          status: item.status,
          priority: item.lead_priority,
          assigned_to: item.assigned_to || "",
          follow_up_deadline: item.follow_up_deadline || null,
          hours_since_inquiry: hoursSince(item.created_at)
        }));

      const unpaidInvoices = receivables.filter((item) => !["Paid", "Cancelled"].includes(item.status));
      const recommendation = unpaidInvoices.length
        ? "Follow up pembayaran invoice/AR yang belum lunas sebelum membuat penawaran baru."
        : openFollowUps.length
          ? "Prioritaskan follow-up buyer, cek kebutuhan produk, quantity, destination, lalu siapkan quotation."
          : quotations.length
            ? "Review quotation terakhir dan tawarkan update harga atau jadwal supply."
            : "Lengkapi profil buyer dan ajak buyer mengirim kebutuhan produk, quantity, dan destination.";

      return {
        query: args.buyerQuery,
        buyerProfiles,
        inquiries,
        quotations,
        receivables,
        openFollowUps,
        recommendation
      };
    }
  },
  {
    name: "get_supplier_overview",
    description: "Melihat ringkasan database pemasok. Hanya Dapi dan Pici yang boleh mengakses.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Nama pemasok, kota, kategori produk, atau status" },
        limit: { type: "number", description: "Jumlah maksimal data, default 10" }
      }
    },
    isWriteAction: false,
    allowedRoles: ["direksi", "procurement"],
    execute: async (args, ctx) => {
      if (!canReadSupplierData(ctx)) {
        return { denied: true, message: "Database pemasok hanya bisa dilihat oleh Dapi dan Pici." };
      }

      const overview = await loadOverview(ctx);
      const query = toLower(args.query || "");
      const suppliers = (overview.suppliers || [])
        .filter((supplier) => {
          if (!query) return true;
          return [
            supplier.supplier_name,
            supplier.company_name,
            supplier.contact_person,
            supplier.city,
            supplier.country,
            supplier.status,
            Array.isArray(supplier.product_categories) ? supplier.product_categories.join(" ") : "",
            Array.isArray(supplier.products) ? supplier.products.join(" ") : ""
          ].some((field) => includesText(field, query));
        })
        .slice(0, Number(args.limit || 10))
        .map((supplier) => ({
          supplier_name: supplier.supplier_name,
          company_name: supplier.company_name,
          city: supplier.city,
          country: supplier.country,
          products: supplier.products || [],
          capacity: supplier.capacity,
          lead_time: supplier.lead_time,
          quality_rating: supplier.quality_rating,
          status: supplier.status
        }));

      return { suppliers, total: suppliers.length };
    }
  },
  {
    name: "get_document_overview",
    description: "Melihat dokumen bisnis, dokumen legal, expiry date, owner, dan status dokumen.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Judul, tipe dokumen, owner, related name, atau status" },
        limit: { type: "number", description: "Jumlah maksimal data, default 10" }
      }
    },
    isWriteAction: false,
    allowedRoles: ["direksi", "finance", "marketing", "procurement", "sdm"],
    execute: async (args, ctx) => {
      const overview = await loadOverview(ctx);
      const query = toLower(args.query || "");
      const documents = (overview.businessDocuments || [])
        .filter((document) => {
          if (!query) return true;
          return [document.document_type, document.title, document.related_type, document.related_name, document.owner, document.status, document.notes].some((field) => includesText(field, query));
        })
        .slice(0, Number(args.limit || 10))
        .map((document) => ({
          title: document.title,
          type: document.document_type,
          related_name: document.related_name,
          status: document.status,
          expiry_date: document.expiry_date,
          owner: document.owner
        }));

      const expiringSoon = documents.filter((document) => {
        if (!document.expiry_date) return false;
        const days = (new Date(document.expiry_date).getTime() - Date.now()) / 864e5;
        return days >= 0 && days <= 30;
      });

      return { documents, expiringSoon, total: documents.length };
    }
  },
  {
    name: "get_attendance_summary",
    description: "Melihat ringkasan absensi hari ini atau tanggal tertentu.",
    parameters: {
      type: "object",
      properties: {
        date: { type: "string", description: "Tanggal YYYY-MM-DD, kosongkan untuk hari ini" }
      }
    },
    isWriteAction: false,
    allowedRoles: ["direksi", "sdm"],
    execute: async (args, ctx) => {
      const overview = await loadOverview(ctx);
      const date = args.date ? String(args.date).slice(0, 10) : new Date().toISOString().slice(0, 10);
      const records = (overview.attendanceRecords || []).filter((record) => normalizeDate(record.attendance_date) === date);
      const byStatus = records.reduce((acc, record) => {
        const status = record.status || "Unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      return {
        date,
        total: records.length,
        byStatus,
        records: records.slice(0, 20).map((record) => ({
          username: record.username,
          role: record.role,
          status: record.status,
          check_in_at: record.check_in_at,
          check_out_at: record.check_out_at,
          work_mode: record.work_mode,
          location: record.location
        }))
      };
    }
  },
  {
    name: "get_pending_approvals",
    description: "Melihat pekerjaan yang butuh persetujuan: expense pending, quotation draft, dan finance period lock.",
    parameters: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Jumlah maksimal data per kategori, default 10" }
      }
    },
    isWriteAction: false,
    allowedRoles: ["direksi", "finance"],
    execute: async (args, ctx) => {
      const overview = await loadOverview(ctx);
      const limit = Number(args.limit || 10);
      const expenses = compactList((overview.finance?.expenses || []).filter((item) => ["Draft", "Pending Approval"].includes(item.status)), limit);
      const quotations = compactList((overview.quotationRequests || []).filter((item) => ["New", "Draft", "Pending"].includes(item.status)), limit);
      const periodLocks = compactList((overview.finance?.financePeriodLocks || []).filter((item) => item.status === "Locked"), limit);

      return {
        total: expenses.length + quotations.length,
        expenses: expenses.map((item) => ({ id: item.id, vendor: item.vendor, category: item.expense_category, amount: item.amount, currency: item.currency, status: item.status })),
        quotations: quotations.map((item) => ({ id: item.id, buyer_name: item.buyer_name || item.full_name, product: item.product || item.product_interest, status: item.status, quotation_number: item.quotation_number })),
        periodLocks: periodLocks.map((item) => ({ period_label: item.period_label, date_from: item.date_from, date_to: item.date_to, status: item.status }))
      };
    }
  },
  {
    name: "get_finance_report_summary",
    description: "Melihat ringkasan laporan finance: pemasukan, pengeluaran, AR, AP, cash, dan budget.",
    parameters: {
      type: "object",
      properties: {
        period: { type: "string", description: "today, this_week, this_month, atau all" }
      }
    },
    isWriteAction: false,
    allowedRoles: ["direksi", "finance"],
    execute: async (args, ctx) => {
      const overview = await loadOverview(ctx);
      const finance = overview.finance || {};
      const period = String(args.period || "this_month");
      const revenues = (finance.revenues || []).filter((item) => dateMatchesPeriod(item.transaction_date || item.created_at, period));
      const expenses = (finance.expenses || []).filter((item) => dateMatchesPeriod(item.expense_date || item.created_at, period));
      const receivables = finance.receivables || [];
      const payables = finance.payables || [];
      const totalRevenue = revenues.reduce((sum, item) => sum + Number(item.total_revenue || item.amount || 0), 0);
      const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
      const unpaidAR = receivables.filter((item) => !["Paid", "Cancelled"].includes(item.status)).reduce((sum, item) => sum + Number(item.amount || 0) - Number(item.paid_amount || 0), 0);
      const unpaidAP = payables.filter((item) => !["Paid", "Cancelled"].includes(item.status)).reduce((sum, item) => sum + Number(item.amount || 0), 0);

      return {
        period,
        currency_note: "Ringkasan angka nominal mengikuti currency asli data. Konversi multi-currency belum otomatis.",
        totalRevenue,
        totalExpense,
        netProfit: totalRevenue - totalExpense,
        unpaidAR,
        unpaidAP,
        revenueCount: revenues.length,
        expenseCount: expenses.length,
        recentReports: compactList(finance.financialReports || [], 5)
      };
    }
  },
  {
    name: "get_company_reminders",
    description: "Melihat reminder operasional: follow-up lead, AR/AP jatuh tempo, dokumen expired, dan approval pending.",
    parameters: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Jumlah maksimal reminder, default 12" }
      }
    },
    isWriteAction: false,
    allowedRoles: ["direksi", "finance", "marketing", "procurement", "sdm"],
    execute: async (args, ctx) => {
      const overview = await loadOverview(ctx);
      const limit = Number(args.limit || 12);
      const today = new Date().toISOString().slice(0, 10);
      const reminders = [];

      (overview.inquiries || []).forEach((lead) => {
        if (lead.follow_up_deadline && lead.follow_up_deadline <= today && !["Converted", "Closed"].includes(lead.status)) {
          reminders.push({ type: "Follow Up Lead", title: lead.full_name || lead.company_name, due_date: lead.follow_up_deadline, priority: lead.lead_priority || "Medium" });
        }
      });

      (overview.finance?.receivables || []).forEach((invoice) => {
        if (invoice.due_date && invoice.due_date <= today && !["Paid", "Cancelled"].includes(invoice.status)) {
          reminders.push({ type: "AR Overdue", title: invoice.invoice_number || invoice.buyer_name, due_date: invoice.due_date, amount: invoice.amount, currency: invoice.currency });
        }
      });

      (overview.finance?.payables || []).forEach((payable) => {
        if (payable.due_date && payable.due_date <= today && !["Paid", "Cancelled"].includes(payable.status)) {
          reminders.push({ type: "AP Due", title: payable.invoice_number || payable.supplier_name, due_date: payable.due_date, amount: payable.amount, currency: payable.currency });
        }
      });

      (overview.businessDocuments || []).forEach((document) => {
        if (!document.expiry_date) return;
        const days = (new Date(document.expiry_date).getTime() - Date.now()) / 864e5;
        if (days >= 0 && days <= 30) {
          reminders.push({ type: "Document Expiry", title: document.title, due_date: document.expiry_date, owner: document.owner });
        }
      });

      return { reminders: reminders.slice(0, limit), total: reminders.length };
    }
  },
  {
    name: "get_users_summary",
    description: "Melihat ringkasan akun dashboard, role, dan status user.",
    parameters: {
      type: "object",
      properties: {
        limit: { type: "number", description: "Jumlah maksimal user, default 20" }
      }
    },
    isWriteAction: false,
    allowedRoles: ["direksi", "sdm"],
    execute: async (args, ctx) => {
      const data = await adminFetch(ctx, "/api/admin/users");
      const users = (data.users || []).slice(0, Number(args.limit || 20)).map((user) => ({
        username: user.username,
        role: user.role,
        source: user.source,
        is_active: user.is_active !== false
      }));
      const byRole = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});

      return { users, byRole, total: users.length };
    }
  },
  {
    name: "get_total_expenses",
    description: "Menghitung total pengeluaran pada periode tertentu.",
    parameters: {
      type: "object",
      properties: {
        period: { type: "string", description: "today, this_week, this_month, atau all" }
      },
      required: ["period"]
    },
    isWriteAction: false,
    allowedRoles: ["direksi", "finance"],
    execute: async (args, ctx) => {
      const overview = await loadOverview(ctx);
      const period = String(args.period || "this_month");
      const expenses = (overview.finance?.expenses || []).filter((expense) =>
        dateMatchesPeriod(expense.expense_date || expense.created_at, period)
      );
      const total = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

      return {
        total,
        currency: "IDR",
        count: expenses.length,
        breakdown: expenses.slice(0, 12).map((expense) => ({
          date: expense.expense_date,
          category: expense.expense_category,
          vendor: expense.vendor,
          amount: expense.amount,
          status: expense.status
        }))
      };
    }
  },
  {
    name: "get_new_prospects",
    description: "Menampilkan prospek/lead buyer baru dari CRM.",
    parameters: {
      type: "object",
      properties: {
        date: { type: "string", description: "Tanggal YYYY-MM-DD, kosongkan untuk hari ini" }
      }
    },
    isWriteAction: false,
    allowedRoles: ["direksi", "marketing", "procurement"],
    execute: async (args, ctx) => {
      const overview = await loadOverview(ctx);
      const date = args.date ? String(args.date).slice(0, 10) : new Date().toISOString().slice(0, 10);
      const prospects = (overview.inquiries || [])
        .filter((lead) => normalizeDate(lead.created_at) === date)
        .map((lead) => ({
          id: lead.id,
          name: lead.full_name,
          company: lead.company_name,
          country: lead.country,
          products: lead.products || [],
          status: lead.status,
          priority: lead.lead_priority
        }));

      return { prospects, total: prospects.length, date };
    }
  },
  {
    name: "search_invoice_by_client",
    description: "Mencari invoice finance berdasarkan nama buyer/perusahaan.",
    parameters: {
      type: "object",
      properties: {
        clientName: { type: "string", description: "Nama buyer atau perusahaan" }
      },
      required: ["clientName"]
    },
    isWriteAction: false,
    allowedRoles: ["direksi", "finance"],
    execute: async (args, ctx) => {
      const overview = await loadOverview(ctx);
      const query = String(args.clientName || "").toLowerCase();
      const invoices = (overview.finance?.receivables || []).filter((invoice) =>
        String(invoice.buyer_name || "").toLowerCase().includes(query) ||
        String(invoice.invoice_number || "").toLowerCase().includes(query)
      );

      return { invoices, total: invoices.length };
    }
  },
  {
    name: "create_expense",
    description: "Mencatat pengeluaran baru di modul finance. Harus dikonfirmasi user dulu.",
    parameters: {
      type: "object",
      properties: {
        amount: { type: "number", description: "Nominal pengeluaran" },
        category: { type: "string", description: "Kategori pengeluaran" },
        description: { type: "string", description: "Deskripsi tambahan" },
        vendor: { type: "string", description: "Vendor atau penerima pembayaran" }
      },
      required: ["amount", "category"]
    },
    isWriteAction: true,
    allowedRoles: ["direksi", "finance"],
    execute: async (args, ctx) => {
      return adminFetch(ctx, "/api/admin/finance/expenses", {
        method: "POST",
        body: JSON.stringify({
          expense_date: new Date().toISOString().slice(0, 10),
          expense_category: args.category || "Operational Expense",
          expense_subcategory: "",
          vendor: args.vendor || "",
          description: args.description || "Dicatat melalui Jarvis",
          amount: Number(args.amount || 0),
          currency: "IDR",
          payment_method: "",
          status: "Draft"
        })
      });
    }
  },
  {
    name: "add_prospect",
    description: "Menambahkan prospek/lead baru ke CRM. Harus dikonfirmasi user dulu.",
    parameters: {
      type: "object",
      properties: {
        companyName: { type: "string", description: "Nama perusahaan prospek" },
        contactName: { type: "string", description: "Nama kontak buyer" },
        whatsapp: { type: "string", description: "Nomor WhatsApp jika ada" },
        country: { type: "string", description: "Negara buyer jika ada" },
        notes: { type: "string", description: "Catatan tambahan" }
      },
      required: ["companyName"]
    },
    isWriteAction: true,
    allowedRoles: ["direksi", "marketing", "procurement"],
    execute: async (args, ctx) => {
      return adminFetch(ctx, "/api/admin/inquiries", {
        method: "POST",
        body: JSON.stringify({
          fullName: args.contactName || args.companyName,
          companyName: args.companyName,
          whatsapp: args.whatsapp || "",
          country: args.country || "",
          message: args.notes || "Prospek dibuat melalui Jarvis",
          source: "ai_employee"
        })
      });
    }
  }
];

export function getToolsForRole(role) {
  return TOOLS.filter((tool) => tool.allowedRoles.includes(role));
}

function getToolPermissions(name) {
  const toolPermissions = {
    get_unpaid_invoices: ["finance_access"],
    get_buyer_history: ["edit_leads", "edit_quotations", "finance_access"],
    get_supplier_overview: ["supplier_access", "crm_suppliers_view", "crm_suppliers_capacity", "crm_suppliers_contacts"],
    get_document_overview: ["documents_access"],
    get_attendance_summary: ["attendance_access"],
    get_pending_approvals: ["finance_manage_access"],
    get_finance_report_summary: ["finance_access"],
    get_company_reminders: ["activity_log", "edit_leads", "finance_access", "documents_access"],
    get_users_summary: ["user_management"],
    get_total_expenses: ["finance_access"],
    get_new_prospects: ["edit_leads"],
    search_invoice_by_client: ["finance_access"],
    create_expense: ["finance_access"],
    add_prospect: ["edit_leads"]
  };

  return toolPermissions[name] || [];
}

export function canUseTool(tool, ctx) {
  if (!tool) {
    return false;
  }

  if (tool.allowedRoles.includes(ctx.role)) {
    return true;
  }

  const permissions = new Set(ctx.permissions || []);
  return getToolPermissions(tool.name).some((permission) => permissions.has(permission));
}

export function getToolsForContext(ctx) {
  return TOOLS.filter((tool) => canUseTool(tool, ctx));
}

export function getToolByName(name) {
  return TOOLS.find((tool) => tool.name === name);
}
