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
          description: args.description || "Dicatat melalui GSN AI Employee",
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
          message: args.notes || "Prospek dibuat melalui GSN AI Employee",
          source: "ai_employee"
        })
      });
    }
  }
];

export function getToolsForRole(role) {
  return TOOLS.filter((tool) => tool.allowedRoles.includes(role));
}

export function getToolByName(name) {
  return TOOLS.find((tool) => tool.name === name);
}
