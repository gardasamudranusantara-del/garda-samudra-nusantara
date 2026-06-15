"use client";

import { useEffect, useMemo, useState } from "react";
import AIEmployeeWidget from "@/components/ai-employee/AIEmployeeWidget";
import ActivityModule from "@/components/admin/ActivityModule";
import AnalyticsModule from "@/components/admin/AnalyticsModule";
import AttendanceModule from "@/components/admin/AttendanceModule";
import { BuyersModule, DocumentsModule, SuppliersModule } from "@/components/admin/CrmModule";
import FinanceModule from "@/components/admin/FinanceModule";
import FinanceCashBank from "@/components/admin/finance/FinanceCashBank";
import FinanceOverview from "@/components/admin/finance/FinanceOverview";
import OwnerSummary from "@/components/admin/OwnerSummary";
import UsersModule from "@/components/admin/UsersModule";

const statuses = ["New", "Contacted", "Negotiation", "Quotation Sent", "Converted", "Closed"];
const priorities = ["All", "High", "Medium", "Low"];
const statusFilters = ["All", ...statuses];
const modules = ["Dashboard", "Leads", "Buyers", "Suppliers", "Documents", "Analytics", "Finance", "Attendance", "Admin"];
const statusLabels = {
  All: "Semua",
  New: "Baru",
  Contacted: "Sudah Dihubungi",
  Negotiation: "Negosiasi",
  "Quotation Sent": "Penawaran Terkirim",
  Converted: "Berhasil",
  Closed: "Ditutup",
  Draft: "Draf",
  Sent: "Terkirim",
  "Partially Paid": "Dibayar Sebagian",
  Paid: "Lunas",
  Overdue: "Lewat Jatuh Tempo",
  Cancelled: "Dibatalkan",
  Unpaid: "Belum Dibayar",
  Partial: "Sebagian",
  Approved: "Disetujui",
  Rejected: "Ditolak",
  "Pending Approval": "Menunggu Persetujuan",
  Active: "Aktif",
  Inactive: "Tidak Aktif",
  Recorded: "Tercatat",
  "Pending Review": "Menunggu Review",
  Preferred: "Utama",
  Backup: "Cadangan",
  Matched: "Cocok",
  Unmatched: "Belum Cocok",
  Reconciled: "Terekonsiliasi",
  Scheduled: "Terjadwal",
  Completed: "Selesai",
  Prepared: "Disiapkan",
  Submitted: "Dikirim",
  Expired: "Kedaluwarsa",
  Archived: "Diarsipkan"
};
const priorityLabels = {
  All: "Semua",
  High: "Tinggi",
  Medium: "Sedang",
  Low: "Rendah"
};
const moduleLabels = {
  Dashboard: "Dashboard",
  Leads: "Prospek",
  Buyers: "Pembeli",
  Suppliers: "Pemasok",
  Documents: "Dokumen",
  Investors: "Investor",
  Quotations: "Penawaran",
  Analytics: "Analitik",
  Finance: "Keuangan",
  Attendance: "Absensi",
  Activity: "Aktivitas",
  Settings: "Pengaturan",
  Users: "Pengguna",
  Admin: "Admin"
};
const adminShortcutModules = ["Quotations", "Investors", "Activity", "Settings", "Users"];
const erpSidebarGroups = [
  {
    title: "Dashboard",
    code: "DB",
    items: [{ label: "Dashboard", module: "Dashboard", description: "Ringkasan perhatian hari ini" }]
  },
  {
    title: "CRM",
    code: "CRM",
    items: [
      { label: "Prospek", module: "Leads", description: "Lead buyer dan follow-up" },
      { label: "Pembeli", module: "Buyers", description: "Database buyer aktif" },
      { label: "Pemasok", module: "Suppliers", description: "Database supplier", supplierOnly: true },
      { label: "Penawaran", module: "Quotations", description: "Quotation dan dokumen buyer" }
    ]
  },
  {
    title: "Keuangan",
    code: "FIN",
    financeOnly: true,
    items: [
      { label: "Ringkasan Keuangan", module: "Finance", description: "KPI finance utama" },
      { label: "Pemasukan", module: "Finance", financeTarget: "finance-revenue-form", description: "Catat pemasukan" },
      { label: "Pengeluaran", module: "Finance", financeTarget: "finance-expense-form", description: "Catat pengeluaran dan persetujuan" },
      { label: "Transfer", module: "Finance", financeTarget: "finance-cash-form", description: "Perpindahan dana internal" },
      { label: "Invoice", module: "Finance", financeTarget: "finance-ar-ap-form", description: "Invoice finance" },
      { label: "Tagihan", module: "Finance", financeTarget: "finance-ar-ap-form", description: "Tagihan vendor dan supplier" },
      { label: "Setor Tunai", module: "Finance", financeTarget: "finance-cash-form", description: "Kas masuk" },
      { label: "Tarik Tunai", module: "Finance", financeTarget: "finance-cash-form", description: "Kas keluar" },
      { label: "Saldo Perusahaan", module: "Finance", financeTarget: "finance-bank-form", description: "Bank dan kas" },
      { label: "Catatan Likuiditas", module: "Finance", financeTarget: "finance-report-form", description: "Catatan cash runway" },
      { label: "Faktur Pembeli", module: "Finance", financeTarget: "finance-ar-ap-form", description: "AR buyer" },
      { label: "Tagihan Pemasok", module: "Finance", financeTarget: "finance-ar-ap-form", description: "AP supplier" },
      { label: "Pembayaran Pembeli", module: "Finance", financeTarget: "finance-payment-form", description: "Pencocokan pembayaran buyer" },
      { label: "Pembayaran Pemasok", module: "Finance", financeTarget: "finance-payment-form", description: "Pembayaran supplier" },
      { label: "AP", module: "Finance", financeTarget: "finance-ar-ap-form", description: "Utang usaha" },
      { label: "AR", module: "Finance", financeTarget: "finance-ar-ap-form", description: "Piutang usaha" },
      { label: "Pajak", module: "Finance", financeTarget: "finance-tax-form", description: "PPN dan kepatuhan" },
      { label: "Dokumen Hukum", module: "Documents", description: "Legal document center" },
      { label: "Nilai Tukar", module: "Finance", financeTarget: "finance-tax-form", description: "Kurs dan mata uang" },
      { label: "Anggaran", module: "Finance", financeTarget: "finance-budget-form", description: "Budget planning" },
      { label: "Budget vs Aktual", module: "Finance", financeTarget: "finance-budget-form", description: "Kontrol realisasi" },
      { label: "Audit", module: "Finance", financeTarget: "finance-audit-form", description: "Audit finance" },
      { label: "Ringkasan Laporan", module: "Finance", financeTarget: "finance-report-form", description: "Laporan bulanan" },
      { label: "Ekspor PDF", module: "Finance", financeTarget: "finance-report-form", description: "Ekspor laporan PDF" },
      { label: "Ekspor Excel", module: "Finance", financeTarget: "finance-report-form", description: "Ekspor laporan Excel" },
      { label: "Ekspor CSV", module: "Finance", financeTarget: "finance-report-form", description: "Ekspor laporan CSV" },
      { label: "Riwayat Laporan", module: "Finance", financeTarget: "finance-report-form", description: "Riwayat laporan" }
    ]
  },
  {
    title: "Operasional",
    code: "OPS",
    items: [
      { label: "Dokumen", module: "Documents", description: "File operasional" },
      { label: "Aktivitas", module: "Activity", description: "Log pekerjaan terakhir" },
      { label: "Persetujuan", module: "Finance", financeTarget: "finance-expense-form", financeOnly: true, description: "Approval expense" },
      { label: "Analisis", module: "Analytics", description: "Insight website dan CRM" }
    ]
  },
  {
    title: "Investor",
    code: "INV",
    executiveOnly: true,
    items: [
      { label: "Investor Aktif", module: "Investors", description: "Pipeline investor" },
      { label: "Laporan Investor", module: "Finance", financeTarget: "finance-investor-form", description: "Report investor" },
      { label: "Dividen", module: "Investors", description: "Rencana dividen dan equity" }
    ]
  },
  {
    title: "SDM",
    code: "HR",
    items: [
      { label: "Absensi", module: "Attendance", description: "Check in dan rekap" },
      { label: "Pengguna", module: "Users", userManagerOnly: true, description: "Akun dashboard" },
      { label: "Role & Permission", module: "Users", userManagerOnly: true, description: "Hak akses internal" }
    ]
  },
  {
    title: "Pengaturan",
    code: "SET",
    executiveOnly: true,
    items: [
      { label: "Profil Perusahaan", module: "Settings", description: "Identitas GSN" },
      { label: "Notifikasi", module: "Settings", description: "Preferensi alert" },
      { label: "Integrasi", module: "Settings", description: "API dan automation" },
      { label: "Sistem", module: "Settings", description: "Konfigurasi admin" }
    ]
  }
];
const adminRoleOptions = [
  { value: "ceo", label: "CEO", description: "Akses owner penuh: kontrol perusahaan, keuangan, pengguna, pengaturan, hapus data, dan automation." },
  { value: "cso", label: "CSO", description: "Akses owner penuh: strategi, investor, keuangan, pengguna, pengaturan, hapus data, dan automation." },
  { value: "finance", label: "Finance", description: "Akses keuangan: laporan, approval, AR/AP, expense, dan export." },
  { value: "procurement", label: "Procurement", description: "Akses operasional pembelian dan dokumen procurement tanpa akses keuangan dan supplier database." },
  { value: "marketing", label: "Marketing", description: "Akses prospek, penawaran, analisis, aktivitas, dan download PDF tanpa akses keuangan." },
  { value: "hr", label: "HR", description: "Akses absensi, pengguna, catatan HR, dan aktivitas tanpa akses keuangan." },
  { value: "staff", label: "Staff", description: "Akses operasional terbatas sesuai kebutuhan kerja." },
  { value: "viewer", label: "Viewer", description: "Akses baca saja untuk memantau data tanpa mengubah record." }
];
const adminRoleDescriptions = Object.fromEntries(adminRoleOptions.map((role) => [role.value, role.description]));
const adminRoleLabels = Object.fromEntries(adminRoleOptions.map((role) => [role.value, role.label]));
const accessOptions = [
  { value: "edit_leads", label: "Prospek & CRM", description: "Melihat dan mengelola prospek buyer." },
  { value: "edit_quotations", label: "Penawaran", description: "Membuat dan mengubah quotation." },
  { value: "download_pdf", label: "Download PDF", description: "Mengunduh quotation dan dokumen PDF." },
  { value: "supplier_access", label: "Database Pemasok", description: "Melihat modul pemasok." },
  { value: "documents_access", label: "Dokumen", description: "Melihat dan mengelola dokumen bisnis." },
  { value: "analytics_access", label: "Analitik", description: "Melihat analitik website dan CRM." },
  { value: "finance_access", label: "Keuangan", description: "Melihat modul finance." },
  { value: "finance_manage_access", label: "Approval Finance", description: "Approval, closing, dan kontrol finance." },
  { value: "finance_export", label: "Export Finance", description: "Export laporan finance." },
  { value: "attendance_access", label: "Absensi", description: "Melihat dan memakai modul absensi." },
  { value: "activity_log", label: "Aktivitas", description: "Melihat log aktivitas dashboard." },
  { value: "user_management", label: "Pengguna", description: "Membuat, mengubah, dan menghapus user." },
  { value: "settings", label: "Pengaturan", description: "Mengubah profil perusahaan dan integrasi." },
  { value: "automation", label: "Automation", description: "Menjalankan automation internal." }
];
const defaultPermissionsByRole = {
  ceo: ["view", "edit_leads", "delete_leads", "edit_investors", "delete_investors", "edit_quotations", "delete_quotations", "download_pdf", "settings", "automation", "activity_log", "user_management", "finance_access", "finance_manage_access", "finance_export", "supplier_access", "attendance_access", "documents_access", "analytics_access"],
  cso: ["view", "edit_leads", "delete_leads", "edit_investors", "delete_investors", "edit_quotations", "delete_quotations", "download_pdf", "settings", "automation", "activity_log", "user_management", "finance_access", "finance_manage_access", "finance_export", "supplier_access", "attendance_access", "documents_access", "analytics_access"],
  owner: ["view", "edit_leads", "delete_leads", "edit_investors", "delete_investors", "edit_quotations", "delete_quotations", "download_pdf", "settings", "automation", "activity_log", "user_management", "finance_access", "finance_manage_access", "finance_export", "supplier_access", "attendance_access", "documents_access", "analytics_access"],
  finance: ["view", "download_pdf", "activity_log", "finance_access", "finance_manage_access", "finance_export", "documents_access"],
  procurement: ["view", "edit_leads", "edit_quotations", "download_pdf", "activity_log", "documents_access"],
  marketing: ["view", "edit_leads", "edit_quotations", "download_pdf", "activity_log", "analytics_access"],
  hr: ["view", "activity_log", "user_management", "attendance_access"],
  staff: ["view", "activity_log", "attendance_access"],
  viewer: ["view"]
};
const executiveRoleIds = ["ceo", "cso", "owner"];
const financeRoleIds = ["ceo", "cso", "owner", "finance"];
const userManagerRoleIds = ["ceo", "cso", "owner", "hr"];
const supplierAccessUsernames = ["dapi", "pici"];
const attendanceStatuses = ["Present", "Remote", "Field Visit", "Permission", "Sick", "Leave"];
const attendanceWorkModes = ["Office", "Remote", "Field", "Hybrid"];
const buyerStages = ["New", "Qualified", "Repeat Buyer", "Active", "Dormant", "Inactive"];
const relationshipStatuses = ["Prospect", "Warm", "Active", "Repeat", "Strategic", "Inactive"];
const supplierStatuses = ["Active", "Pending Review", "Preferred", "Backup", "Inactive"];
const documentTypes = ["Quotation", "Invoice", "Contract", "Packing List", "Certificate", "Legal", "Tax", "Payment Proof", "Supplier Document", "Other"];
const documentStatuses = ["Active", "Draft", "Pending Review", "Expired", "Archived"];
const financeMenus = [
  "Dashboard",
  "Kas & Bank",
  "Penjualan",
  "Pembelian",
  "Pajak & Legal",
  "Anggaran",
  "Laporan",
  "Audit"
];
const financeDisclosureTabs = [
  { id: "overview", label: "Dashboard Keuangan", hint: "KPI, pengingat, dan prioritas" },
  { id: "cash", label: "Kas & Bank", hint: "Kas, bank, dan kas kecil" },
  { id: "sales", label: "Penjualan", hint: "Pemasukan, invoice, dan AR" },
  { id: "purchase", label: "Pembelian", hint: "Pengeluaran, AP, dan pembayaran pemasok" },
  { id: "payment", label: "Pembayaran", hint: "Pencocokan dan rekonsiliasi" },
  { id: "compliance", label: "Pajak & Legal", hint: "Pajak, kurs, dan kepatuhan" },
  { id: "budget", label: "Anggaran", hint: "Anggaran vs aktual" },
  { id: "report", label: "Laporan", hint: "Ekspor dan riwayat" },
  { id: "audit", label: "Audit", hint: "Akses, storage, dan log" }
];
const financeCurrencies = ["IDR", "USD", "SGD"];
const cashInCategories = ["Founder Capital", "Investor Capital", "Sales Revenue", "Commission Revenue", "Other Income"];
const cashOutCategories = ["Operational", "Marketing", "Payroll", "Technology", "Logistics", "Travel", "Legal"];
const paymentMethods = ["Bank Transfer", "Cash", "Virtual Account", "Card", "E-Wallet", "Other"];
const receivableStatuses = ["Draft", "Sent", "Partially Paid", "Paid", "Overdue", "Cancelled"];
const payableStatuses = ["Unpaid", "Partial", "Paid", "Overdue"];
const expenseStatuses = ["Draft", "Pending Approval", "Approved", "Rejected"];
const budgetCategories = ["Operations", "Marketing", "Technology", "Human Resources", "Logistics", "Business Development", "Legal"];
const financialReportTypes = ["Profit & Loss Statement", "Cash Flow Statement", "Revenue Report", "Expense Report", "Budget Report", "Financial Summary"];
const financeTypeTables = {
  financeTransaction: "finance_transactions",
  bankAccount: "bank_accounts",
  pettyCash: "petty_cash",
  financeRevenue: "revenues",
  financeExpense: "expenses",
  financeReceivable: "receivables",
  financePayable: "payables",
  paymentMatch: "payment_matches",
  supplierPayment: "supplier_payments",
  taxRecord: "tax_records",
  exchangeRate: "exchange_rates",
  financeBudget: "budgets",
  financeReport: "financial_reports"
};
const financePeriodPresets = ["This Month", "This Quarter", "This Year", "Custom"];
const pettyCashStatuses = ["Recorded", "Reimburse", "Cash Opname", "Pending Review"];
const bankAccountStatuses = ["Active", "Inactive", "Closed"];
const paymentMatchStatuses = ["Matched", "Partial", "Unmatched", "Reconciled"];
const supplierPaymentStatuses = ["Scheduled", "Paid", "Partial", "Completed", "Cancelled"];
const taxTypes = ["PPN", "Withholding Tax", "Export Tax", "Income Tax", "Customs / Duty", "Other"];
const taxStatuses = ["Draft", "Prepared", "Submitted", "Paid", "Overdue"];
const expenseCatalog = {
  "Operational Expense": ["Office Supplies", "Internet", "Utilities", "Office Rent", "Bank Charges"],
  "Technology Expense": ["Domain", "Hosting", "CRM", "Supabase", "Cloud Services", "ChatGPT", "Canva", "Google Workspace"],
  "Marketing Expense": ["Meta Ads", "Google Ads", "LinkedIn Ads", "Content Creation", "Branding", "Marketplace Membership"],
  "Business Development Expense": ["Buyer Meeting", "Supplier Meeting", "Investor Meeting", "Travel", "Accommodation", "Business Lunch"],
  "Legal & Compliance Expense": ["Notary", "NIB", "Certification", "Legal Consultant", "Tax Consultant"],
  "Human Resources Expense": ["Salary", "Freelancer", "Recruitment", "Training"],
  "Logistics & Supply Chain Expense": ["Trucking", "Warehouse", "Freight", "Export Documents"],
  "Financial Expense": ["Transfer Fee", "Swift Fee", "Exchange Rate Difference"]
};
const expenseCategories = Object.keys(expenseCatalog);
const revenueCatalog = {
  "Garda Fresh": {
    "Fresh Vegetables": [
      "Cabbage", "Lettuce", "Water Spinach", "Carrot", "Sweet Corn", "Mustard Greens", "Potato", "Garlic",
      "Shallot", "Tomato", "Cassava", "Green Onion", "Red Chili Pepper", "Cucumber", "Bird's Eye Chili",
      "Pak Choi", "Yardlong Beans", "Aubergine", "Bitter Gourd", "Spinach", "Lemon Basil"
    ],
    Eggs: ["Horn Chicken Eggs", "Kampung Chicken Eggs", "Duck Eggs", "Quail Eggs"],
    Rice: ["Premium Rice 5kg", "Premium Rice 10kg", "Premium Rice 25kg", "Premium Rice 50kg"]
  },
  "Garda Green": {
    "Eco Energy Products": ["Coconut Shell Charcoal", "Charcoal Briquette", "Wood Pellet"]
  },
  "Garda Prime": {
    "Premium Indonesian Spices": [
      "Vanilla", "Cinnamon", "Nutmeg", "Cloves", "Black Pepper", "White Pepper", "Turmeric", "Ginger",
      "Galangal", "Coriander Seed", "Lemongrass", "Tamarind", "Kaffir Lime Leaf", "Patchouli"
    ]
  }
};
const revenueDivisions = Object.keys(revenueCatalog);
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

function parseListText(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

function listToText(value) {
  return Array.isArray(value) ? value.join(", ") : String(value || "");
}

function labelStatus(value) {
  return statusLabels[value] || value || "-";
}

function labelPriority(value) {
  return priorityLabels[value] || value || "-";
}

function labelAssignee(value) {
  return value || "Belum ditugaskan";
}

function formatAdminDisplayName(value) {
  const username = String(value || "admin").trim();
  const knownNames = {
    dapi: "Daffa",
    pici: "Pici"
  };
  return knownNames[username.toLowerCase()] || username.charAt(0).toUpperCase() + username.slice(1);
}

function getFinanceViewForTarget(target) {
  if (!target) {
    return "overview";
  }
  if (["finance-cash-form", "finance-bank-form"].includes(target)) {
    return "cash";
  }
  if (target === "finance-revenue-form") {
    return "sales";
  }
  if (target === "finance-expense-form") {
    return "purchase";
  }
  if (["finance-ar-ap-form", "finance-payment-form"].includes(target)) {
    return "payment";
  }
  if (target === "finance-tax-form") {
    return "compliance";
  }
  if (target === "finance-budget-form") {
    return "budget";
  }
  if (["finance-report-form", "finance-investor-form"].includes(target)) {
    return "report";
  }
  if (target === "finance-audit-form") {
    return "audit";
  }
  return "overview";
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

function parseAmount(value) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount : 0;
}

function formatMoney(value, currency = "IDR") {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "IDR" ? 0 : 2
  }).format(parseAmount(value));
}

function toDateInput(date) {
  return date.toISOString().slice(0, 10);
}

function getPeriodRange(preset) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  if (preset === "This Year") {
    return { from: `${year}-01-01`, to: `${year}-12-31` };
  }

  if (preset === "This Quarter") {
    const quarterStart = Math.floor(month / 3) * 3;
    const start = new Date(year, quarterStart, 1);
    const end = new Date(year, quarterStart + 3, 0);
    return { from: toDateInput(start), to: toDateInput(end) };
  }

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return { from: toDateInput(start), to: toDateInput(end) };
}

function isInDateRange(value, from, to) {
  if (!value) {
    return false;
  }

  const date = String(value).slice(0, 10);
  return (!from || date >= from) && (!to || date <= to);
}

function sumByCurrency(items, getter) {
  return financeCurrencies.reduce((total, currency) => {
    total[currency] = items
      .filter((item) => (item.currency || "IDR") === currency)
      .reduce((sum, item) => sum + parseAmount(getter(item)), 0);
    return total;
  }, {});
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

function downloadTextFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function makeFinanceReportRows(summary) {
  return [
    ["Metric", "Value", "Currency"],
    ["Total Revenue", summary.totalRevenue, summary.currency],
    ["Total Expenses", summary.totalExpenses, summary.currency],
    ["Net Profit", summary.netProfit, summary.currency],
    ["Cash In", summary.cashIn, summary.currency],
    ["Cash Out", summary.cashOut, summary.currency],
    ["Net Cash Flow", summary.netCashFlow, summary.currency],
    ["Accounts Receivable", summary.receivableOutstanding, summary.currency],
    ["Accounts Payable", summary.payableOutstanding, summary.currency],
    ["Budget Planned", summary.plannedBudget, summary.currency],
    ["Budget Actual", summary.actualBudget, summary.currency],
    ["Budget Remaining", summary.remainingBudget, summary.currency],
    ["Top Revenue Division", summary.topRevenueDivision, ""],
    ["Top Expense Category", summary.topExpenseCategory, ""]
  ];
}

function exportFinanceReportCsv(summary) {
  exportRowsCsv(
    `gsn-finance-report-${new Date().toISOString().slice(0, 10)}.csv`,
    ["Metric", "Value", "Currency"],
    makeFinanceReportRows(summary).slice(1)
  );
}

function exportFinanceReportExcel(summary, draft) {
  const rows = makeFinanceReportRows(summary);
  const htmlRows = rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("");
  downloadTextFile(
    `gsn-finance-report-${new Date().toISOString().slice(0, 10)}.xls`,
    `<html><head><meta charset="utf-8" /></head><body><h1>${escapeHtml(draft.title || "GSN Financial Report")}</h1><p>${escapeHtml(draft.report_type || "Financial Summary")}</p><table border="1">${htmlRows}</table></body></html>`,
    "application/vnd.ms-excel;charset=utf-8"
  );
}

function makeSavedReportDraft(report) {
  return {
    title: report.title || "GSN Financial Report",
    report_type: report.report_type || "Financial Summary",
    date_from: report.date_from || report.report_data?.dateFrom || "",
    date_to: report.date_to || report.report_data?.dateTo || ""
  };
}

function makeFinanceTransactionRows(transactions) {
  return transactions.map((item) => [
    item.transaction_date || item.created_at || "",
    item.transaction_type || "",
    item.category || "",
    item.description || "",
    item.amount || 0,
    item.currency || "IDR",
    item.payment_method || "",
    item.reference_number || "",
    item.created_by || ""
  ]);
}

function exportFinanceTransactionsCsv(transactions) {
  exportRowsCsv(
    `gsn-finance-transactions-${new Date().toISOString().slice(0, 10)}.csv`,
    ["Date", "Type", "Category", "Description", "Amount", "Currency", "Payment Method", "Reference", "Created By"],
    makeFinanceTransactionRows(transactions)
  );
}

function exportFinanceTransactionsExcel(transactions) {
  const rows = [
    ["Date", "Type", "Category", "Description", "Amount", "Currency", "Payment Method", "Reference", "Created By"],
    ...makeFinanceTransactionRows(transactions)
  ];
  const htmlRows = rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("");
  downloadTextFile(
    `gsn-finance-transactions-${new Date().toISOString().slice(0, 10)}.xls`,
    `<html><head><meta charset="utf-8" /></head><body><h1>GSN Finance Transactions</h1><p>Generated ${escapeHtml(new Date().toLocaleDateString())}</p><table border="1">${htmlRows}</table></body></html>`,
    "application/vnd.ms-excel;charset=utf-8"
  );
}

function printFinanceTransactions(transactions) {
  const rows = makeFinanceTransactionRows(transactions).map((row) => `
    <tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>
  `).join("");
  const popup = window.open("", "_blank", "width=1000,height=900");
  if (!popup) {
    return;
  }
  popup.document.write(`
    <html>
      <head>
        <title>GSN Finance Transactions</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 32px; color: #111827; }
          header { display: flex; justify-content: space-between; border-bottom: 3px solid #6d5dfc; padding-bottom: 18px; margin-bottom: 24px; }
          h1 { margin: 0; color: #26105f; }
          table { border-collapse: collapse; width: 100%; font-size: 12px; }
          th { background: #26105f; color: #fff; text-align: left; }
          th, td { border-bottom: 1px solid #d7d7e4; padding: 10px; }
        </style>
      </head>
      <body>
        <header><div><strong>Garda Samudra Nusantara</strong><h1>Finance Transactions</h1></div><div>Generated<br/>${escapeHtml(new Date().toLocaleDateString())}</div></header>
        <table>
          <thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Description</th><th>Amount</th><th>Currency</th><th>Payment</th><th>Reference</th><th>Created By</th></tr></thead>
          <tbody>${rows || "<tr><td colspan='9'>No transactions</td></tr>"}</tbody>
        </table>
        <script>window.print();</script>
      </body>
    </html>
  `);
  popup.document.close();
}

function printFinanceReport(summary, draft) {
  const breakdownRows = (title, rows) => `
    <h2>${title}</h2>
    <table>
      ${Object.entries(rows).map(([name, value]) => `<tr><td>${name}</td><td>${formatMoney(value, summary.currency)}</td></tr>`).join("") || "<tr><td>No data</td><td>-</td></tr>"}
    </table>
  `;
  const metrics = makeFinanceReportRows(summary).slice(1).map(([metric, value, currency]) => `
    <tr><td>${metric}</td><td>${typeof value === "number" ? formatMoney(value, currency || summary.currency) : value}</td></tr>
  `).join("");
  const popup = window.open("", "_blank", "width=900,height=1100");
  if (!popup) {
    return;
  }
  popup.document.write(`
    <html>
      <head>
        <title>${draft.title || "GSN Financial Report"}</title>
        <style>
          body{font-family:Arial,sans-serif;color:#172033;padding:42px;}
          header{display:flex;justify-content:space-between;gap:24px;border-bottom:6px solid #6b4dff;padding-bottom:22px;margin-bottom:24px;}
          h1{margin:0;font-size:32px;color:#1f2460;} h2{margin:24px 0 10px;color:#1f2460;font-size:18px;}
          p{color:#667085;} table{width:100%;border-collapse:collapse;margin-top:8px;} td,th{border-bottom:1px solid #d9dce8;padding:12px;text-align:left;} td:last-child{text-align:right;font-weight:700;}
          .total{margin-top:24px;background:#6b4dff;color:white;padding:18px 20px;text-align:right;font-size:22px;font-weight:800;}
        </style>
      </head>
      <body>
        <header><div><strong>Garda Samudra Nusantara</strong><h1>${draft.title || "Financial Report"}</h1><p>${draft.report_type || "Financial Summary"} | ${draft.date_from || "-"} to ${draft.date_to || "-"}</p></div><div>Generated<br/>${new Date().toLocaleDateString()}</div></header>
        <table>${metrics}</table>
        <div class="total">Net Profit: ${formatMoney(summary.netProfit, summary.currency)}</div>
        ${breakdownRows("Revenue Breakdown", summary.revenueByDivision)}
        ${breakdownRows("Expense Breakdown", summary.expenseByCategory)}
        <script>window.print();</script>
      </body>
    </html>
  `);
  popup.document.close();
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

function isFinanceActivity(activity) {
  const metadata = activity.metadata || {};
  const auditText = [
    metadata.action,
    metadata.referenceType,
    activity.path,
    activity.label
  ].filter(Boolean).join(" ");

  return /finance|expense|revenue|receivable|payable|payment|supplier|tax|compliance|exchange|budget|bank|petty|attachment/i.test(auditText);
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

function getFinanceInvoiceNumber(quotation = {}) {
  if (quotation.quotation_number) {
    return quotation.quotation_number.replace("GSN-QTN", "GSN-INV");
  }
  return `GSN-INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
}

function makeFinanceNumber(prefix, index, year = new Date().getFullYear()) {
  return `${prefix}-${year}-${String(index).padStart(4, "0")}`;
}

function getNextFinanceNumber(records = [], prefix = "GSN-INV") {
  const year = new Date().getFullYear();
  const existing = records
    .map((item) => String(item.invoice_number || ""))
    .map((value) => value.match(new RegExp(`^${prefix}-${year}-(\\d{4})$`))?.[1])
    .filter(Boolean)
    .map((value) => Number(value));
  return makeFinanceNumber(prefix, existing.length ? Math.max(...existing) + 1 : records.length + 1, year);
}

function daysUntil(value) {
  if (!value) {
    return null;
  }

  const today = new Date(new Date().toISOString().slice(0, 10)).getTime();
  const target = new Date(String(value).slice(0, 10)).getTime();
  if (Number.isNaN(target)) {
    return null;
  }

  return Math.ceil((target - today) / 86400000);
}

function isPreviewableImage(url = "") {
  return /\.(png|jpe?g|webp)(\?.*)?$/i.test(String(url));
}

function getDocumentName(url = "") {
  const clean = String(url).split("?")[0];
  const name = clean.split("/").pop() || "Finance document";
  return decodeURIComponent(name).replace(/^\d+-/, "");
}

function getQuotationProductsText(quotation = {}) {
  if (Array.isArray(quotation.products) && quotation.products.length) {
    return quotation.products.join(", ");
  }
  return quotation.product_details || quotation.request_summary || "Quoted products";
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

function buyerProfileToDraft(item = {}) {
  return {
    buyer_name: item.buyer_name || "",
    company_name: item.company_name || "",
    email: item.email || "",
    whatsapp: item.whatsapp || "",
    country: item.country || "",
    city: item.city || "",
    preferred_division: item.preferred_division || "",
    products: listToText(item.products),
    buyer_stage: item.buyer_stage || "New",
    relationship_status: item.relationship_status || "Prospect",
    assigned_to: item.assigned_to || "",
    total_inquiries: String(item.total_inquiries ?? ""),
    total_quotations: String(item.total_quotations ?? ""),
    notes: item.notes || ""
  };
}

function supplierToDraft(item = {}) {
  return {
    supplier_name: item.supplier_name || "",
    company_name: item.company_name || "",
    contact_person: item.contact_person || "",
    email: item.email || "",
    whatsapp: item.whatsapp || "",
    country: item.country || "Indonesia",
    city: item.city || "",
    product_categories: listToText(item.product_categories),
    products: listToText(item.products),
    capacity: item.capacity || "",
    payment_terms: item.payment_terms || "",
    lead_time: item.lead_time || "",
    quality_rating: String(item.quality_rating ?? ""),
    status: item.status || "Active",
    notes: item.notes || ""
  };
}

function businessDocumentToDraft(item = {}) {
  return {
    document_type: item.document_type || "General",
    title: item.title || "",
    related_type: item.related_type || "",
    related_name: item.related_name || "",
    file_url: item.file_url || "",
    status: item.status || "Active",
    expiry_date: String(item.expiry_date || "").slice(0, 10),
    owner: item.owner || "",
    notes: item.notes || ""
  };
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

function financeTransactionToDraft(item = {}) {
  return {
    transaction_type: item.transaction_type || "Cash In",
    transaction_date: String(item.transaction_date || "").slice(0, 10),
    category: item.category || "",
    description: item.description || "",
    amount: String(item.amount ?? ""),
    currency: item.currency || "IDR",
    payment_method: item.payment_method || "",
    reference_number: item.reference_number || ""
  };
}

function bankAccountToDraft(item = {}) {
  return {
    account_name: item.account_name || "",
    bank_name: item.bank_name || "",
    account_number: item.account_number || "",
    currency: item.currency || "IDR",
    current_balance: String(item.current_balance ?? ""),
    status: item.status || "Active"
  };
}

function pettyCashToDraft(item = {}) {
  return {
    cash_date: String(item.cash_date || "").slice(0, 10),
    description: item.description || "",
    amount: String(item.amount ?? ""),
    currency: item.currency || "IDR",
    responsible_person: item.responsible_person || "",
    status: item.status || "Recorded"
  };
}

function financeRevenueToDraft(item = {}) {
  return {
    invoice_number: item.invoice_number || "",
    buyer_name: item.buyer_name || "",
    country: item.country || "",
    division: item.division || "",
    category: item.category || "",
    product: item.product || "",
    quantity: String(item.quantity ?? ""),
    unit: item.unit || "",
    unit_price: String(item.unit_price ?? ""),
    currency: item.currency || "IDR",
    total_revenue: String(item.total_revenue ?? ""),
    transaction_date: String(item.transaction_date || "").slice(0, 10),
    status: item.status || "Recorded"
  };
}

function financeExpenseToDraft(item = {}) {
  return {
    expense_date: String(item.expense_date || "").slice(0, 10),
    expense_category: item.expense_category || "",
    expense_subcategory: item.expense_subcategory || "",
    vendor: item.vendor || "",
    description: item.description || "",
    amount: String(item.amount ?? ""),
    currency: item.currency || "IDR",
    payment_method: item.payment_method || "",
    receipt_url: item.receipt_url || "",
    status: item.status || "Draft"
  };
}

function financeReceivableToDraft(item = {}) {
  return {
    invoice_number: item.invoice_number || "",
    invoice_date: String(item.invoice_date || "").slice(0, 10),
    quotation_id: item.quotation_id || "",
    quotation_number: item.quotation_number || "",
    buyer_name: item.buyer_name || "",
    commodity: item.commodity || "",
    amount: String(item.amount ?? ""),
    paid_amount: String(item.paid_amount ?? ""),
    currency: item.currency || "IDR",
    due_date: String(item.due_date || "").slice(0, 10),
    status: item.status || "Draft"
  };
}

function financePayableToDraft(item = {}) {
  return {
    supplier_name: item.supplier_name || "",
    commodity: item.commodity || "",
    invoice_number: item.invoice_number || "",
    amount: String(item.amount ?? ""),
    currency: item.currency || "IDR",
    due_date: String(item.due_date || "").slice(0, 10),
    status: item.status || "Unpaid"
  };
}

function paymentMatchToDraft(item = {}) {
  return {
    payment_date: String(item.payment_date || "").slice(0, 10),
    invoice_number: item.invoice_number || "",
    buyer_name: item.buyer_name || "",
    amount: String(item.amount ?? ""),
    currency: item.currency || "IDR",
    payment_method: item.payment_method || "",
    proof_url: item.proof_url || "",
    status: item.status || "Matched",
    notes: item.notes || ""
  };
}

function supplierPaymentToDraft(item = {}) {
  return {
    payment_date: String(item.payment_date || "").slice(0, 10),
    supplier_name: item.supplier_name || "",
    supplier_account: item.supplier_account || "",
    invoice_number: item.invoice_number || "",
    amount: String(item.amount ?? ""),
    currency: item.currency || "IDR",
    payment_method: item.payment_method || "",
    proof_url: item.proof_url || "",
    status: item.status || "Scheduled",
    notes: item.notes || ""
  };
}

function taxRecordToDraft(item = {}) {
  return {
    tax_period: item.tax_period || "",
    tax_type: item.tax_type || "PPN",
    reference_number: item.reference_number || "",
    taxable_amount: String(item.taxable_amount ?? ""),
    tax_amount: String(item.tax_amount ?? ""),
    currency: item.currency || "IDR",
    document_url: item.document_url || "",
    due_date: String(item.due_date || "").slice(0, 10),
    status: item.status || "Draft",
    notes: item.notes || ""
  };
}

function exchangeRateToDraft(item = {}) {
  return {
    rate_date: String(item.rate_date || "").slice(0, 10),
    base_currency: item.base_currency || "IDR",
    target_currency: item.target_currency || "USD",
    rate: String(item.rate ?? ""),
    source: item.source || "",
    notes: item.notes || ""
  };
}

function financeBudgetToDraft(item = {}) {
  return {
    fiscal_year: String(item.fiscal_year || new Date().getFullYear()),
    budget_category: item.budget_category || "Operations",
    planned_budget: String(item.planned_budget ?? ""),
    actual_spending: String(item.actual_spending ?? ""),
    currency: item.currency || "IDR"
  };
}

function financeReportToDraft(item = {}) {
  return {
    report_type: item.report_type || "Financial Summary",
    title: item.title || "",
    date_from: String(item.date_from || "").slice(0, 10),
    date_to: String(item.date_to || "").slice(0, 10)
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
  const [activeModule, setActiveModule] = useState("Dashboard");
  const [showFinanceDetail, setShowFinanceDetail] = useState(false);
  const [financeView, setFinanceView] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedSidebarGroup, setExpandedSidebarGroup] = useState("CRM");
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState(defaultSettings);
  const [modal, setModal] = useState(null);
  const [userAccounts, setUserAccounts] = useState([]);
  const [userDraft, setUserDraft] = useState({ username: "", password: "", role: "marketing", permissions: defaultPermissionsByRole.marketing });
  const [attendanceDraft, setAttendanceDraft] = useState({
    status: "Present",
    work_mode: "Office",
    location: "",
    notes: ""
  });
  const [buyerDraft, setBuyerDraft] = useState({
    buyer_name: "",
    company_name: "",
    email: "",
    whatsapp: "",
    country: "",
    city: "",
    preferred_division: "Garda Fresh",
    products: "",
    buyer_stage: "New",
    relationship_status: "Prospect",
    assigned_to: "",
    notes: ""
  });
  const [supplierDraft, setSupplierDraft] = useState({
    supplier_name: "",
    company_name: "",
    contact_person: "",
    email: "",
    whatsapp: "",
    country: "Indonesia",
    city: "",
    product_categories: "",
    products: "",
    capacity: "",
    payment_terms: "",
    lead_time: "",
    quality_rating: "",
    status: "Active",
    notes: ""
  });
  const [documentDraft, setDocumentDraft] = useState({
    document_type: "Contract",
    title: "",
    related_type: "Buyer",
    related_name: "",
    file_url: "",
    status: "Active",
    expiry_date: "",
    owner: "",
    notes: ""
  });
  const [financeDraft, setFinanceDraft] = useState({
    transaction_type: "Cash In",
    transaction_date: new Date().toISOString().slice(0, 10),
    category: "Founder Capital",
    description: "",
    amount: "",
    currency: "IDR",
    payment_method: "Bank Transfer",
    reference_number: ""
  });
  const [bankAccountDraft, setBankAccountDraft] = useState({
    account_name: "",
    bank_name: "",
    account_number: "",
    currency: "IDR",
    current_balance: "",
    status: "Active"
  });
  const [pettyCashDraft, setPettyCashDraft] = useState({
    cash_date: new Date().toISOString().slice(0, 10),
    description: "",
    amount: "",
    currency: "IDR",
    responsible_person: "",
    status: "Recorded"
  });
  const [revenueDraft, setRevenueDraft] = useState({
    invoice_number: "",
    buyer_name: "",
    country: "",
    division: "Garda Fresh",
    category: "Fresh Vegetables",
    product: "Cabbage",
    quantity: "",
    unit: "kg",
    unit_price: "",
    currency: "IDR",
    total_revenue: "",
    transaction_date: new Date().toISOString().slice(0, 10),
    status: "Recorded"
  });
  const [expenseDraft, setExpenseDraft] = useState({
    expense_date: new Date().toISOString().slice(0, 10),
    expense_category: "Operational Expense",
    expense_subcategory: "Office Supplies",
    vendor: "",
    description: "",
    amount: "",
    currency: "IDR",
    payment_method: "Bank Transfer",
    receipt_url: "",
    status: "Draft"
  });
  const [receivableDraft, setReceivableDraft] = useState({
    invoice_number: "",
    invoice_date: new Date().toISOString().slice(0, 10),
    quotation_id: "",
    quotation_number: "",
    buyer_name: "",
    commodity: "",
    amount: "",
    paid_amount: "",
    currency: "IDR",
    due_date: "",
    status: "Draft"
  });
  const [financeInvoiceDraft, setFinanceInvoiceDraft] = useState({
    quotation_id: "",
    quotation_number: "",
    invoice_number: "",
    invoice_date: new Date().toISOString().slice(0, 10),
    buyer_name: "",
    commodity: "",
    amount: "",
    currency: "IDR",
    due_date: ""
  });
  const [payableDraft, setPayableDraft] = useState({
    supplier_name: "",
    commodity: "",
    invoice_number: "",
    amount: "",
    currency: "IDR",
    due_date: "",
    status: "Unpaid"
  });
  const [paymentMatchDraft, setPaymentMatchDraft] = useState({
    payment_date: new Date().toISOString().slice(0, 10),
    receivable_id: "",
    invoice_number: "",
    buyer_name: "",
    amount: "",
    currency: "IDR",
    payment_method: "Bank Transfer",
    proof_url: "",
    status: "Matched",
    notes: ""
  });
  const [supplierPaymentDraft, setSupplierPaymentDraft] = useState({
    payment_date: new Date().toISOString().slice(0, 10),
    payable_id: "",
    supplier_name: "",
    supplier_account: "",
    invoice_number: "",
    amount: "",
    currency: "IDR",
    payment_method: "Bank Transfer",
    proof_url: "",
    status: "Scheduled",
    notes: ""
  });
  const [taxDraft, setTaxDraft] = useState({
    tax_period: new Date().toISOString().slice(0, 7),
    tax_type: "PPN",
    reference_number: "",
    taxable_amount: "",
    tax_amount: "",
    currency: "IDR",
    document_url: "",
    due_date: "",
    status: "Draft",
    notes: ""
  });
  const [exchangeRateDraft, setExchangeRateDraft] = useState({
    rate_date: new Date().toISOString().slice(0, 10),
    base_currency: "IDR",
    target_currency: "USD",
    rate: "",
    source: "",
    notes: ""
  });
  const [budgetDraft, setBudgetDraft] = useState({
    fiscal_year: String(new Date().getFullYear()),
    budget_category: "Operations",
    planned_budget: "",
    actual_spending: "",
    currency: "IDR"
  });
  const [financialReportDraft, setFinancialReportDraft] = useState({
    report_type: "Financial Summary",
    title: "GSN Financial Summary",
    period_preset: "This Month",
    date_from: getPeriodRange("This Month").from,
    date_to: getPeriodRange("This Month").to
  });
  const [financeLockDraft, setFinanceLockDraft] = useState({
    period_label: new Date().toISOString().slice(0, 7),
    date_from: getPeriodRange("This Month").from,
    date_to: getPeriodRange("This Month").to,
    lock_note: ""
  });
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
  const [financeAuditFilters, setFinanceAuditFilters] = useState({
    admin: "All",
    action: "All",
    from: "",
    to: ""
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    setSidebarCollapsed(window.localStorage.getItem("gsn_admin_sidebar_collapsed") === "true");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem("gsn_admin_sidebar_collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  useEffect(() => {
    function handleShortcut(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
      if (event.key === "Escape") {
        setCommandOpen(false);
        setProfileMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);
  const [uploadingFinanceField, setUploadingFinanceField] = useState("");
  const [expenseApprovalDraft, setExpenseApprovalDraft] = useState({ id: "", status: "", note: "" });
  const [storageStatus, setStorageStatus] = useState(null);

  function authHeaders(activeCredentials = savedCredentials || credentials) {
    if (activeCredentials?.session) {
      return {
        "x-admin-session": activeCredentials.session
      };
    }

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

      const sessionCredentials = {
        username: result.admin?.username || credentials.username,
        role: result.admin?.role || "owner",
        session: result.session
      };
      setSavedCredentials(sessionCredentials);
      setAdminProfile(result.admin || { username: credentials.username, role: "owner" });
      await loadDashboard(sessionCredentials);
      if (userManagerRoleIds.includes(result.admin?.role || "owner")) {
        await loadUsers(sessionCredentials);
      }
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setSavedCredentials(null);
    setAdminProfile(null);
    setData(null);
    setSelected(null);
    setNotice("");
    setCommandOpen(false);
    setProfileMenuOpen(false);
    setNotificationsOpen(false);
    setCredentials({ username: "", password: "" });
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

  async function saveAttendance(action) {
    const response = await fetch("/api/admin/attendance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(savedCredentials)
      },
      body: JSON.stringify({
        ...attendanceDraft,
        action,
        attendance_date: new Date().toISOString().slice(0, 10)
      })
    });
    const result = await response.json();

    if (!response.ok) {
      setNotice(result.message || "Unable to save attendance. Run the latest Supabase schema first.");
      return;
    }

    setNotice(action === "check_out" ? "Check-out saved." : "Check-in saved.");
    await loadDashboard(savedCredentials);
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
    setUserDraft({ username: "", password: "", role: "marketing", permissions: defaultPermissionsByRole.marketing });
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

  async function saveBuyerProfile() {
    const response = await fetch("/api/admin/buyers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(savedCredentials)
      },
      body: JSON.stringify({
        ...buyerDraft,
        products: parseListText(buyerDraft.products)
      })
    });
    const result = await response.json();

    if (!response.ok) {
      setNotice(result.message || "Unable to save buyer profile.");
      return;
    }

    setBuyerDraft({
      buyer_name: "",
      company_name: "",
      email: "",
      whatsapp: "",
      country: "",
      city: "",
      preferred_division: "Garda Fresh",
      products: "",
      buyer_stage: "New",
      relationship_status: "Prospect",
      assigned_to: "",
      notes: ""
    });
    setNotice("Buyer profile saved.");
    await loadDashboard(savedCredentials);
  }

  async function saveSupplier() {
    const response = await fetch("/api/admin/suppliers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(savedCredentials)
      },
      body: JSON.stringify({
        ...supplierDraft,
        product_categories: parseListText(supplierDraft.product_categories),
        products: parseListText(supplierDraft.products)
      })
    });
    const result = await response.json();

    if (!response.ok) {
      setNotice(result.message || "Unable to save supplier.");
      return;
    }

    setSupplierDraft({
      supplier_name: "",
      company_name: "",
      contact_person: "",
      email: "",
      whatsapp: "",
      country: "Indonesia",
      city: "",
      product_categories: "",
      products: "",
      capacity: "",
      payment_terms: "",
      lead_time: "",
      quality_rating: "",
      status: "Active",
      notes: ""
    });
    setNotice("Supplier profile saved.");
    await loadDashboard(savedCredentials);
  }

  async function saveBusinessDocument() {
    const response = await fetch("/api/admin/documents", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(savedCredentials)
      },
      body: JSON.stringify(documentDraft)
    });
    const result = await response.json();

    if (!response.ok) {
      setNotice(result.message || "Unable to save document.");
      return;
    }

    setDocumentDraft({
      document_type: "Contract",
      title: "",
      related_type: "Buyer",
      related_name: "",
      file_url: "",
      status: "Active",
      expiry_date: "",
      owner: "",
      notes: ""
    });
    setNotice("Business document saved.");
    await loadDashboard(savedCredentials);
  }

  async function updateMasterRecord(type, id, updates) {
    const endpoints = {
      buyerProfile: "buyers",
      supplier: "suppliers",
      businessDocument: "documents"
    };
    const endpoint = endpoints[type];
    if (!endpoint) {
      return false;
    }

    const response = await fetch(`/api/admin/${endpoint}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(savedCredentials)
      },
      body: JSON.stringify(updates)
    });
    const result = await response.json();

    if (!response.ok) {
      setNotice(result.message || "Unable to update record.");
      return false;
    }

    await loadDashboard(savedCredentials);
    return true;
  }

  async function deleteMasterRecord(type, id) {
    const endpoints = {
      buyerProfile: "buyers",
      supplier: "suppliers",
      businessDocument: "documents"
    };
    const endpoint = endpoints[type];
    if (!endpoint) {
      return false;
    }

    const response = await fetch(`/api/admin/${endpoint}/${id}`, {
      method: "DELETE",
      headers: authHeaders(savedCredentials)
    });
    const result = await response.json();

    if (!response.ok) {
      setNotice(result.message || "Unable to delete record.");
      return false;
    }

    await loadDashboard(savedCredentials);
    return true;
  }

  function openModal(type, item) {
    const drafts = {
      buyerProfile: buyerProfileToDraft,
      supplier: supplierToDraft,
      businessDocument: businessDocumentToDraft,
      lead: leadToDraft,
      investor: investorToDraft,
      quotation: quotationToDraft,
      financeTransaction: financeTransactionToDraft,
      bankAccount: bankAccountToDraft,
      pettyCash: pettyCashToDraft,
      financeRevenue: financeRevenueToDraft,
      financeExpense: financeExpenseToDraft,
      financeReceivable: financeReceivableToDraft,
      financePayable: financePayableToDraft,
      paymentMatch: paymentMatchToDraft,
      supplierPayment: supplierPaymentToDraft,
      taxRecord: taxRecordToDraft,
      exchangeRate: exchangeRateToDraft,
      financeBudget: financeBudgetToDraft,
      financeReport: financeReportToDraft
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
      return;
    }

    if (["buyerProfile", "supplier", "businessDocument"].includes(modal.type)) {
      const draft = { ...modal.draft };
      if (modal.type === "buyerProfile") {
        draft.products = parseListText(draft.products);
      }
      if (modal.type === "supplier") {
        draft.product_categories = parseListText(draft.product_categories);
        draft.products = parseListText(draft.products);
      }
      const ok = await updateMasterRecord(modal.type, modal.item.id, draft);
      if (ok) {
        setModal(null);
        setNotice("Record updated.");
      }
      return;
    }

    if (financeTypeTables[modal.type]) {
      const ok = await updateFinanceRecord(modal.type, modal.item.id, modal.draft);
      if (ok) {
        setModal(null);
        setNotice("Finance record updated.");
      }
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
    if (["buyerProfile", "supplier", "businessDocument"].includes(modal.type)) {
      const ok = await deleteMasterRecord(modal.type, modal.item.id);
      if (!ok) {
        return;
      }
    }
    if (financeTypeTables[modal.type]) {
      const ok = await deleteFinanceRecord(modal.type, modal.item.id);
      if (!ok) {
        return;
      }
    }
    setModal(null);
  }

  async function updateFinanceRecord(type, id, updates) {
    const table = financeTypeTables[type];
    if (!table) {
      return;
    }

    const response = await fetch(`/api/admin/finance/records/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(savedCredentials)
      },
      body: JSON.stringify({ table, updates })
    });
    const result = await response.json();

    if (!response.ok) {
      setNotice(result.message || "Unable to update finance record.");
      return false;
    }

    await loadDashboard(savedCredentials);
    return true;
  }

  async function deleteFinanceRecord(type, id) {
    const table = financeTypeTables[type];
    if (!table) {
      return;
    }

    const response = await fetch(`/api/admin/finance/records/${id}?table=${encodeURIComponent(table)}`, {
      method: "DELETE",
      headers: authHeaders(savedCredentials)
    });
    const result = await response.json();

    if (!response.ok) {
      setNotice(result.message || "Unable to delete finance record.");
      return false;
    }

    await loadDashboard(savedCredentials);
    return true;
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

  async function saveFinanceTransaction() {
    setNotice("");

    const response = await fetch("/api/admin/finance/transactions", {
      method: "POST",
      headers: {
        ...authHeaders(savedCredentials),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(financeDraft)
    });
    const result = await response.json();

    if (!response.ok) {
      setNotice(result.message || "Unable to save finance transaction.");
      return;
    }

    setNotice("Finance transaction saved.");
    setFinanceDraft((current) => ({
      ...current,
      transaction_date: new Date().toISOString().slice(0, 10),
      description: "",
      amount: "",
      reference_number: ""
    }));
    await loadDashboard(savedCredentials);
  }

  async function saveBankAccount() {
    setNotice("");

    const response = await fetch("/api/admin/finance/bank-accounts", {
      method: "POST",
      headers: {
        ...authHeaders(savedCredentials),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bankAccountDraft)
    });
    const result = await response.json();

    if (!response.ok) {
      setNotice(result.message || "Unable to save bank account.");
      return;
    }

    setNotice("Bank account saved.");
    setBankAccountDraft((current) => ({
      ...current,
      account_name: "",
      bank_name: "",
      account_number: "",
      current_balance: ""
    }));
    await loadDashboard(savedCredentials);
  }

  async function savePettyCash() {
    setNotice("");

    const response = await fetch("/api/admin/finance/petty-cash", {
      method: "POST",
      headers: {
        ...authHeaders(savedCredentials),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(pettyCashDraft)
    });
    const result = await response.json();

    if (!response.ok) {
      setNotice(result.message || "Unable to save petty cash record.");
      return;
    }

    setNotice("Petty cash record saved.");
    setPettyCashDraft((current) => ({
      ...current,
      cash_date: new Date().toISOString().slice(0, 10),
      description: "",
      amount: ""
    }));
    await loadDashboard(savedCredentials);
  }

  function updateRevenueDraft(field, value) {
    setRevenueDraft((current) => {
      const next = { ...current, [field]: value };

      if (field === "division") {
        const categories = Object.keys(revenueCatalog[value] || {});
        next.category = categories[0] || "";
        next.product = (revenueCatalog[value]?.[next.category] || [])[0] || "";
      }

      if (field === "category") {
        next.product = (revenueCatalog[next.division]?.[value] || [])[0] || "";
      }

      if (["quantity", "unit_price"].includes(field)) {
        const quantity = Number(field === "quantity" ? value : next.quantity || 0);
        const unitPrice = Number(field === "unit_price" ? value : next.unit_price || 0);
        next.total_revenue = quantity && unitPrice ? String(quantity * unitPrice) : next.total_revenue;
      }

      return next;
    });
  }

  async function saveFinanceRevenue() {
    setNotice("");

    const response = await fetch("/api/admin/finance/revenues", {
      method: "POST",
      headers: {
        ...authHeaders(savedCredentials),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(revenueDraft)
    });
    const result = await response.json();

    if (!response.ok) {
      setNotice(result.message || "Unable to save revenue record.");
      return;
    }

    setNotice("Revenue record saved.");
    setRevenueDraft((current) => ({
      ...current,
      invoice_number: "",
      buyer_name: "",
      country: "",
      quantity: "",
      unit_price: "",
      total_revenue: "",
      transaction_date: new Date().toISOString().slice(0, 10)
    }));
    await loadDashboard(savedCredentials);
  }

  function updateExpenseDraft(field, value) {
    setExpenseDraft((current) => {
      const next = { ...current, [field]: value };

      if (field === "expense_category") {
        next.expense_subcategory = (expenseCatalog[value] || [])[0] || "";
      }

      return next;
    });
  }

  async function uploadFinanceAttachment(event, updateDraft, field, kind) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const uploadKey = `${kind}-${field}`;
    setUploadingFinanceField(uploadKey);
    setNotice("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", kind);

      const response = await fetch("/api/admin/finance/upload", {
        method: "POST",
        headers: authHeaders(savedCredentials),
        body: formData
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to upload finance attachment.");
      }

      updateDraft((current) => ({ ...current, [field]: result.url || "" }));
      setNotice("Attachment uploaded and linked to the record.");
    } catch (error) {
      setNotice(error.message);
    } finally {
      event.target.value = "";
      setUploadingFinanceField("");
    }
  }

  function renderFinanceDocumentPreview(url, label = "Document") {
    if (!url) {
      return null;
    }

    return (
      <div className="admin-document-preview">
        {isPreviewableImage(url) ? <img src={url} alt={`${label} preview`} /> : <span>{String(url).toLowerCase().includes(".pdf") ? "PDF" : "FILE"}</span>}
        <div>
          <strong>{label}</strong>
          <small>{getDocumentName(url)}</small>
          <a href={url} target="_blank" rel="noreferrer">Open document</a>
        </div>
      </div>
    );
  }

  function scrollToFinanceForm(id) {
    if (typeof document === "undefined") {
      return;
    }

    setShowFinanceDetail(true);
    setFinanceView(getFinanceViewForTarget(id));
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  async function testFinanceOwnerAlerts() {
    setNotice("");

    const response = await fetch("/api/admin/finance/test-notifications", {
      method: "POST",
      headers: authHeaders(savedCredentials)
    });
    const result = await response.json();

    if (!response.ok) {
      setNotice(result.message || "Unable to test finance owner alerts.");
      return;
    }

    const summary = (result.results || [])
      .map((item) => `${item.channel}: ${item.ok ? "sent" : item.skipped || item.status || "failed"}`)
      .join(", ");
    setNotice(`Finance owner alert test completed. ${summary}`);
  }

  async function saveFinanceExpense() {
    setNotice("");

    const response = await fetch("/api/admin/finance/expenses", {
      method: "POST",
      headers: {
        ...authHeaders(savedCredentials),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(expenseDraft)
    });
    const result = await response.json();

    if (!response.ok) {
      setNotice(result.message || "Unable to save expense record.");
      return;
    }

    setNotice("Expense record saved.");
    setExpenseDraft((current) => ({
      ...current,
      expense_date: new Date().toISOString().slice(0, 10),
      vendor: "",
      description: "",
      amount: "",
      receipt_url: "",
      status: "Draft"
    }));
    await loadDashboard(savedCredentials);
  }

  async function saveFinanceReceivable() {
    setNotice("");
    const payload = {
      ...receivableDraft,
      invoice_number: receivableDraft.invoice_number || getNextFinanceNumber(receivables, "GSN-INV")
    };

    const response = await fetch("/api/admin/finance/receivables", {
      method: "POST",
      headers: {
        ...authHeaders(savedCredentials),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const result = await response.json();

    if (!response.ok) {
      setNotice(result.message || "Unable to save receivable record.");
      return;
    }

    setNotice("Receivable record saved.");
    setReceivableDraft((current) => ({
      ...current,
      invoice_number: "",
      buyer_name: "",
      commodity: "",
      amount: "",
      due_date: "",
      status: "Draft"
    }));
    await loadDashboard(savedCredentials);
  }

  async function saveFinancePayable() {
    setNotice("");
    const payload = {
      ...payableDraft,
      invoice_number: payableDraft.invoice_number || getNextFinanceNumber(payables, "GSN-AP")
    };

    const response = await fetch("/api/admin/finance/payables", {
      method: "POST",
      headers: {
        ...authHeaders(savedCredentials),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const result = await response.json();

    if (!response.ok) {
      setNotice(result.message || "Unable to save payable record.");
      return;
    }

    setNotice("Payable record saved.");
    setPayableDraft((current) => ({
      ...current,
      supplier_name: "",
      commodity: "",
      invoice_number: "",
      amount: "",
      due_date: "",
      status: "Unpaid"
    }));
    await loadDashboard(savedCredentials);
  }

  function selectQuotationForFinanceInvoice(quotationId) {
    const quotation = quotationRequests.find((record) => record.id === quotationId);
    setFinanceInvoiceDraft((current) => ({
      ...current,
      quotation_id: quotationId,
      quotation_number: quotation?.quotation_number || "",
      invoice_number: quotation ? getFinanceInvoiceNumber(quotation) : "",
      buyer_name: quotation?.buyer_name || quotation?.company_name || "",
      commodity: quotation ? getQuotationProductsText(quotation) : "",
      amount: "",
      currency: current.currency || "IDR",
      due_date: current.due_date
    }));
  }

  async function createFinanceInvoiceFromQuotation() {
    setNotice("");

    const response = await fetch("/api/admin/finance/invoices", {
      method: "POST",
      headers: {
        ...authHeaders(savedCredentials),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(financeInvoiceDraft)
    });
    const result = await response.json();

    if (!response.ok) {
      setNotice(result.message || "Unable to create finance invoice.");
      return;
    }

    setNotice("Finance invoice created and added to Accounts Receivable.");
    setFinanceInvoiceDraft({
      quotation_id: "",
      quotation_number: "",
      invoice_number: "",
      invoice_date: new Date().toISOString().slice(0, 10),
      buyer_name: "",
      commodity: "",
      amount: "",
      currency: "IDR",
      due_date: ""
    });
    await loadDashboard(savedCredentials);
  }

  function startExpenseApproval(item, status) {
    setExpenseApprovalDraft({
      id: item.id,
      status,
      note: status === "Approved" ? "Approved for business expense processing." : ""
    });
  }

  async function submitExpenseApproval() {
    if (!expenseApprovalDraft.id || !expenseApprovalDraft.status) {
      return;
    }

    setNotice("");
    const response = await fetch(`/api/admin/finance/expenses/${expenseApprovalDraft.id}/approval`, {
      method: "POST",
      headers: {
        ...authHeaders(savedCredentials),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        status: expenseApprovalDraft.status,
        approval_note: expenseApprovalDraft.note
      })
    });
    const result = await response.json();

    if (!response.ok) {
      setNotice(result.message || "Unable to update expense approval.");
      return;
    }

    setNotice(`Expense ${expenseApprovalDraft.status.toLowerCase()}.`);
    setExpenseApprovalDraft({ id: "", status: "", note: "" });
    await loadDashboard(savedCredentials);
  }

  async function checkFinanceStorageStatus() {
    setNotice("");
    setStorageStatus({ ready: false, message: "Checking finance document storage..." });

    const response = await fetch("/api/admin/finance/storage-status", {
      headers: authHeaders(savedCredentials)
    });
    const result = await response.json();
    setStorageStatus(result);

    if (!response.ok) {
      setNotice(result.message || "Unable to check finance storage.");
    }
  }

  async function prepareFinanceStorage() {
    setNotice("");
    setStorageStatus({ ready: false, message: "Preparing finance document storage..." });

    const response = await fetch("/api/admin/finance/storage-status", {
      method: "POST",
      headers: authHeaders(savedCredentials)
    });
    const result = await response.json();
    setStorageStatus(result);

    if (!response.ok || !result.ready) {
      setNotice(result.message || "Unable to prepare finance storage.");
      return;
    }

    setNotice(result.message || "Finance document storage is ready.");
  }

  function selectReceivableForMatch(receivableId) {
    const item = receivables.find((record) => record.id === receivableId);
    setPaymentMatchDraft((current) => ({
      ...current,
      receivable_id: receivableId,
      invoice_number: item?.invoice_number || "",
      buyer_name: item?.buyer_name || "",
      amount: item ? String(item.amount ?? "") : current.amount,
      currency: item?.currency || current.currency
    }));
  }

  function selectPayableForPayment(payableId) {
    const item = payables.find((record) => record.id === payableId);
    setSupplierPaymentDraft((current) => ({
      ...current,
      payable_id: payableId,
      supplier_name: item?.supplier_name || "",
      invoice_number: item?.invoice_number || "",
      amount: item ? String(item.amount ?? "") : current.amount,
      currency: item?.currency || current.currency
    }));
  }

  async function savePaymentMatch() {
    setNotice("");

    const response = await fetch("/api/admin/finance/payment-matches", {
      method: "POST",
      headers: {
        ...authHeaders(savedCredentials),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(paymentMatchDraft)
    });
    const result = await response.json();

    if (!response.ok) {
      setNotice(result.message || "Unable to save payment match.");
      return;
    }

    setNotice("Buyer payment matched.");
    setPaymentMatchDraft((current) => ({
      ...current,
      receivable_id: "",
      invoice_number: "",
      buyer_name: "",
      amount: "",
      proof_url: "",
      notes: ""
    }));
    await loadDashboard(savedCredentials);
  }

  async function saveSupplierPayment() {
    setNotice("");

    const response = await fetch("/api/admin/finance/supplier-payments", {
      method: "POST",
      headers: {
        ...authHeaders(savedCredentials),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(supplierPaymentDraft)
    });
    const result = await response.json();

    if (!response.ok) {
      setNotice(result.message || "Unable to save supplier payment.");
      return;
    }

    setNotice("Supplier payment recorded.");
    setSupplierPaymentDraft((current) => ({
      ...current,
      payable_id: "",
      supplier_name: "",
      supplier_account: "",
      invoice_number: "",
      amount: "",
      proof_url: "",
      notes: ""
    }));
    await loadDashboard(savedCredentials);
  }

  async function saveTaxRecord() {
    setNotice("");

    const response = await fetch("/api/admin/finance/tax-records", {
      method: "POST",
      headers: {
        ...authHeaders(savedCredentials),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(taxDraft)
    });
    const result = await response.json();

    if (!response.ok) {
      setNotice(result.message || "Unable to save tax record.");
      return;
    }

    setNotice("Tax record saved.");
    setTaxDraft((current) => ({
      ...current,
      reference_number: "",
      taxable_amount: "",
      tax_amount: "",
      document_url: "",
      notes: ""
    }));
    await loadDashboard(savedCredentials);
  }

  async function saveExchangeRate() {
    setNotice("");

    const response = await fetch("/api/admin/finance/exchange-rates", {
      method: "POST",
      headers: {
        ...authHeaders(savedCredentials),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(exchangeRateDraft)
    });
    const result = await response.json();

    if (!response.ok) {
      setNotice(result.message || "Unable to save exchange rate.");
      return;
    }

    setNotice("Exchange rate saved.");
    setExchangeRateDraft((current) => ({ ...current, rate: "", source: "", notes: "" }));
    await loadDashboard(savedCredentials);
  }

  async function saveFinanceBudget() {
    setNotice("");

    const response = await fetch("/api/admin/finance/budgets", {
      method: "POST",
      headers: {
        ...authHeaders(savedCredentials),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(budgetDraft)
    });
    const result = await response.json();

    if (!response.ok) {
      setNotice(result.message || "Unable to save budget record.");
      return;
    }

    setNotice("Budget record saved.");
    setBudgetDraft((current) => ({
      ...current,
      planned_budget: "",
      actual_spending: ""
    }));
    await loadDashboard(savedCredentials);
  }

  async function saveFinancialReport() {
    setNotice("");

    const response = await fetch("/api/admin/finance/reports", {
      method: "POST",
      headers: {
        ...authHeaders(savedCredentials),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...financialReportDraft,
        filters: {
          currency: "IDR",
          period_preset: financialReportDraft.period_preset,
          date_from: financialReportDraft.date_from,
          date_to: financialReportDraft.date_to,
          source: "admin_finance_dashboard"
        },
        report_data: financialReportSummary
      })
    });
    const result = await response.json();

    if (!response.ok) {
      setNotice(result.message || "Unable to save financial report.");
      return;
    }

    setNotice("Financial report saved.");
    await loadDashboard(savedCredentials);
  }

  async function saveFinancePeriodLock() {
    setNotice("");

    const response = await fetch("/api/admin/finance/period-locks", {
      method: "POST",
      headers: {
        ...authHeaders(savedCredentials),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(financeLockDraft)
    });
    const result = await response.json();

    if (!response.ok) {
      setNotice(result.message || "Unable to lock finance period.");
      return;
    }

    setNotice(`Finance period ${financeLockDraft.period_label} locked.`);
    setFinanceLockDraft((current) => ({
      ...current,
      lock_note: ""
    }));
    await loadDashboard(savedCredentials);
  }

  async function reopenFinancePeriodLock(item) {
    setNotice("");

    const response = await fetch("/api/admin/finance/period-locks", {
      method: "PATCH",
      headers: {
        ...authHeaders(savedCredentials),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: item.id,
        lock_note: `Reopened by ${adminProfile?.username || "admin"} for official correction.`
      })
    });
    const result = await response.json();

    if (!response.ok) {
      setNotice(result.message || "Unable to reopen finance period.");
      return;
    }

    setNotice(`Finance period ${item.period_label} reopened.`);
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
  const attendanceRecords = data?.attendanceRecords || [];
  const buyerProfiles = data?.buyerProfiles || [];
  const suppliers = data?.suppliers || [];
  const businessDocuments = data?.businessDocuments || [];
  const finance = data?.finance || null;
  const financeTransactions = finance?.transactions || [];
  const bankAccounts = finance?.bankAccounts || [];
  const pettyCash = finance?.pettyCash || [];
  const financeRevenues = finance?.revenues || [];
  const financeExpenses = finance?.expenses || [];
  const receivables = finance?.receivables || [];
  const payables = finance?.payables || [];
  const paymentMatches = finance?.paymentMatches || [];
  const supplierPayments = finance?.supplierPayments || [];
  const taxRecords = finance?.taxRecords || [];
  const exchangeRates = finance?.exchangeRates || [];
  const budgets = finance?.budgets || [];
  const financialReports = finance?.financialReports || [];
  const financePermissions = finance?.financePermissions || [];
  const financeAccessLogs = finance?.financeAccessLogs || [];
  const investorReports = finance?.investorReports || [];
  const financePeriodLocks = finance?.financePeriodLocks || [];
  const currentRole = adminProfile?.role || "";
  const currentUsername = String(adminProfile?.username || "").toLowerCase();
  const currentPermissions = adminProfile?.permissions?.length ? adminProfile.permissions : defaultPermissionsByRole[currentRole] || [];
  const hasAccess = (permission) => currentPermissions.includes(permission);
  const isExecutive = executiveRoleIds.includes(currentRole);
  const canUseFinance = hasAccess("finance_access") && Boolean(finance);
  const canViewSuppliers = supplierAccessUsernames.includes(currentUsername) || hasAccess("supplier_access");
  const canDelete = isExecutive;
  const canUseSettings = hasAccess("settings");
  const canManageUsers = hasAccess("user_management");
  const canUseLeads = hasAccess("edit_leads");
  const canUseQuotations = hasAccess("edit_quotations");
  const canUseDocuments = hasAccess("documents_access");
  const canUseAnalytics = hasAccess("analytics_access");
  const canUseAttendance = hasAccess("attendance_access");
  const canUseInvestors = hasAccess("edit_investors") || isExecutive;
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayAttendance = attendanceRecords.filter((record) => String(record.attendance_date || record.created_at || "").slice(0, 10) === todayKey);
  const currentAttendance = todayAttendance.find((record) => record.username === adminProfile?.username);
  const attendanceSummary = {
    totalToday: todayAttendance.length,
    present: todayAttendance.filter((record) => ["Present", "Remote", "Field Visit"].includes(record.status)).length,
    permission: todayAttendance.filter((record) => ["Permission", "Sick", "Leave"].includes(record.status)).length,
    notCheckedOut: todayAttendance.filter((record) => record.check_in_at && !record.check_out_at).length
  };
  const visibleModules = modules.filter((module) => {
    if (module === "Leads" || module === "Buyers") {
      return canUseLeads;
    }
    if (module === "Finance") {
      return canUseFinance;
    }
    if (module === "Suppliers") {
      return canViewSuppliers;
    }
    if (module === "Documents") {
      return canUseDocuments;
    }
    if (module === "Analytics") {
      return canUseAnalytics;
    }
    if (module === "Attendance") {
      return canUseAttendance;
    }
    if (module === "Investors") {
      return canUseInvestors;
    }
    if (module === "Settings") {
      return isExecutive;
    }
    if (module === "Users") {
      return canManageUsers;
    }
    return true;
  });
  const visibleSidebarGroups = useMemo(() => erpSidebarGroups
    .map((group) => {
      if (group.financeOnly && !canUseFinance) {
        return null;
      }
      const items = group.items.filter((item) => {
        if (item.financeOnly && !canUseFinance) {
          return false;
        }
        if (item.supplierOnly && !canViewSuppliers) {
          return false;
        }
        if (item.userManagerOnly && !canManageUsers) {
          return false;
        }
        if (item.module === "Finance" && !canUseFinance) {
          return false;
        }
        if (item.module === "Settings" && !canUseSettings) {
          return false;
        }
        if (item.module === "Users" && !canManageUsers) {
          return false;
        }
        if ((item.module === "Leads" || item.module === "Buyers") && !canUseLeads) {
          return false;
        }
        if (item.module === "Quotations" && !canUseQuotations) {
          return false;
        }
        if (item.module === "Documents" && !canUseDocuments) {
          return false;
        }
        if (item.module === "Analytics" && !canUseAnalytics) {
          return false;
        }
        if (item.module === "Attendance" && !canUseAttendance) {
          return false;
        }
        if (item.module === "Investors" && !canUseInvestors) {
          return false;
        }
        return true;
      });

      return items.length ? { ...group, items } : null;
    })
    .filter(Boolean), [canManageUsers, canUseAnalytics, canUseAttendance, canUseDocuments, canUseFinance, canUseInvestors, canUseLeads, canUseQuotations, canUseSettings, canViewSuppliers, isExecutive]);
  const commandItems = useMemo(() => visibleSidebarGroups.flatMap((group) => group.items.map((item) => ({
    ...item,
    group: group.title
  }))), [visibleSidebarGroups]);
  const filteredCommandItems = useMemo(() => {
    const search = commandQuery.trim().toLowerCase();
    if (!search) {
      return commandItems.slice(0, 12);
    }
    return commandItems.filter((item) => [
      item.group,
      item.label,
      item.description,
      moduleLabels[item.module]
    ].join(" ").toLowerCase().includes(search)).slice(0, 18);
  }, [commandItems, commandQuery]);
  const activeGroupTitle = visibleSidebarGroups.find((group) => group.items.some((item) => item.module === activeModule))?.title || "Dashboard";
  const displayName = formatAdminDisplayName(adminProfile?.username);

  function handleWorkspaceItem(item) {
    setActiveModule(item.module || "Dashboard");
    setProfileMenuOpen(false);
    setCommandOpen(false);
    if (item.module === "Finance") {
      setShowFinanceDetail(Boolean(item.financeTarget));
      setFinanceView(getFinanceViewForTarget(item.financeTarget));
    }
    if (item.financeTarget) {
      window.setTimeout(() => scrollToFinanceForm(item.financeTarget), 80);
    }
  }

  function isSidebarItemActive(item) {
    if (item.financeTarget) {
      return activeModule === "Finance" && showFinanceDetail;
    }
    return activeModule === item.module;
  }

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

  const filteredBuyerProfiles = useMemo(() => {
    const search = query.trim().toLowerCase();
    return buyerProfiles.filter((item) => {
      const searchable = [
        item.buyer_name,
        item.company_name,
        item.email,
        item.whatsapp,
        item.country,
        item.city,
        item.preferred_division,
        listToText(item.products),
        item.buyer_stage,
        item.relationship_status,
        item.assigned_to
      ].join(" ").toLowerCase();
      return !search || searchable.includes(search);
    });
  }, [buyerProfiles, query]);

  const filteredSuppliers = useMemo(() => {
    const search = query.trim().toLowerCase();
    return suppliers.filter((item) => {
      const searchable = [
        item.supplier_name,
        item.company_name,
        item.contact_person,
        item.email,
        item.whatsapp,
        item.country,
        item.city,
        listToText(item.product_categories),
        listToText(item.products),
        item.capacity,
        item.status
      ].join(" ").toLowerCase();
      return !search || searchable.includes(search);
    });
  }, [suppliers, query]);

  const filteredBusinessDocuments = useMemo(() => {
    const search = query.trim().toLowerCase();
    return businessDocuments.filter((item) => {
      const searchable = [
        item.document_type,
        item.title,
        item.related_type,
        item.related_name,
        item.status,
        item.owner,
        item.notes
      ].join(" ").toLowerCase();
      return !search || searchable.includes(search);
    });
  }, [businessDocuments, query]);

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

  const financeMetrics = useMemo(() => {
    const now = new Date();
    const month = now.toISOString().slice(0, 7);
    const monthlyRevenue = financeRevenues.filter((item) => String(item.transaction_date || item.created_at || "").slice(0, 7) === month);
    const monthlyExpenses = financeExpenses.filter((item) => String(item.expense_date || item.created_at || "").slice(0, 7) === month);
    const revenueByCurrency = sumByCurrency(monthlyRevenue, (item) => item.total_revenue);
    const expenseByCurrency = sumByCurrency(monthlyExpenses, (item) => item.amount);
    const cashBalanceByCurrency = sumByCurrency(bankAccounts, (item) => item.current_balance);
    const receivableByCurrency = sumByCurrency(receivables.filter((item) => !["Paid"].includes(item.status)), (item) => item.amount);
    const payableByCurrency = sumByCurrency(payables.filter((item) => !["Paid"].includes(item.status)), (item) => item.amount);
    const primaryCurrency = "IDR";
    const burnRate = expenseByCurrency[primaryCurrency] || 0;
    const runway = burnRate > 0 ? Math.floor((cashBalanceByCurrency[primaryCurrency] || 0) / burnRate) : 0;

    return {
      cashBalanceByCurrency,
      revenueByCurrency,
      expenseByCurrency,
      receivableByCurrency,
      payableByCurrency,
      netProfit: (revenueByCurrency[primaryCurrency] || 0) - (expenseByCurrency[primaryCurrency] || 0),
      burnRate,
      runway,
      activeBuyers: new Set(leads.map((lead) => lead.company_name || lead.email || lead.full_name).filter(Boolean)).size,
      activeSuppliers: new Set(financeExpenses.map((item) => item.vendor).filter(Boolean)).size,
      activeLeads: metrics.openLeads.length,
      activeNegotiations: leads.filter((lead) => getStatus(lead) === "Negotiation").length,
      pipelineValue: quotationRequests.length,
      countriesReached: new Set(leads.map((lead) => lead.country).filter(Boolean)).size
    };
  }, [bankAccounts, financeExpenses, financeRevenues, leads, metrics.openLeads.length, payables, quotationRequests.length, receivables]);

  const financeReminders = useMemo(() => {
    const arItems = receivables
      .filter((item) => !["Paid", "Cancelled"].includes(item.status))
      .map((item) => ({ ...item, kind: "AR", days: daysUntil(item.due_date) }))
      .filter((item) => item.days !== null && item.days <= 3)
      .sort((a, b) => a.days - b.days);
    const apItems = payables
      .filter((item) => !["Paid", "Cancelled"].includes(item.status))
      .map((item) => ({ ...item, kind: "AP", days: daysUntil(item.due_date) }))
      .filter((item) => item.days !== null && item.days <= 3)
      .sort((a, b) => a.days - b.days);
    const pendingApproval = financeExpenses
      .filter((item) => item.status === "Pending Approval")
      .sort((a, b) => new Date(a.expense_date || a.created_at || 0) - new Date(b.expense_date || b.created_at || 0));

    return {
      arItems,
      apItems,
      pendingApproval,
      total: arItems.length + apItems.length + pendingApproval.length
    };
  }, [financeExpenses, payables, receivables]);

  const closingChecklist = useMemo(() => {
    const from = financeLockDraft.date_from;
    const to = financeLockDraft.date_to;
    const today = new Date().toISOString().slice(0, 10);
    const periodReceivables = receivables.filter((item) => isInDateRange(item.invoice_date || item.due_date || item.created_at, from, to));
    const periodPayables = payables.filter((item) => isInDateRange(item.due_date || item.created_at, from, to));
    const periodExpenses = financeExpenses.filter((item) => isInDateRange(item.expense_date || item.created_at, from, to));
    const hasReport = financialReports.some((item) => item.date_from === from && item.date_to === to);
    const bankReady = bankAccounts.some((item) => item.status === "Active" && parseAmount(item.current_balance) >= 0);
    const unpaidAr = periodReceivables.filter((item) => !["Paid", "Cancelled"].includes(item.status));
    const overdueAp = periodPayables.filter((item) => !["Paid", "Cancelled"].includes(item.status) && item.due_date && item.due_date < today);
    const pendingExpenses = periodExpenses.filter((item) => item.status === "Pending Approval");

    return [
      {
        label: "AR unpaid cleared",
        ok: unpaidAr.length === 0,
        detail: unpaidAr.length ? `${unpaidAr.length} buyer invoice still open.` : "No open AR inside selected period."
      },
      {
        label: "AP overdue reviewed",
        ok: overdueAp.length === 0,
        detail: overdueAp.length ? `${overdueAp.length} supplier bill overdue.` : "No overdue AP inside selected period."
      },
      {
        label: "Expense approvals completed",
        ok: pendingExpenses.length === 0,
        detail: pendingExpenses.length ? `${pendingExpenses.length} expense waiting approval.` : "No pending expense approval."
      },
      {
        label: "Financial report saved",
        ok: hasReport,
        detail: hasReport ? "Report exists for this date range." : "Save a finance report for this period before final lock."
      },
      {
        label: "Bank balance recorded",
        ok: bankReady,
        detail: bankReady ? "At least one active bank account is recorded." : "Add active bank account balance before closing."
      }
    ];
  }, [bankAccounts, financeExpenses, financeLockDraft.date_from, financeLockDraft.date_to, financialReports, payables, receivables]);

  const cashFlowVisual = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      return {
        key,
        label: `${monthNames[date.getMonth()]} ${String(date.getFullYear()).slice(-2)}`,
        cashIn: 0,
        cashOut: 0
      };
    });
    const byKey = new Map(months.map((item) => [item.key, item]));

    financeTransactions.forEach((item) => {
      const key = String(item.transaction_date || item.created_at || "").slice(0, 7);
      const month = byKey.get(key);
      if (!month) return;
      const amount = parseAmount(item.amount);
      if (item.transaction_type === "Cash Out") {
        month.cashOut += amount;
      } else {
        month.cashIn += amount;
      }
    });

    financeRevenues.forEach((item) => {
      const key = String(item.transaction_date || item.created_at || "").slice(0, 7);
      const month = byKey.get(key);
      if (month) month.cashIn += parseAmount(item.total_revenue);
    });

    financeExpenses.forEach((item) => {
      const key = String(item.expense_date || item.created_at || "").slice(0, 7);
      const month = byKey.get(key);
      if (month && item.status !== "Rejected") month.cashOut += parseAmount(item.amount);
    });

    const rows = months.map((item) => ({
      ...item,
      net: item.cashIn - item.cashOut
    }));
    const maxFlow = Math.max(1, ...rows.flatMap((item) => [item.cashIn, item.cashOut, Math.abs(item.net)]));
    const runway = financeMetrics.runway;
    const warning = runway > 0 && runway <= 2
      ? "Cash runway is tight. Review expenses and incoming receivables."
      : runway === 0 && financeMetrics.burnRate > 0
        ? "No runway detected from current IDR bank balance."
        : "Cash runway looks stable based on current IDR records.";

    return { rows, maxFlow, warning };
  }, [financeExpenses, financeMetrics.burnRate, financeMetrics.runway, financeRevenues, financeTransactions]);

  const financialReportSummary = useMemo(() => {
    const currency = "IDR";
    const from = financialReportDraft.date_from;
    const to = financialReportDraft.date_to;
    const revenueItems = financeRevenues.filter((item) => (item.currency || currency) === currency && isInDateRange(item.transaction_date || item.created_at, from, to));
    const expenseItems = financeExpenses.filter((item) => (item.currency || currency) === currency && isInDateRange(item.expense_date || item.created_at, from, to));
    const transactionItems = financeTransactions.filter((item) => (item.currency || currency) === currency && isInDateRange(item.transaction_date || item.created_at, from, to));
    const receivableItems = receivables.filter((item) => (item.currency || currency) === currency && (!item.due_date || isInDateRange(item.due_date || item.created_at, from, to)));
    const payableItems = payables.filter((item) => (item.currency || currency) === currency && (!item.due_date || isInDateRange(item.due_date || item.created_at, from, to)));
    const budgetItems = budgets.filter((item) => (item.currency || currency) === currency);
    const revenueByDivision = revenueItems.reduce((totals, item) => {
      const key = item.division || "Uncategorized";
      totals[key] = (totals[key] || 0) + parseAmount(item.total_revenue);
      return totals;
    }, {});
    const expenseByCategory = expenseItems.reduce((totals, item) => {
      const key = item.expense_category || "Uncategorized";
      totals[key] = (totals[key] || 0) + parseAmount(item.amount);
      return totals;
    }, {});
    const sortedRevenueDivision = Object.entries(revenueByDivision).sort((a, b) => b[1] - a[1]);
    const sortedExpenseCategory = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1]);
    const totalRevenue = revenueItems.reduce((sum, item) => sum + parseAmount(item.total_revenue), 0);
    const totalExpenses = expenseItems.reduce((sum, item) => sum + parseAmount(item.amount), 0);
    const cashIn = transactionItems
      .filter((item) => item.transaction_type === "Cash In")
      .reduce((sum, item) => sum + parseAmount(item.amount), 0);
    const cashOut = transactionItems
      .filter((item) => item.transaction_type === "Cash Out")
      .reduce((sum, item) => sum + parseAmount(item.amount), 0);
    const receivableOutstanding = receivableItems
      .filter((item) => item.status !== "Paid")
      .reduce((sum, item) => sum + parseAmount(item.amount), 0);
    const payableOutstanding = payableItems
      .filter((item) => item.status !== "Paid")
      .reduce((sum, item) => sum + parseAmount(item.amount), 0);
    const plannedBudget = budgetItems.reduce((sum, item) => sum + parseAmount(item.planned_budget), 0);
    const actualBudget = budgetItems.reduce((sum, item) => sum + parseAmount(item.actual_spending), 0);

    return {
      currency,
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      cashIn,
      cashOut,
      netCashFlow: cashIn - cashOut,
      receivableOutstanding,
      payableOutstanding,
      plannedBudget,
      actualBudget,
      remainingBudget: plannedBudget - actualBudget,
      topRevenueDivision: sortedRevenueDivision[0]?.[0] || "-",
      topExpenseCategory: sortedExpenseCategory[0]?.[0] || "-",
      revenueByDivision,
      expenseByCategory,
      dateFrom: from,
      dateTo: to,
      generatedAt: new Date().toISOString()
    };
  }, [budgets, financeExpenses, financeRevenues, financialReportDraft.date_from, financialReportDraft.date_to, financeTransactions, payables, receivables]);

  const currencyConversionSummary = useMemo(() => {
    const latestRates = new Map();
    exchangeRates.forEach((item) => {
      const key = `${item.base_currency}-${item.target_currency}`;
      if (!latestRates.has(key)) {
        latestRates.set(key, Number(item.rate || 1));
      }
    });
    const usdRate = latestRates.get("IDR-USD") || 0;
    const sgdRate = latestRates.get("IDR-SGD") || 0;
    return {
      usdRate,
      sgdRate,
      netProfitUsd: usdRate ? financialReportSummary.netProfit * usdRate : 0,
      netProfitSgd: sgdRate ? financialReportSummary.netProfit * sgdRate : 0
    };
  }, [exchangeRates, financialReportSummary.netProfit]);

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
  const financeAdminActivities = useMemo(() => adminActivities.filter(isFinanceActivity), [adminActivities]);
  const financeAuditAdminOptions = useMemo(() => ["All", ...new Set(financeAdminActivities.map((activity) => activity.metadata?.admin).filter(Boolean))], [financeAdminActivities]);
  const financeAuditActionOptions = useMemo(() => ["All", ...new Set(financeAdminActivities.map((activity) => activity.metadata?.action).filter(Boolean))], [financeAdminActivities]);
  const filteredFinanceActivities = useMemo(() => {
    const fromTime = financeAuditFilters.from ? new Date(`${financeAuditFilters.from}T00:00:00`).getTime() : 0;
    const toTime = financeAuditFilters.to ? new Date(`${financeAuditFilters.to}T23:59:59`).getTime() : Infinity;

    return financeAdminActivities.filter((activity) => {
      const created = new Date(activity.created_at || 0).getTime();
      const matchesAdmin = financeAuditFilters.admin === "All" || activity.metadata?.admin === financeAuditFilters.admin;
      const matchesAction = financeAuditFilters.action === "All" || activity.metadata?.action === financeAuditFilters.action;
      return matchesAdmin && matchesAction && created >= fromTime && created <= toTime;
    });
  }, [financeAdminActivities, financeAuditFilters]);
  const latestFinanceActivities = useMemo(() => filteredFinanceActivities.slice(0, 50), [filteredFinanceActivities]);
  const unreadNotifications = notifications.filter((item) => !item.is_read);
  const mostClicked = chartData.clicks[0]?.[0] || "-";
  const conversionRate = getConversionRate(leads, events);
  const priorityClass = selected ? getPriority(selected).toLowerCase() : "low";
  const selectedProducts = selected ? normalizeProducts(selected) : [];
  const selectedFollowUpHours = selected ? hoursSince(selected.created_at) : 0;
  const assignableUsers = useMemo(() => userAccounts.filter((account) => account.is_active !== false).map((account) => account.username), [userAccounts]);
  const attentionTasks = useMemo(() => ([
    metrics.pendingFollowUps ? { title: "Follow-up buyer", detail: `${metrics.pendingFollowUps} prospek perlu dihubungi`, tone: "high", module: "Leads" } : null,
    metrics.highPriority ? { title: "Prioritas tinggi", detail: `${metrics.highPriority} lead harus dipantau`, tone: "medium", module: "Leads" } : null,
    unreadNotifications.length ? { title: "Notifikasi baru", detail: `${unreadNotifications.length} info belum dibaca`, tone: "medium", module: "Dashboard" } : null,
    canUseFinance && financeReminders.total ? { title: "Keuangan", detail: `${financeReminders.total} reminder finance aktif`, tone: "high", module: "Finance" } : null,
    !currentAttendance?.check_in_at ? { title: "Absensi hari ini", detail: "Belum absen masuk", tone: "low", module: "Attendance" } : null
  ].filter(Boolean).slice(0, 5)), [canUseFinance, currentAttendance?.check_in_at, financeReminders.total, metrics.highPriority, metrics.pendingFollowUps, unreadNotifications.length]);
  const homeActivities = useMemo(() => latestAdminActivities.slice(0, 5), [latestAdminActivities]);
  const quickActions = [
    { label: "Tambah Prospek", hint: "Kelola inquiry buyer", module: "Leads" },
    { label: "Buat Penawaran", hint: "Quotation buyer", module: "Quotations" },
    { label: "Catat Pemasukan", hint: "Revenue / cash in", module: "Finance", financeTarget: "finance-revenue-form" },
    { label: "Catat Pengeluaran", hint: "Expense approval", module: "Finance", financeTarget: "finance-expense-form" },
    { label: "Upload Dokumen", hint: "Kontrak, invoice, legal", module: "Documents" },
    { label: "Absen Masuk", hint: "Check-in harian", module: "Attendance" }
  ];
  const modalTitles = {
    buyerProfile: "Buyer Profile",
    supplier: "Supplier Profile",
    businessDocument: "Business Document",
    lead: "Buyer Lead",
    investor: "Investor Inquiry",
    quotation: "Quotation Request",
    financeTransaction: "Finance Transaction",
    bankAccount: "Bank Account",
    pettyCash: "Petty Cash",
    financeRevenue: "Revenue Record",
    financeExpense: "Expense Record",
    financeReceivable: "Accounts Receivable",
    financePayable: "Accounts Payable",
    paymentMatch: "Buyer Payment Match",
    supplierPayment: "Supplier Payment",
    taxRecord: "Tax & Compliance Record",
    exchangeRate: "Exchange Rate",
    financeBudget: "Budget Record",
    financeReport: "Financial Report"
  };
  const modalSelectOptions = {
    buyerProfile: {
      preferred_division: revenueDivisions,
      buyer_stage: buyerStages,
      relationship_status: relationshipStatuses
    },
    supplier: {
      status: supplierStatuses
    },
    businessDocument: {
      document_type: documentTypes,
      status: documentStatuses
    },
    quotation: { status: ["Draft", "Sent", "Accepted", "Rejected", "Closed"] },
    financeTransaction: {
      transaction_type: ["Cash In", "Cash Out"],
      currency: financeCurrencies,
      payment_method: paymentMethods
    },
    bankAccount: {
      currency: financeCurrencies,
      status: bankAccountStatuses
    },
    pettyCash: {
      currency: financeCurrencies,
      status: pettyCashStatuses
    },
    financeRevenue: {
      division: revenueDivisions,
      currency: financeCurrencies,
      status: ["Recorded", "Pending", "Paid", "Cancelled"]
    },
    financeExpense: {
      expense_category: expenseCategories,
      currency: financeCurrencies,
      payment_method: paymentMethods,
      status: expenseStatuses
    },
    financeReceivable: {
      currency: financeCurrencies,
      status: receivableStatuses
    },
    financePayable: {
      currency: financeCurrencies,
      status: payableStatuses
    },
    paymentMatch: {
      currency: financeCurrencies,
      payment_method: paymentMethods,
      status: paymentMatchStatuses
    },
    supplierPayment: {
      currency: financeCurrencies,
      payment_method: paymentMethods,
      status: supplierPaymentStatuses
    },
    taxRecord: {
      tax_type: taxTypes,
      currency: financeCurrencies,
      status: taxStatuses
    },
    exchangeRate: {
      base_currency: financeCurrencies,
      target_currency: financeCurrencies
    },
    financeBudget: {
      budget_category: budgetCategories,
      currency: financeCurrencies
    },
    financeReport: {
      report_type: financialReportTypes
    }
  };
  const modalFields = {
    buyerProfile: [
      ["buyer_name", "Buyer Name"],
      ["company_name", "Company Name"],
      ["email", "Email"],
      ["whatsapp", "WhatsApp"],
      ["country", "Country"],
      ["city", "City"],
      ["preferred_division", "Preferred Division", "select"],
      ["products", "Products"],
      ["buyer_stage", "Buyer Stage", "select"],
      ["relationship_status", "Relationship", "select"],
      ["assigned_to", "Assigned To", "admin"],
      ["total_inquiries", "Total Inquiries"],
      ["total_quotations", "Total Quotations"],
      ["notes", "Notes", "textarea"]
    ],
    supplier: [
      ["supplier_name", "Supplier Name"],
      ["company_name", "Company Name"],
      ["contact_person", "Contact Person"],
      ["email", "Email"],
      ["whatsapp", "WhatsApp"],
      ["country", "Country"],
      ["city", "City"],
      ["product_categories", "Product Categories"],
      ["products", "Products"],
      ["capacity", "Capacity"],
      ["payment_terms", "Payment Terms"],
      ["lead_time", "Lead Time"],
      ["quality_rating", "Quality Rating"],
      ["status", "Status", "select"],
      ["notes", "Notes", "textarea"]
    ],
    businessDocument: [
      ["document_type", "Document Type", "select"],
      ["title", "Title"],
      ["related_type", "Related Type"],
      ["related_name", "Related Name"],
      ["file_url", "File URL"],
      ["status", "Status", "select"],
      ["expiry_date", "Expiry Date", "date"],
      ["owner", "Owner"],
      ["notes", "Notes", "textarea"]
    ],
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
    ],
    financeTransaction: [
      ["transaction_type", "Transaction Type", "select"],
      ["transaction_date", "Date", "date"],
      ["category", "Category"],
      ["description", "Description", "textarea"],
      ["amount", "Amount"],
      ["currency", "Currency", "select"],
      ["payment_method", "Payment Method", "select"],
      ["reference_number", "Reference Number"]
    ],
    bankAccount: [
      ["account_name", "Account Name"],
      ["bank_name", "Bank Name"],
      ["account_number", "Account Number"],
      ["currency", "Currency", "select"],
      ["current_balance", "Current Balance"],
      ["status", "Status", "select"]
    ],
    pettyCash: [
      ["cash_date", "Date", "date"],
      ["description", "Description", "textarea"],
      ["amount", "Amount"],
      ["currency", "Currency", "select"],
      ["responsible_person", "Responsible Person"],
      ["status", "Status", "select"]
    ],
    financeRevenue: [
      ["invoice_number", "Invoice Number"],
      ["buyer_name", "Buyer Name"],
      ["country", "Country"],
      ["division", "Division", "select"],
      ["category", "Category"],
      ["product", "Product"],
      ["quantity", "Quantity"],
      ["unit", "Unit"],
      ["unit_price", "Unit Price"],
      ["currency", "Currency", "select"],
      ["total_revenue", "Total Revenue"],
      ["transaction_date", "Date", "date"],
      ["status", "Status", "select"]
    ],
    financeExpense: [
      ["expense_date", "Date", "date"],
      ["expense_category", "Category", "select"],
      ["expense_subcategory", "Subcategory"],
      ["vendor", "Vendor"],
      ["description", "Description", "textarea"],
      ["amount", "Amount"],
      ["currency", "Currency", "select"],
      ["payment_method", "Payment Method", "select"],
      ["receipt_url", "Receipt URL"],
      ["status", "Status", "select"],
      ["approved_by", "Approved By"],
      ["approved_at", "Approved At"],
      ["approval_note", "Approval Note", "textarea"]
    ],
    financeReceivable: [
      ["invoice_number", "Invoice Number"],
      ["invoice_date", "Invoice Date", "date"],
      ["quotation_number", "Quotation Number"],
      ["buyer_name", "Buyer Name"],
      ["commodity", "Commodity"],
      ["amount", "Amount"],
      ["paid_amount", "Paid Amount"],
      ["currency", "Currency", "select"],
      ["due_date", "Due Date", "date"],
      ["status", "Status", "select"]
    ],
    financePayable: [
      ["supplier_name", "Supplier Name"],
      ["commodity", "Commodity"],
      ["invoice_number", "Invoice Number"],
      ["amount", "Amount"],
      ["currency", "Currency", "select"],
      ["due_date", "Due Date", "date"],
      ["status", "Status", "select"]
    ],
    paymentMatch: [
      ["payment_date", "Payment Date", "date"],
      ["invoice_number", "Invoice Number"],
      ["buyer_name", "Buyer Name"],
      ["amount", "Amount"],
      ["currency", "Currency", "select"],
      ["payment_method", "Payment Method", "select"],
      ["proof_url", "Proof URL"],
      ["status", "Status", "select"],
      ["notes", "Notes", "textarea"]
    ],
    supplierPayment: [
      ["payment_date", "Payment Date", "date"],
      ["supplier_name", "Supplier Name"],
      ["supplier_account", "Supplier Account"],
      ["invoice_number", "Invoice Number"],
      ["amount", "Amount"],
      ["currency", "Currency", "select"],
      ["payment_method", "Payment Method", "select"],
      ["proof_url", "Proof URL"],
      ["status", "Status", "select"],
      ["notes", "Notes", "textarea"]
    ],
    taxRecord: [
      ["tax_period", "Tax Period"],
      ["tax_type", "Tax Type", "select"],
      ["reference_number", "Reference Number"],
      ["taxable_amount", "Taxable Amount"],
      ["tax_amount", "Tax Amount"],
      ["currency", "Currency", "select"],
      ["document_url", "Document URL"],
      ["due_date", "Due Date", "date"],
      ["status", "Status", "select"],
      ["notes", "Notes", "textarea"]
    ],
    exchangeRate: [
      ["rate_date", "Rate Date", "date"],
      ["base_currency", "Base Currency", "select"],
      ["target_currency", "Target Currency", "select"],
      ["rate", "Rate"],
      ["source", "Source"],
      ["notes", "Notes", "textarea"]
    ],
    financeBudget: [
      ["fiscal_year", "Fiscal Year"],
      ["budget_category", "Budget Category", "select"],
      ["planned_budget", "Planned Budget"],
      ["actual_spending", "Actual Spending"],
      ["currency", "Currency", "select"]
    ],
    financeReport: [
      ["report_type", "Report Type", "select"],
      ["title", "Title"],
      ["date_from", "Date From", "date"],
      ["date_to", "Date To", "date"]
    ]
  };

  return (
    <main className={`admin-shell ${!savedCredentials ? "admin-login-screen" : "admin-erp-shell"} ${sidebarCollapsed ? "is-sidebar-collapsed" : ""}`}>
      {savedCredentials ? (
        <aside className="admin-sidebar" aria-label="GSN ERP navigation">
          <div className="admin-sidebar-brand">
            <img alt="GSN" src="/logos/gsn-admin-logo.png" />
            {!sidebarCollapsed ? (
              <div>
                <strong>GARDA SAMUDRA NUSANTARA</strong>
                <span>Internal Operating System</span>
              </div>
            ) : null}
          </div>
          <button className="admin-sidebar-toggle" onClick={() => setSidebarCollapsed((value) => !value)} type="button">
            {sidebarCollapsed ? ">" : "<"}
          </button>
          <nav className="admin-sidebar-nav">
            {visibleSidebarGroups.map((group) => {
              const expanded = expandedSidebarGroup === group.title || sidebarCollapsed;
              return (
                <div className="admin-sidebar-group" key={group.title}>
                  <button
                    className={activeGroupTitle === group.title ? "is-active" : ""}
                    onClick={() => setExpandedSidebarGroup((current) => current === group.title ? "" : group.title)}
                    type="button"
                  >
                    <span>{group.code}</span>
                    {!sidebarCollapsed ? <strong>{group.title}</strong> : null}
                    {!sidebarCollapsed ? <small>{expanded ? "-" : "+"}</small> : null}
                  </button>
                  {expanded ? (
                    <div className="admin-sidebar-items">
                      {group.items.map((item) => (
                        <button
                          className={isSidebarItemActive(item) ? "is-active" : ""}
                          key={`${group.title}-${item.label}`}
                          onClick={() => handleWorkspaceItem(item)}
                          title={sidebarCollapsed ? item.label : undefined}
                          type="button"
                        >
                          <span>{item.label}</span>
                          {!sidebarCollapsed ? <small>{item.description}</small> : null}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>
        </aside>
      ) : null}

      {savedCredentials ? (
        <section className="admin-topbar" aria-label="GSN ERP topbar">
          <button className="admin-command-trigger" onClick={() => setCommandOpen(true)} type="button">
            <span>Cari menu, data, laporan...</span>
            <kbd>Ctrl K</kbd>
          </button>
          <div className="admin-topbar-actions">
            <input aria-label="Tanggal kerja" type="date" value={todayKey} readOnly />
            <button onClick={() => setCommandOpen(true)} type="button">Buat Cepat</button>
            <button className="admin-bell" onClick={() => setNotificationsOpen((value) => !value)} type="button">
              Notifikasi
              {unreadNotifications.length ? <span>{unreadNotifications.length}</span> : null}
            </button>
            <div className="admin-profile-menu">
              <button onClick={() => setProfileMenuOpen((value) => !value)} type="button">
                <strong>{displayName}</strong>
                <small>{adminRoleLabels[adminProfile?.role] || adminProfile?.role}</small>
              </button>
              {profileMenuOpen ? (
                <div className="admin-profile-dropdown">
                  {canManageUsers ? <button onClick={() => setActiveModule("Users")} type="button">Profil Saya</button> : null}
                  {canUseSettings ? <button onClick={() => setActiveModule("Settings")} type="button">Profil Perusahaan</button> : null}
                  {canUseSettings ? <button onClick={() => setActiveModule("Settings")} type="button">Preferensi</button> : null}
                  <button onClick={handleLogout} type="button">Keluar</button>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {savedCredentials && commandOpen ? (
        <section className="admin-command-backdrop" role="dialog" aria-modal="true" aria-label="Cari menu dashboard">
          <div className="admin-command-palette">
            <div className="admin-command-input">
              <input
                autoFocus
                value={commandQuery}
                onChange={(event) => setCommandQuery(event.target.value)}
                placeholder="Cari menu, data, laporan..."
              />
              <button onClick={() => setCommandOpen(false)} type="button">Tutup</button>
            </div>
            <div className="admin-command-list">
              {filteredCommandItems.map((item) => (
                <button key={`${item.group}-${item.label}`} onClick={() => handleWorkspaceItem(item)} type="button">
                  <span>{item.group}</span>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </button>
              ))}
              {!filteredCommandItems.length ? <p className="admin-empty">Tidak ada menu yang cocok.</p> : null}
            </div>
          </div>
        </section>
      ) : null}

      {savedCredentials ? <section className="admin-hero">
        <div>
          <p>GSN ERP</p>
          <h1>Selamat datang kembali, {displayName}</h1>
          <span>Berikut ringkasan performa bisnis GSN hari ini.</span>
          {adminProfile ? <small className="admin-owner-badge">{adminProfile.username} - {adminRoleLabels[adminProfile.role] || adminProfile.role}</small> : null}
        </div>
        <div className="admin-hero-actions">
          {savedCredentials ? (
            <button className="admin-bell" onClick={() => setNotificationsOpen((value) => !value)} type="button">
              Notifikasi
              {unreadNotifications.length ? <span>{unreadNotifications.length}</span> : null}
            </button>
          ) : null}
          {savedCredentials ? <button onClick={() => loadDashboard(savedCredentials)} type="button">{loading ? "Memuat..." : "Muat Ulang"}</button> : null}
          <a href="/">Buka Website</a>
        </div>
      </section> : null}

      {savedCredentials && notificationsOpen ? (
        <section className="admin-panel admin-notifications">
          <div className="admin-panel-header">
            <div>
              <p>Pusat Notifikasi</p>
              <h2>Info Internal</h2>
            </div>
            <button disabled={!unreadNotifications.length} onClick={() => markNotificationsRead(true)} type="button">Tandai Dibaca</button>
          </div>
          <div className="admin-notification-list">
            {notifications.slice(0, 12).map((item) => (
              <button className={item.is_read ? "" : "is-unread"} key={item.id} onClick={() => markNotificationsRead(false, item.id)} type="button">
                <span>{item.type}</span>
                <strong>{item.title}</strong>
                <small>{item.message || "-"} | {formatDate(item.created_at)}</small>
              </button>
            ))}
            {!notifications.length ? <p className="admin-empty">Belum ada notifikasi.</p> : null}
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
            <h2>Selamat Datang</h2>
            <span className="admin-security-note">Portal internal GSN. Hanya untuk akses resmi.</span>
            <form onSubmit={handleLogin}>
              <label>
                Nama Pengguna
                <input
                  autoComplete="username"
                  value={credentials.username}
                  onChange={(event) => setCredentials((current) => ({ ...current, username: event.target.value }))}
                  placeholder="Masukkan username"
                  type="text"
                />
              </label>
              <label>
                Kata Sandi
                <input
                  autoComplete="current-password"
                  value={credentials.password}
                  onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))}
                  placeholder="Masukkan password"
                  type="password"
                />
              </label>
              <button disabled={!credentials.username || !credentials.password || loading} type="submit">{loading ? "Memproses..." : "Masuk"}</button>
            </form>
          </div>
          {notice ? <strong>{notice}</strong> : null}
        </section>
      ) : null}

      {data ? (
        <>
          {!data.configured ? (
            <section className="admin-setup-warning">
              <h2>Supabase belum terhubung.</h2>
              <p>Tambahkan SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_DASHBOARD_ACCOUNTS, dan ADMIN_SESSION_SECRET di Vercel agar data live GSN tersimpan aman.</p>
            </section>
          ) : null}

          {activeModule === "Dashboard" ? <section className="admin-metrics crm admin-home-kpis">
            <article><span>Total Prospek</span><strong>{metrics.totalLeads}</strong></article>
            <article><span>Masuk Hari Ini</span><strong>{metrics.newToday}</strong></article>
            <article><span>Investor</span><strong>{metrics.investorInquiries}</strong></article>
            <article><span>Permintaan Penawaran</span><strong>{metrics.quotationRequests}</strong></article>
            <article><span>Lead NusaBot</span><strong>{metrics.nusabotLeads}</strong></article>
            <article><span>Perlu Follow-Up</span><strong>{metrics.pendingFollowUps}</strong></article>
            <article><span>Prioritas Tinggi</span><strong>{metrics.highPriority}</strong></article>
          </section> : null}

          <nav className="admin-module-tabs" aria-label="Admin modules">
            {visibleModules.map((module) => (
              <button className={activeModule === module ? "is-active" : ""} key={module} onClick={() => setActiveModule(module)} type="button">
                {moduleLabels[module] || module}
              </button>
            ))}
          </nav>

          {activeModule === "Dashboard" ? (
            <section className="admin-home-grid">
              <OwnerSummary
                metrics={metrics}
                financeReminders={financeReminders}
                chartData={chartData}
                mostClicked={mostClicked}
                unreadNotifications={unreadNotifications}
                canUseFinance={canUseFinance}
                onOpenModule={setActiveModule}
              />

              <div className="admin-panel admin-home-focus">
                <div className="admin-panel-header">
                  <div>
                    <p>Mulai Dari Sini</p>
                    <h2>Quick Actions</h2>
                  </div>
                  <span className="admin-muted">Pekerjaan harian dalam 2-3 klik</span>
                </div>
                <div className="admin-quick-actions">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => {
                        setActiveModule(action.module);
                        if (action.financeTarget) {
                          window.setTimeout(() => scrollToFinanceForm(action.financeTarget), 80);
                        }
                      }}
                      type="button"
                    >
                      <strong>{action.label}</strong>
                      <span>{action.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="admin-panel">
                <div className="admin-panel-header compact">
                  <div>
                    <p>Perlu Perhatian</p>
                    <h2>Tugas Penting</h2>
                  </div>
                </div>
                <div className="admin-task-list">
                  {attentionTasks.map((task) => (
                    <button className={task.tone} key={task.title} onClick={() => setActiveModule(task.module)} type="button">
                      <strong>{task.title}</strong>
                      <span>{task.detail}</span>
                    </button>
                  ))}
                  {!attentionTasks.length ? (
                    <div className="admin-empty-state">
                      <strong>Semua aman.</strong>
                      <span>Tidak ada tugas penting yang menunggu sekarang.</span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="admin-panel">
                <div className="admin-panel-header compact">
                  <div>
                    <p>Insight Sistem</p>
                    <h2>Ringkasan Hari Ini</h2>
                  </div>
                </div>
                <div className="admin-insight-list">
                  <article><strong>{chartData.products[0]?.[0] || "Belum ada produk dominan"}</strong><span>Produk yang paling sering diminati.</span></article>
                  <article><strong>{chartData.countries[0]?.[0] || "Belum ada negara dominan"}</strong><span>Negara buyer paling aktif.</span></article>
                  <article><strong>{mostClicked || "-"}</strong><span>Fitur website paling sering diklik.</span></article>
                </div>
              </div>

              <div className="admin-panel">
                <div className="admin-panel-header compact">
                  <div>
                    <p>Aktivitas Terbaru</p>
                    <h2>5 Aktivitas Terakhir</h2>
                  </div>
                  <button onClick={() => setActiveModule("Activity")} type="button">Lihat Semua</button>
                </div>
                <div className="admin-event-list compact">
                  {homeActivities.map((activity) => (
                    <article key={activity.id}>
                      <strong>{activity.label || activity.metadata?.action || "Aktivitas admin"}</strong>
                      <span>{activity.metadata?.admin || "admin"}</span>
                      <small>{formatDate(activity.created_at)}</small>
                    </article>
                  ))}
                  {!homeActivities.length ? <p className="admin-empty">Belum ada aktivitas admin.</p> : null}
                </div>
              </div>
            </section>
          ) : null}

          {activeModule === "Leads" ? <section className="admin-chart-grid">
            <div className="admin-panel">
              <div className="admin-panel-header compact"><div><p>Prospek Bulanan</p><h2>Per Bulan</h2></div></div>
              <BarList items={chartData.months} empty="Belum ada data prospek bulanan." />
            </div>
            <div className="admin-panel">
              <div className="admin-panel-header compact"><div><p>Negara Buyer</p><h2>Negara</h2></div></div>
              <BarList items={chartData.countries} empty="Belum ada data negara buyer." />
            </div>
            <div className="admin-panel">
              <div className="admin-panel-header compact"><div><p>Minat Produk</p><h2>Produk</h2></div></div>
              <BarList items={chartData.products} empty="Belum ada minat produk." />
            </div>
            <div className="admin-panel">
              <div className="admin-panel-header compact"><div><p>Aktivitas Website</p><h2>Klik Website</h2></div></div>
              <BarList items={chartData.clicks} empty="Belum ada klik website." />
            </div>
          </section> : null}

          {activeModule === "Leads" ? <section className="admin-grid">
            <div className="admin-panel admin-table-panel">
              <div className="admin-panel-header">
                <div>
                  <p>Database Prospek</p>
                  <h2>Inquiry Buyer</h2>
                </div>
                <button onClick={() => exportLeadsCsv(filteredLeads)} disabled={!filteredLeads.length} type="button">Ekspor CSV</button>
              </div>

              <div className="admin-toolbar">
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari buyer, perusahaan, produk, negara..." />
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  {statusFilters.map((item) => <option key={item} value={item}>{labelStatus(item)}</option>)}
                </select>
                <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
                  {priorities.map((item) => <option key={item} value={item}>{labelPriority(item)}</option>)}
                </select>
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                  <option value="newest">Terbaru</option>
                  <option value="oldest">Terlama</option>
                  <option value="priority">Prioritas</option>
                  <option value="company">Perusahaan</option>
                </select>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-mobile-cards">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Prospek</th>
                      <th>Tipe</th>
                      <th>Negara</th>
                      <th>Produk</th>
                      <th>Prioritas</th>
                      <th>Status</th>
                      <th>Owner</th>
                      <th>Deadline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr className={selected?.id === lead.id ? "is-selected" : ""} key={lead.id} onClick={() => setSelected(lead)}>
                        <td data-label="Tanggal">{formatDate(lead.created_at)}</td>
                        <td data-label="Prospek"><strong>{lead.full_name || "-"}</strong><span>{lead.company_name || lead.email || "-"}</span></td>
                        <td data-label="Tipe">{getLeadType(lead)}</td>
                        <td data-label="Negara">{lead.country || "-"}</td>
                        <td data-label="Produk">{normalizeProducts(lead).length ? normalizeProducts(lead).join(", ") : "-"}</td>
                        <td data-label="Prioritas"><span className={`admin-priority ${getPriority(lead).toLowerCase()}`}>{labelPriority(getPriority(lead))}</span></td>
                        <td data-label="Status">{labelStatus(getStatus(lead))}</td>
                        <td data-label="Owner">{labelAssignee(lead.assigned_to)}</td>
                        <td data-label="Deadline">{lead.follow_up_deadline ? formatDate(lead.follow_up_deadline) : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!filteredLeads.length ? <p className="admin-empty table">Belum ada prospek yang cocok dengan filter.</p> : null}
              </div>
            </div>

            <aside className="admin-panel admin-detail">
              <div className="admin-panel-header">
                <div>
                  <p>Detail Prospek</p>
                  <h2>{selected?.full_name || "Belum ada prospek dipilih"}</h2>
                </div>
                {selected ? <span className={`admin-priority ${priorityClass}`}>{labelPriority(getPriority(selected))}</span> : null}
              </div>

              {selected ? (
                <div className="admin-detail-body">
                  <dl>
                    <dt>Perusahaan</dt><dd>{selected.company_name || "-"}</dd>
                    <dt>WhatsApp</dt><dd>{selected.whatsapp || selected.phone || "-"}</dd>
                    <dt>Email</dt><dd>{selected.email || "-"}</dd>
                    <dt>Negara</dt><dd>{selected.country || "-"}</dd>
                    <dt>Produk</dt><dd>{selectedProducts.length ? selectedProducts.join(", ") : "-"}</dd>
                    <dt>Quantity</dt><dd>{selected.quantity || "-"}</dd>
                    <dt>Lead Score</dt><dd>{selected.lead_score ?? 0}/100</dd>
                    <dt>Follow-Up</dt><dd>{selectedFollowUpHours >= 24 ? `${selectedFollowUpHours} jam menunggu` : "Masih dalam 24 jam"}</dd>
                    <dt>Ditugaskan Ke</dt><dd>{labelAssignee(selected.assigned_to)}</dd>
                    <dt>Deadline</dt><dd>{selected.follow_up_deadline ? formatDate(selected.follow_up_deadline) : "-"}</dd>
                    <dt>Alasan Prioritas</dt><dd>{selected.lead_reason || "-"}</dd>
                  </dl>

                  <label>
                    Status
                    <select value={getStatus(selected)} onChange={(event) => updateLead(selected.id, { status: event.target.value })}>
                      {statuses.map((status) => <option key={status} value={status}>{labelStatus(status)}</option>)}
                    </select>
                  </label>

                  <label>
                    Ditugaskan Ke
                    <select value={selected.assigned_to || ""} onChange={(event) => updateLead(selected.id, { assigned_to: event.target.value })}>
                      <option value="">Belum ditugaskan</option>
                      {assignableUsers.map((username) => <option key={username} value={username}>{username}</option>)}
                    </select>
                  </label>

                  <label>
                    Deadline Follow-Up
                    <input
                      type="datetime-local"
                      value={toDateTimeLocal(selected.follow_up_deadline)}
                      onChange={(event) => updateLead(selected.id, { follow_up_deadline: event.target.value })}
                    />
                  </label>

                  <label>
                    Catatan Internal
                    <textarea
                      defaultValue={selected.internal_notes || ""}
                      onBlur={(event) => updateLead(selected.id, { internal_notes: event.target.value })}
                      placeholder="Tambahkan catatan follow-up, status penawaran, preferensi buyer..."
                    />
                  </label>

                  <div className="admin-actions">
                    <button onClick={() => openModal("lead", selected)} type="button">Edit Prospek</button>
                    <a href={`https://wa.me/${String(selected.whatsapp || selected.phone || "").replace(/\D/g, "")}`} target="_blank" rel="noreferrer">WhatsApp</a>
                    {selected.email ? <a href={`mailto:${selected.email}`}>Email</a> : null}
                    {canDelete ? <button className="danger" onClick={() => openDeleteModal("lead", selected)} type="button">Hapus</button> : null}
                  </div>
                </div>
              ) : <p className="admin-empty">Pilih prospek untuk melihat detail.</p>}
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

          {activeModule === "Buyers" ? (
            <BuyersModule
              filteredBuyerProfiles={filteredBuyerProfiles}
              exportRowsCsv={exportRowsCsv}
              query={query}
              setQuery={setQuery}
              listToText={listToText}
              labelAssignee={labelAssignee}
              openModal={openModal}
              openDeleteModal={openDeleteModal}
              canDelete={canDelete}
              buyerDraft={buyerDraft}
              setBuyerDraft={setBuyerDraft}
              buyerStages={buyerStages}
              relationshipStatuses={relationshipStatuses}
              assignableUsers={assignableUsers}
              saveBuyerProfile={saveBuyerProfile}
            />
          ) : null}

          {activeModule === "Suppliers" ? (
            <SuppliersModule
              filteredSuppliers={filteredSuppliers}
              exportRowsCsv={exportRowsCsv}
              query={query}
              setQuery={setQuery}
              listToText={listToText}
              openModal={openModal}
              openDeleteModal={openDeleteModal}
              canDelete={canDelete}
              supplierDraft={supplierDraft}
              setSupplierDraft={setSupplierDraft}
              supplierStatuses={supplierStatuses}
              saveSupplier={saveSupplier}
            />
          ) : null}

          {activeModule === "Documents" ? (
            <DocumentsModule
              filteredBusinessDocuments={filteredBusinessDocuments}
              exportRowsCsv={exportRowsCsv}
              query={query}
              setQuery={setQuery}
              formatDate={formatDate}
              openModal={openModal}
              openDeleteModal={openDeleteModal}
              canDelete={canDelete}
              documentDraft={documentDraft}
              setDocumentDraft={setDocumentDraft}
              documentTypes={documentTypes}
              documentStatuses={documentStatuses}
              saveBusinessDocument={saveBusinessDocument}
            />
          ) : null}

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
                <table className="admin-mobile-cards">
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
                        <td data-label="Date">{formatDate(item.created_at)}</td>
                        <td data-label="Investor"><strong>{item.full_name || "-"}</strong><span>{item.company_name || item.email || "-"}</span></td>
                        <td data-label="Country">{item.country || "-"}</td>
                        <td data-label="Interest">{item.investment_interest || "-"}</td>
                        <td data-label="Status">
                          <select value={item.status || "New"} onChange={(event) => updateInvestor(item.id, { status: event.target.value })}>
                            {statuses.map((status) => <option key={status}>{status}</option>)}
                          </select>
                        </td>
                        <td data-label="Message">{item.message || "-"}</td>
                        <td data-label="Actions">
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
            <AnalyticsModule
              events={events}
              metrics={metrics}
              conversionRate={conversionRate}
              mostClicked={mostClicked}
              chartData={chartData}
              leads={leads}
              latestEvents={latestEvents}
              BarList={BarList}
              buildCountMap={buildCountMap}
              formatDate={formatDate}
            />
          ) : null}

          {activeModule === "Finance" && canUseFinance ? (
            <FinanceModule financeView={financeView} showFinanceDetail={showFinanceDetail}>
              <FinanceOverview
                financeView={financeView}
                setFinanceView={setFinanceView}
                showFinanceDetail={showFinanceDetail}
                setShowFinanceDetail={setShowFinanceDetail}
                financeDisclosureTabs={financeDisclosureTabs}
                financeMenus={financeMenus}
                financeMetrics={financeMetrics}
                financeReminders={financeReminders}
                financeLockDraft={financeLockDraft}
                setFinanceLockDraft={setFinanceLockDraft}
                closingChecklist={closingChecklist}
                financePeriodLocks={financePeriodLocks}
                cashFlowVisual={cashFlowVisual}
                financePermissions={financePermissions}
                storageStatus={storageStatus}
                formatMoney={formatMoney}
                scrollToFinanceForm={scrollToFinanceForm}
                testFinanceOwnerAlerts={testFinanceOwnerAlerts}
                saveFinancePeriodLock={saveFinancePeriodLock}
                reopenFinancePeriodLock={reopenFinancePeriodLock}
                checkFinanceStorageStatus={checkFinanceStorageStatus}
                prepareFinanceStorage={prepareFinanceStorage}
              />
              <FinanceCashBank
                financeDraft={financeDraft}
                setFinanceDraft={setFinanceDraft}
                cashInCategories={cashInCategories}
                cashOutCategories={cashOutCategories}
                financeCurrencies={financeCurrencies}
                paymentMethods={paymentMethods}
                saveFinanceTransaction={saveFinanceTransaction}
                bankAccountDraft={bankAccountDraft}
                setBankAccountDraft={setBankAccountDraft}
                bankAccountStatuses={bankAccountStatuses}
                saveBankAccount={saveBankAccount}
                pettyCashDraft={pettyCashDraft}
                setPettyCashDraft={setPettyCashDraft}
                pettyCashStatuses={pettyCashStatuses}
                savePettyCash={savePettyCash}
              />
              <div className="admin-panel wide">
                <div className="admin-panel-header">
                  <div>
                    <p>Manajemen Pemasukan</p>
                    <h2>Divisi / Kategori / Produk</h2>
                  </div>
                  <button onClick={saveFinanceRevenue} type="button">Simpan Pemasukan</button>
                </div>
                <div className="admin-settings-form finance-form">
                  <label>Invoice Number<input value={revenueDraft.invoice_number} onChange={(event) => updateRevenueDraft("invoice_number", event.target.value)} placeholder="INV-GSN-2026-0001" /></label>
                  <label>Buyer Name<input value={revenueDraft.buyer_name} onChange={(event) => updateRevenueDraft("buyer_name", event.target.value)} placeholder="Buyer or company name" /></label>
                  <label>Country<input value={revenueDraft.country} onChange={(event) => updateRevenueDraft("country", event.target.value)} placeholder="Destination country" /></label>
                  <label>Date<input type="date" value={revenueDraft.transaction_date} onChange={(event) => updateRevenueDraft("transaction_date", event.target.value)} /></label>
                  <label>Division
                    <select value={revenueDraft.division} onChange={(event) => updateRevenueDraft("division", event.target.value)}>
                      {revenueDivisions.map((division) => <option key={division}>{division}</option>)}
                    </select>
                  </label>
                  <label>Category
                    <select value={revenueDraft.category} onChange={(event) => updateRevenueDraft("category", event.target.value)}>
                      {Object.keys(revenueCatalog[revenueDraft.division] || {}).map((category) => <option key={category}>{category}</option>)}
                    </select>
                  </label>
                  <label>Product
                    <select value={revenueDraft.product} onChange={(event) => updateRevenueDraft("product", event.target.value)}>
                      {(revenueCatalog[revenueDraft.division]?.[revenueDraft.category] || []).map((product) => <option key={product}>{product}</option>)}
                    </select>
                  </label>
                  <label>Unit<input value={revenueDraft.unit} onChange={(event) => updateRevenueDraft("unit", event.target.value)} placeholder="kg / MT / pcs / container" /></label>
                  <label>Quantity<input inputMode="decimal" value={revenueDraft.quantity} onChange={(event) => updateRevenueDraft("quantity", event.target.value)} placeholder="0" /></label>
                  <label>Unit Price<input inputMode="decimal" value={revenueDraft.unit_price} onChange={(event) => updateRevenueDraft("unit_price", event.target.value)} placeholder="0" /></label>
                  <label>Currency
                    <select value={revenueDraft.currency} onChange={(event) => updateRevenueDraft("currency", event.target.value)}>
                      {financeCurrencies.map((currency) => <option key={currency}>{currency}</option>)}
                    </select>
                  </label>
                  <label>Total Revenue<input inputMode="decimal" value={revenueDraft.total_revenue} onChange={(event) => updateRevenueDraft("total_revenue", event.target.value)} placeholder="Auto or manual total" /></label>
                </div>
              </div>

              <div className="admin-panel wide">
                <div className="admin-panel-header">
                  <div>
                    <p>Manajemen Pengeluaran</p>
                    <h2>Kategori / Subkategori / Persetujuan</h2>
                  </div>
                  <button onClick={saveFinanceExpense} type="button">Simpan Pengeluaran</button>
                </div>
                <div className="admin-settings-form finance-form">
                  <label>Date<input type="date" value={expenseDraft.expense_date} onChange={(event) => updateExpenseDraft("expense_date", event.target.value)} /></label>
                  <label>Category
                    <select value={expenseDraft.expense_category} onChange={(event) => updateExpenseDraft("expense_category", event.target.value)}>
                      {expenseCategories.map((category) => <option key={category}>{category}</option>)}
                    </select>
                  </label>
                  <label>Subcategory
                    <select value={expenseDraft.expense_subcategory} onChange={(event) => updateExpenseDraft("expense_subcategory", event.target.value)}>
                      {(expenseCatalog[expenseDraft.expense_category] || []).map((subcategory) => <option key={subcategory}>{subcategory}</option>)}
                    </select>
                  </label>
                  <label>Vendor<input value={expenseDraft.vendor} onChange={(event) => updateExpenseDraft("vendor", event.target.value)} placeholder="Vendor, supplier, or service provider" /></label>
                  <label>Amount<input inputMode="decimal" value={expenseDraft.amount} onChange={(event) => updateExpenseDraft("amount", event.target.value)} placeholder="0" /></label>
                  <label>Currency
                    <select value={expenseDraft.currency} onChange={(event) => updateExpenseDraft("currency", event.target.value)}>
                      {financeCurrencies.map((currency) => <option key={currency}>{currency}</option>)}
                    </select>
                  </label>
                  <label>Payment Method
                    <select value={expenseDraft.payment_method} onChange={(event) => updateExpenseDraft("payment_method", event.target.value)}>
                      {paymentMethods.map((method) => <option key={method}>{method}</option>)}
                    </select>
                  </label>
                  <label>Status
                    <select value={expenseDraft.status} onChange={(event) => updateExpenseDraft("status", event.target.value)}>
                      {expenseStatuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </label>
                  <label className="wide">Receipt URL
                    <input value={expenseDraft.receipt_url} onChange={(event) => updateExpenseDraft("receipt_url", event.target.value)} placeholder="Optional receipt/document link" />
                    <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx" onChange={(event) => uploadFinanceAttachment(event, setExpenseDraft, "receipt_url", "expense")} />
                    <small>{uploadingFinanceField === "expense-receipt_url" ? "Uploading receipt..." : "Upload receipt, invoice, transfer proof, or document."}</small>
                    {renderFinanceDocumentPreview(expenseDraft.receipt_url, "Expense receipt")}
                  </label>
                  <label className="wide">Description<textarea value={expenseDraft.description} onChange={(event) => updateExpenseDraft("description", event.target.value)} placeholder="Expense purpose, business context, or approval note" /></label>
                </div>
              </div>

              <div className="admin-panel wide">
                <div className="admin-panel-header">
                  <div>
                    <p>Finance Invoice</p>
                    <h2>Quotation to Accounts Receivable</h2>
                  </div>
                  <button onClick={createFinanceInvoiceFromQuotation} type="button">Create Invoice</button>
                </div>
                <div className="admin-settings-form finance-form">
                  <label>Quotation
                    <select value={financeInvoiceDraft.quotation_id} onChange={(event) => selectQuotationForFinanceInvoice(event.target.value)}>
                      <option value="">Select quotation</option>
                      {quotationRequests.map((item) => <option key={item.id} value={item.id}>{item.quotation_number || item.buyer_name || item.company_name || item.id}</option>)}
                    </select>
                  </label>
                  <label>Quotation Number<input value={financeInvoiceDraft.quotation_number} onChange={(event) => setFinanceInvoiceDraft((current) => ({ ...current, quotation_number: event.target.value }))} placeholder="GSN-QTN-2026-0001" /></label>
                  <label>Invoice Number<input value={financeInvoiceDraft.invoice_number} onChange={(event) => setFinanceInvoiceDraft((current) => ({ ...current, invoice_number: event.target.value }))} placeholder="GSN-INV-2026-0001" /></label>
                  <label>Invoice Date<input type="date" value={financeInvoiceDraft.invoice_date} onChange={(event) => setFinanceInvoiceDraft((current) => ({ ...current, invoice_date: event.target.value }))} /></label>
                  <label>Buyer<input value={financeInvoiceDraft.buyer_name} onChange={(event) => setFinanceInvoiceDraft((current) => ({ ...current, buyer_name: event.target.value }))} /></label>
                  <label>Amount<input inputMode="decimal" value={financeInvoiceDraft.amount} onChange={(event) => setFinanceInvoiceDraft((current) => ({ ...current, amount: event.target.value }))} placeholder="0" /></label>
                  <label>Currency
                    <select value={financeInvoiceDraft.currency} onChange={(event) => setFinanceInvoiceDraft((current) => ({ ...current, currency: event.target.value }))}>
                      {financeCurrencies.map((currency) => <option key={currency}>{currency}</option>)}
                    </select>
                  </label>
                  <label>Due Date<input type="date" value={financeInvoiceDraft.due_date} onChange={(event) => setFinanceInvoiceDraft((current) => ({ ...current, due_date: event.target.value }))} /></label>
                  <label className="wide">Commodity<input value={financeInvoiceDraft.commodity} onChange={(event) => setFinanceInvoiceDraft((current) => ({ ...current, commodity: event.target.value }))} placeholder="Products included in the quotation" /></label>
                </div>
              </div>

              <div className="admin-panel" id="finance-ar-ap-form">
                <div className="admin-panel-header">
                  <div>
                    <p>Accounts Receivable</p>
                    <h2>Buyer Invoices</h2>
                  </div>
                  <button onClick={saveFinanceReceivable} type="button">Save AR</button>
                </div>
                <div className="admin-settings-form compact">
                  <label>Invoice Number<input value={receivableDraft.invoice_number} onChange={(event) => setReceivableDraft((current) => ({ ...current, invoice_number: event.target.value }))} placeholder={getNextFinanceNumber(receivables, "GSN-INV")} /></label>
                  <label>Buyer Name<input value={receivableDraft.buyer_name} onChange={(event) => setReceivableDraft((current) => ({ ...current, buyer_name: event.target.value }))} placeholder="Buyer or company" /></label>
                  <label>Commodity<input value={receivableDraft.commodity} onChange={(event) => setReceivableDraft((current) => ({ ...current, commodity: event.target.value }))} placeholder="Product / commodity" /></label>
                  <label>Amount<input inputMode="decimal" value={receivableDraft.amount} onChange={(event) => setReceivableDraft((current) => ({ ...current, amount: event.target.value }))} placeholder="0" /></label>
                  <label>Currency
                    <select value={receivableDraft.currency} onChange={(event) => setReceivableDraft((current) => ({ ...current, currency: event.target.value }))}>
                      {financeCurrencies.map((currency) => <option key={currency}>{currency}</option>)}
                    </select>
                  </label>
                  <label>Due Date<input type="date" value={receivableDraft.due_date} onChange={(event) => setReceivableDraft((current) => ({ ...current, due_date: event.target.value }))} /></label>
                  <label>Status
                    <select value={receivableDraft.status} onChange={(event) => setReceivableDraft((current) => ({ ...current, status: event.target.value }))}>
                      {receivableStatuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </label>
                </div>
              </div>

              <div className="admin-panel">
                <div className="admin-panel-header">
                  <div>
                    <p>Accounts Payable</p>
                    <h2>Supplier Bills</h2>
                  </div>
                  <button onClick={saveFinancePayable} type="button">Save AP</button>
                </div>
                <div className="admin-settings-form compact">
                  <label>Supplier Name<input value={payableDraft.supplier_name} onChange={(event) => setPayableDraft((current) => ({ ...current, supplier_name: event.target.value }))} placeholder="Supplier or vendor" /></label>
                  <label>Invoice Number<input value={payableDraft.invoice_number} onChange={(event) => setPayableDraft((current) => ({ ...current, invoice_number: event.target.value }))} placeholder={getNextFinanceNumber(payables, "GSN-AP")} /></label>
                  <label>Commodity<input value={payableDraft.commodity} onChange={(event) => setPayableDraft((current) => ({ ...current, commodity: event.target.value }))} placeholder="Product / service / commodity" /></label>
                  <label>Amount<input inputMode="decimal" value={payableDraft.amount} onChange={(event) => setPayableDraft((current) => ({ ...current, amount: event.target.value }))} placeholder="0" /></label>
                  <label>Currency
                    <select value={payableDraft.currency} onChange={(event) => setPayableDraft((current) => ({ ...current, currency: event.target.value }))}>
                      {financeCurrencies.map((currency) => <option key={currency}>{currency}</option>)}
                    </select>
                  </label>
                  <label>Due Date<input type="date" value={payableDraft.due_date} onChange={(event) => setPayableDraft((current) => ({ ...current, due_date: event.target.value }))} /></label>
                  <label>Status
                    <select value={payableDraft.status} onChange={(event) => setPayableDraft((current) => ({ ...current, status: event.target.value }))}>
                      {payableStatuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </label>
                </div>
              </div>

              <div className="admin-panel" id="finance-payment-form">
                <div className="admin-panel-header">
                  <div>
                    <p>Payment Matching</p>
                    <h2>Buyer Payment to Invoice</h2>
                  </div>
                  <button onClick={savePaymentMatch} type="button">Match Payment</button>
                </div>
                <div className="admin-settings-form compact">
                  <label>AR Invoice
                    <select value={paymentMatchDraft.receivable_id} onChange={(event) => selectReceivableForMatch(event.target.value)}>
                      <option value="">Manual / Select invoice</option>
                      {receivables.map((item) => <option key={item.id} value={item.id}>{item.invoice_number || item.buyer_name || item.id}</option>)}
                    </select>
                  </label>
                  <label>Date<input type="date" value={paymentMatchDraft.payment_date} onChange={(event) => setPaymentMatchDraft((current) => ({ ...current, payment_date: event.target.value }))} /></label>
                  <label>Invoice Number<input value={paymentMatchDraft.invoice_number} onChange={(event) => setPaymentMatchDraft((current) => ({ ...current, invoice_number: event.target.value }))} /></label>
                  <label>Buyer<input value={paymentMatchDraft.buyer_name} onChange={(event) => setPaymentMatchDraft((current) => ({ ...current, buyer_name: event.target.value }))} /></label>
                  <label>Amount<input inputMode="decimal" value={paymentMatchDraft.amount} onChange={(event) => setPaymentMatchDraft((current) => ({ ...current, amount: event.target.value }))} /></label>
                  <label>Currency
                    <select value={paymentMatchDraft.currency} onChange={(event) => setPaymentMatchDraft((current) => ({ ...current, currency: event.target.value }))}>
                      {financeCurrencies.map((currency) => <option key={currency}>{currency}</option>)}
                    </select>
                  </label>
                  <label>Method
                    <select value={paymentMatchDraft.payment_method} onChange={(event) => setPaymentMatchDraft((current) => ({ ...current, payment_method: event.target.value }))}>
                      {paymentMethods.map((method) => <option key={method}>{method}</option>)}
                    </select>
                  </label>
                  <label>Status
                    <select value={paymentMatchDraft.status} onChange={(event) => setPaymentMatchDraft((current) => ({ ...current, status: event.target.value }))}>
                      {paymentMatchStatuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </label>
                  <label className="wide">Proof URL
                    <input value={paymentMatchDraft.proof_url} onChange={(event) => setPaymentMatchDraft((current) => ({ ...current, proof_url: event.target.value }))} placeholder="Transfer proof or bank mutation link" />
                    <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx" onChange={(event) => uploadFinanceAttachment(event, setPaymentMatchDraft, "proof_url", "payment")} />
                    <small>{uploadingFinanceField === "payment-proof_url" ? "Uploading payment proof..." : "Upload buyer payment proof or bank mutation."}</small>
                    {renderFinanceDocumentPreview(paymentMatchDraft.proof_url, "Buyer payment proof")}
                  </label>
                  <label className="wide">Notes<textarea value={paymentMatchDraft.notes} onChange={(event) => setPaymentMatchDraft((current) => ({ ...current, notes: event.target.value }))} /></label>
                </div>
              </div>

              <div className="admin-panel">
                <div className="admin-panel-header">
                  <div>
                    <p>Supplier Payment</p>
                    <h2>AP Schedule & History</h2>
                  </div>
                  <button onClick={saveSupplierPayment} type="button">Save Payment</button>
                </div>
                <div className="admin-settings-form compact">
                  <label>AP Invoice
                    <select value={supplierPaymentDraft.payable_id} onChange={(event) => selectPayableForPayment(event.target.value)}>
                      <option value="">Manual / Select bill</option>
                      {payables.map((item) => <option key={item.id} value={item.id}>{item.invoice_number || item.supplier_name || item.id}</option>)}
                    </select>
                  </label>
                  <label>Date<input type="date" value={supplierPaymentDraft.payment_date} onChange={(event) => setSupplierPaymentDraft((current) => ({ ...current, payment_date: event.target.value }))} /></label>
                  <label>Supplier<input value={supplierPaymentDraft.supplier_name} onChange={(event) => setSupplierPaymentDraft((current) => ({ ...current, supplier_name: event.target.value }))} /></label>
                  <label>Supplier Account<input value={supplierPaymentDraft.supplier_account} onChange={(event) => setSupplierPaymentDraft((current) => ({ ...current, supplier_account: event.target.value }))} placeholder="Bank / VA / account" /></label>
                  <label>Invoice Number<input value={supplierPaymentDraft.invoice_number} onChange={(event) => setSupplierPaymentDraft((current) => ({ ...current, invoice_number: event.target.value }))} /></label>
                  <label>Amount<input inputMode="decimal" value={supplierPaymentDraft.amount} onChange={(event) => setSupplierPaymentDraft((current) => ({ ...current, amount: event.target.value }))} /></label>
                  <label>Currency
                    <select value={supplierPaymentDraft.currency} onChange={(event) => setSupplierPaymentDraft((current) => ({ ...current, currency: event.target.value }))}>
                      {financeCurrencies.map((currency) => <option key={currency}>{currency}</option>)}
                    </select>
                  </label>
                  <label>Method
                    <select value={supplierPaymentDraft.payment_method} onChange={(event) => setSupplierPaymentDraft((current) => ({ ...current, payment_method: event.target.value }))}>
                      {paymentMethods.map((method) => <option key={method}>{method}</option>)}
                    </select>
                  </label>
                  <label>Status
                    <select value={supplierPaymentDraft.status} onChange={(event) => setSupplierPaymentDraft((current) => ({ ...current, status: event.target.value }))}>
                      {supplierPaymentStatuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </label>
                  <label className="wide">Proof URL
                    <input value={supplierPaymentDraft.proof_url} onChange={(event) => setSupplierPaymentDraft((current) => ({ ...current, proof_url: event.target.value }))} />
                    <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx" onChange={(event) => uploadFinanceAttachment(event, setSupplierPaymentDraft, "proof_url", "supplier")} />
                    <small>{uploadingFinanceField === "supplier-proof_url" ? "Uploading supplier proof..." : "Upload supplier transfer proof or payment document."}</small>
                    {renderFinanceDocumentPreview(supplierPaymentDraft.proof_url, "Supplier payment proof")}
                  </label>
                  <label className="wide">Notes<textarea value={supplierPaymentDraft.notes} onChange={(event) => setSupplierPaymentDraft((current) => ({ ...current, notes: event.target.value }))} /></label>
                </div>
              </div>

              <div className="admin-panel" id="finance-tax-form">
                <div className="admin-panel-header">
                  <div>
                    <p>Tax & Compliance</p>
                    <h2>PPN / Export Tax / Legal Docs</h2>
                  </div>
                  <button onClick={saveTaxRecord} type="button">Save Tax</button>
                </div>
                <div className="admin-settings-form compact">
                  <label>Period<input value={taxDraft.tax_period} onChange={(event) => setTaxDraft((current) => ({ ...current, tax_period: event.target.value }))} placeholder="2026-06" /></label>
                  <label>Tax Type
                    <select value={taxDraft.tax_type} onChange={(event) => setTaxDraft((current) => ({ ...current, tax_type: event.target.value }))}>
                      {taxTypes.map((type) => <option key={type}>{type}</option>)}
                    </select>
                  </label>
                  <label>Reference<input value={taxDraft.reference_number} onChange={(event) => setTaxDraft((current) => ({ ...current, reference_number: event.target.value }))} /></label>
                  <label>Taxable Amount<input inputMode="decimal" value={taxDraft.taxable_amount} onChange={(event) => setTaxDraft((current) => ({ ...current, taxable_amount: event.target.value }))} /></label>
                  <label>Tax Amount<input inputMode="decimal" value={taxDraft.tax_amount} onChange={(event) => setTaxDraft((current) => ({ ...current, tax_amount: event.target.value }))} /></label>
                  <label>Currency
                    <select value={taxDraft.currency} onChange={(event) => setTaxDraft((current) => ({ ...current, currency: event.target.value }))}>
                      {financeCurrencies.map((currency) => <option key={currency}>{currency}</option>)}
                    </select>
                  </label>
                  <label>Due Date<input type="date" value={taxDraft.due_date} onChange={(event) => setTaxDraft((current) => ({ ...current, due_date: event.target.value }))} /></label>
                  <label>Status
                    <select value={taxDraft.status} onChange={(event) => setTaxDraft((current) => ({ ...current, status: event.target.value }))}>
                      {taxStatuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </label>
                  <label className="wide">Document URL
                    <input value={taxDraft.document_url} onChange={(event) => setTaxDraft((current) => ({ ...current, document_url: event.target.value }))} placeholder="Tax document / legal file link" />
                    <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx" onChange={(event) => uploadFinanceAttachment(event, setTaxDraft, "document_url", "tax")} />
                    <small>{uploadingFinanceField === "tax-document_url" ? "Uploading tax document..." : "Upload tax, legal, or compliance document."}</small>
                    {renderFinanceDocumentPreview(taxDraft.document_url, "Tax document")}
                  </label>
                  <label className="wide">Notes<textarea value={taxDraft.notes} onChange={(event) => setTaxDraft((current) => ({ ...current, notes: event.target.value }))} /></label>
                </div>
              </div>

              <div className="admin-panel">
                <div className="admin-panel-header">
                  <div>
                    <p>Currency Conversion</p>
                    <h2>Exchange Rates</h2>
                  </div>
                  <button onClick={saveExchangeRate} type="button">Save Rate</button>
                </div>
                <div className="admin-settings-form compact">
                  <label>Date<input type="date" value={exchangeRateDraft.rate_date} onChange={(event) => setExchangeRateDraft((current) => ({ ...current, rate_date: event.target.value }))} /></label>
                  <label>Base
                    <select value={exchangeRateDraft.base_currency} onChange={(event) => setExchangeRateDraft((current) => ({ ...current, base_currency: event.target.value }))}>
                      {financeCurrencies.map((currency) => <option key={currency}>{currency}</option>)}
                    </select>
                  </label>
                  <label>Target
                    <select value={exchangeRateDraft.target_currency} onChange={(event) => setExchangeRateDraft((current) => ({ ...current, target_currency: event.target.value }))}>
                      {financeCurrencies.map((currency) => <option key={currency}>{currency}</option>)}
                    </select>
                  </label>
                  <label>Rate<input inputMode="decimal" value={exchangeRateDraft.rate} onChange={(event) => setExchangeRateDraft((current) => ({ ...current, rate: event.target.value }))} placeholder="Example: 0.000061" /></label>
                  <label>Source<input value={exchangeRateDraft.source} onChange={(event) => setExchangeRateDraft((current) => ({ ...current, source: event.target.value }))} placeholder="Bank / BI / manual" /></label>
                  <label className="wide">Notes<textarea value={exchangeRateDraft.notes} onChange={(event) => setExchangeRateDraft((current) => ({ ...current, notes: event.target.value }))} /></label>
                </div>
                <div className="admin-finance-signals">
                  <article><span>Net Profit USD</span><strong>{currencyConversionSummary.usdRate ? formatMoney(currencyConversionSummary.netProfitUsd, "USD") : "-"}</strong></article>
                  <article><span>Net Profit SGD</span><strong>{currencyConversionSummary.sgdRate ? formatMoney(currencyConversionSummary.netProfitSgd, "SGD") : "-"}</strong></article>
                </div>
              </div>

              <div className="admin-panel wide">
                <div className="admin-panel-header">
                  <div>
                    <p>Recent Transactions</p>
                    <h2>Cash, Revenue, Expense</h2>
                  </div>
                  <div className="admin-actions">
                    <button disabled={!financeTransactions.length} onClick={() => printFinanceTransactions(financeTransactions)} type="button">PDF / Print</button>
                    <button disabled={!financeTransactions.length} onClick={() => exportFinanceTransactionsCsv(financeTransactions)} type="button">CSV</button>
                    <button disabled={!financeTransactions.length} onClick={() => exportFinanceTransactionsExcel(financeTransactions)} type="button">Excel</button>
                  </div>
                </div>
                <div className="admin-table-wrap">
                  <table className="admin-mobile-cards">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Reference</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financeTransactions.slice(0, 10).map((item) => (
                        <tr key={item.id}>
                          <td data-label="Date">{formatDate(item.transaction_date || item.created_at)}</td>
                          <td data-label="Type">{item.transaction_type || "-"}</td>
                          <td data-label="Category">{item.category || "-"}</td>
                          <td data-label="Description">{item.description || "-"}</td>
                          <td data-label="Amount">{formatMoney(item.amount, item.currency || "IDR")}</td>
                          <td data-label="Reference">{item.reference_number || "-"}</td>
                          <td data-label="Actions">
                            <div className="admin-table-actions">
                              <button onClick={() => openModal("financeTransaction", item)} type="button">Edit</button>
                              <button className="danger" onClick={() => openDeleteModal("financeTransaction", item)} type="button">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!financeTransactions.length ? <p className="admin-empty table">Finance database is ready, but no cash transaction has been recorded yet.</p> : null}
                </div>
              </div>

              <div className="admin-panel wide">
                <div className="admin-panel-header">
                  <div>
                    <p>Bank & Petty Cash Monitor</p>
                    <h2>Liquidity Records</h2>
                  </div>
                  <span className="admin-muted">Bank balances, reimburse, and cash opname tracking</span>
                </div>
                <div className="admin-split-tables">
                  <div className="admin-table-wrap">
                    <table className="admin-mobile-cards">
                      <thead><tr><th>Account</th><th>Bank</th><th>Balance</th><th>Status</th><th>Actions</th></tr></thead>
                      <tbody>
                        {bankAccounts.slice(0, 8).map((item) => (
                          <tr key={item.id}>
                            <td data-label="Account">{item.account_name || "-"}</td>
                            <td data-label="Bank">{item.bank_name || "-"}</td>
                            <td data-label="Balance">{formatMoney(item.current_balance, item.currency || "IDR")}</td>
                            <td data-label="Status">{item.status || "Active"}</td>
                            <td data-label="Actions">
                              <div className="admin-table-actions">
                                <button onClick={() => openModal("bankAccount", item)} type="button">Edit</button>
                                <button className="danger" onClick={() => openDeleteModal("bankAccount", item)} type="button">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!bankAccounts.length ? <p className="admin-empty table">No bank account records yet.</p> : null}
                  </div>
                  <div className="admin-table-wrap">
                    <table className="admin-mobile-cards">
                      <thead><tr><th>Date</th><th>Description</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
                      <tbody>
                        {pettyCash.slice(0, 8).map((item) => (
                          <tr key={item.id}>
                            <td data-label="Date">{formatDate(item.cash_date || item.created_at)}</td>
                            <td data-label="Description">{item.description || "-"}</td>
                            <td data-label="Amount">{formatMoney(item.amount, item.currency || "IDR")}</td>
                            <td data-label="Status">{item.status || "Recorded"}</td>
                            <td data-label="Actions">
                              <div className="admin-table-actions">
                                <button onClick={() => openModal("pettyCash", item)} type="button">Edit</button>
                                <button className="danger" onClick={() => openDeleteModal("pettyCash", item)} type="button">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!pettyCash.length ? <p className="admin-empty table">No petty cash records yet.</p> : null}
                  </div>
                </div>
              </div>

              <div className="admin-panel wide" id="finance-revenue-form">
                <div className="admin-panel-header">
                  <div>
                    <p>Revenue Records</p>
                    <h2>Recent Sales Revenue</h2>
                  </div>
                  <span className="admin-muted">Prepared for CSV / Excel / PDF export</span>
                </div>
                <div className="admin-table-wrap">
                  <table className="admin-mobile-cards">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Invoice</th>
                        <th>Buyer</th>
                        <th>Division</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financeRevenues.slice(0, 10).map((item) => (
                        <tr key={item.id}>
                          <td data-label="Date">{formatDate(item.transaction_date || item.created_at)}</td>
                          <td data-label="Invoice">{item.invoice_number || "-"}</td>
                          <td data-label="Buyer">{item.buyer_name || "-"}</td>
                          <td data-label="Division">{item.division || "-"}</td>
                          <td data-label="Product">{item.product || "-"}</td>
                          <td data-label="Quantity">{item.quantity || "-"} {item.unit || ""}</td>
                          <td data-label="Total">{formatMoney(item.total_revenue, item.currency || "IDR")}</td>
                          <td data-label="Actions">
                            <div className="admin-table-actions">
                              <button onClick={() => openModal("financeRevenue", item)} type="button">Edit</button>
                              <button className="danger" onClick={() => openDeleteModal("financeRevenue", item)} type="button">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!financeRevenues.length ? <p className="admin-empty table">No revenue record has been saved yet.</p> : null}
                </div>
              </div>

              <div className="admin-panel wide" id="finance-expense-form">
                <div className="admin-panel-header">
                  <div>
                    <p>Expense Records</p>
                    <h2>Recent Operational Spending</h2>
                  </div>
                  <span className="admin-muted">Prepared for approval workflow, receipt upload, and export</span>
                </div>
                <div className="admin-table-wrap">
                  <table className="admin-mobile-cards">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Category</th>
                        <th>Subcategory</th>
                        <th>Vendor</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financeExpenses.slice(0, 10).map((item) => (
                        <tr key={item.id}>
                          <td data-label="Date">{formatDate(item.expense_date || item.created_at)}</td>
                          <td data-label="Category">{item.expense_category || "-"}</td>
                          <td data-label="Subcategory">{item.expense_subcategory || "-"}</td>
                          <td data-label="Vendor">{item.vendor || "-"}</td>
                          <td data-label="Amount">{formatMoney(item.amount, item.currency || "IDR")}</td>
                          <td data-label="Status">{item.status || "Draft"}</td>
                          <td data-label="Actions">
                            <div className="admin-table-actions">
                              {["Draft", "Pending Approval"].includes(item.status || "Draft") ? <button onClick={() => startExpenseApproval(item, "Approved")} type="button">Approve</button> : null}
                              {item.status !== "Rejected" ? <button onClick={() => startExpenseApproval(item, "Rejected")} type="button">Reject</button> : null}
                              <button onClick={() => openModal("financeExpense", item)} type="button">Edit</button>
                              <button className="danger" onClick={() => openDeleteModal("financeExpense", item)} type="button">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!financeExpenses.length ? <p className="admin-empty table">No expense record has been saved yet.</p> : null}
                </div>
                {expenseApprovalDraft.id ? (
                  <div className="admin-settings-form compact">
                    <label className="wide">Approval Note
                      <textarea value={expenseApprovalDraft.note} onChange={(event) => setExpenseApprovalDraft((current) => ({ ...current, note: event.target.value }))} placeholder="Reason, condition, or rejection note" />
                    </label>
                    <div className="admin-actions">
                      <button onClick={submitExpenseApproval} type="button">{expenseApprovalDraft.status} Expense</button>
                      <button onClick={() => setExpenseApprovalDraft({ id: "", status: "", note: "" })} type="button">Cancel</button>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="admin-panel wide">
                <div className="admin-panel-header">
                  <div>
                    <p>AR / AP Monitor</p>
                    <h2>Outstanding Payments</h2>
                  </div>
                  <span className="admin-muted">Collection and supplier payment tracking</span>
                </div>
                <div className="admin-split-tables">
                  <div className="admin-table-wrap">
                    <table className="admin-mobile-cards">
                      <thead>
                        <tr>
                          <th>Due Date</th>
                          <th>Invoice</th>
                          <th>Buyer</th>
                          <th>Commodity</th>
                          <th>Amount</th>
                          <th>Paid</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {receivables.slice(0, 8).map((item) => (
                          <tr key={item.id}>
                            <td data-label="Due Date">{item.due_date ? formatDate(item.due_date) : "-"}</td>
                            <td data-label="Invoice">{item.invoice_number || item.quotation_number || "-"}</td>
                            <td data-label="Buyer">{item.buyer_name || item.invoice_number || "-"}</td>
                            <td data-label="Commodity">{item.commodity || "-"}</td>
                            <td data-label="Amount">{formatMoney(item.amount, item.currency || "IDR")}</td>
                            <td data-label="Paid">{formatMoney(item.paid_amount || 0, item.currency || "IDR")}</td>
                            <td data-label="Status">{item.status || "Draft"}</td>
                            <td data-label="Actions">
                              <div className="admin-table-actions">
                                <button onClick={() => openModal("financeReceivable", item)} type="button">Edit</button>
                                <button className="danger" onClick={() => openDeleteModal("financeReceivable", item)} type="button">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!receivables.length ? <p className="admin-empty table">No receivable records yet.</p> : null}
                  </div>
                  <div className="admin-table-wrap">
                    <table className="admin-mobile-cards">
                      <thead>
                        <tr>
                          <th>Due Date</th>
                          <th>Supplier</th>
                          <th>Commodity</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payables.slice(0, 8).map((item) => (
                          <tr key={item.id}>
                            <td data-label="Due Date">{item.due_date ? formatDate(item.due_date) : "-"}</td>
                            <td data-label="Supplier">{item.supplier_name || item.invoice_number || "-"}</td>
                            <td data-label="Commodity">{item.commodity || "-"}</td>
                            <td data-label="Amount">{formatMoney(item.amount, item.currency || "IDR")}</td>
                            <td data-label="Status">{item.status || "Unpaid"}</td>
                            <td data-label="Actions">
                              <div className="admin-table-actions">
                                <button onClick={() => openModal("financePayable", item)} type="button">Edit</button>
                                <button className="danger" onClick={() => openDeleteModal("financePayable", item)} type="button">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!payables.length ? <p className="admin-empty table">No payable records yet.</p> : null}
                  </div>
                </div>
              </div>

              <div className="admin-panel wide">
                <div className="admin-panel-header">
                  <div>
                    <p>Payment Reconciliation</p>
                    <h2>Buyer & Supplier Payment History</h2>
                  </div>
                  <span className="admin-muted">Invoice matching, payment proof, and payment status</span>
                </div>
                <div className="admin-split-tables">
                  <div className="admin-table-wrap">
                    <table className="admin-mobile-cards">
                      <thead><tr><th>Date</th><th>Invoice</th><th>Buyer</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
                      <tbody>
                        {paymentMatches.slice(0, 10).map((item) => (
                          <tr key={item.id}>
                            <td data-label="Date">{formatDate(item.payment_date || item.created_at)}</td>
                            <td data-label="Invoice">{item.invoice_number || "-"}</td>
                            <td data-label="Buyer">{item.buyer_name || "-"}</td>
                            <td data-label="Amount">{formatMoney(item.amount, item.currency || "IDR")}</td>
                            <td data-label="Status">{item.status || "Matched"}</td>
                            <td data-label="Actions">
                              <div className="admin-table-actions">
                                <button onClick={() => openModal("paymentMatch", item)} type="button">Edit</button>
                                <button className="danger" onClick={() => openDeleteModal("paymentMatch", item)} type="button">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!paymentMatches.length ? <p className="admin-empty table">No buyer payment matches yet.</p> : null}
                  </div>
                  <div className="admin-table-wrap">
                    <table className="admin-mobile-cards">
                      <thead><tr><th>Date</th><th>Supplier</th><th>Invoice</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
                      <tbody>
                        {supplierPayments.slice(0, 10).map((item) => (
                          <tr key={item.id}>
                            <td data-label="Date">{formatDate(item.payment_date || item.created_at)}</td>
                            <td data-label="Supplier">{item.supplier_name || "-"}</td>
                            <td data-label="Invoice">{item.invoice_number || "-"}</td>
                            <td data-label="Amount">{formatMoney(item.amount, item.currency || "IDR")}</td>
                            <td data-label="Status">{item.status || "Scheduled"}</td>
                            <td data-label="Actions">
                              <div className="admin-table-actions">
                                <button onClick={() => openModal("supplierPayment", item)} type="button">Edit</button>
                                <button className="danger" onClick={() => openDeleteModal("supplierPayment", item)} type="button">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!supplierPayments.length ? <p className="admin-empty table">No supplier payment records yet.</p> : null}
                  </div>
                </div>
              </div>

              <div className="admin-panel wide">
                <div className="admin-panel-header">
                  <div>
                    <p>Compliance & Currency</p>
                    <h2>Tax Records and Exchange Rates</h2>
                  </div>
                  <span className="admin-muted">Tax due dates, legal docs, and manual exchange rates</span>
                </div>
                <div className="admin-split-tables">
                  <div className="admin-table-wrap">
                    <table className="admin-mobile-cards">
                      <thead><tr><th>Period</th><th>Type</th><th>Tax</th><th>Due</th><th>Status</th><th>Actions</th></tr></thead>
                      <tbody>
                        {taxRecords.slice(0, 10).map((item) => (
                          <tr key={item.id}>
                            <td data-label="Period">{item.tax_period || "-"}</td>
                            <td data-label="Type">{item.tax_type || "-"}</td>
                            <td data-label="Tax">{formatMoney(item.tax_amount, item.currency || "IDR")}</td>
                            <td data-label="Due">{item.due_date ? formatDate(item.due_date) : "-"}</td>
                            <td data-label="Status">{item.status || "Draft"}</td>
                            <td data-label="Actions">
                              <div className="admin-table-actions">
                                <button onClick={() => openModal("taxRecord", item)} type="button">Edit</button>
                                <button className="danger" onClick={() => openDeleteModal("taxRecord", item)} type="button">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!taxRecords.length ? <p className="admin-empty table">No tax or compliance records yet.</p> : null}
                  </div>
                  <div className="admin-table-wrap">
                    <table className="admin-mobile-cards">
                      <thead><tr><th>Date</th><th>Pair</th><th>Rate</th><th>Source</th><th>Actions</th></tr></thead>
                      <tbody>
                        {exchangeRates.slice(0, 10).map((item) => (
                          <tr key={item.id}>
                            <td data-label="Date">{formatDate(item.rate_date || item.created_at)}</td>
                            <td data-label="Pair">{item.base_currency} / {item.target_currency}</td>
                            <td data-label="Rate">{item.rate}</td>
                            <td data-label="Source">{item.source || "-"}</td>
                            <td data-label="Actions">
                              <div className="admin-table-actions">
                                <button onClick={() => openModal("exchangeRate", item)} type="button">Edit</button>
                                <button className="danger" onClick={() => openDeleteModal("exchangeRate", item)} type="button">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!exchangeRates.length ? <p className="admin-empty table">No exchange rates saved yet.</p> : null}
                  </div>
                </div>
              </div>

              <div className="admin-panel wide" id="finance-budget-form">
                <div className="admin-panel-header">
                  <div>
                    <p>Budget & Planning</p>
                    <h2>Planned Budget vs Actual Spending</h2>
                  </div>
                  <button onClick={saveFinanceBudget} type="button">Save Budget</button>
                </div>
                <div className="admin-settings-form finance-form">
                  <label>Fiscal Year<input inputMode="numeric" value={budgetDraft.fiscal_year} onChange={(event) => setBudgetDraft((current) => ({ ...current, fiscal_year: event.target.value }))} placeholder="2026" /></label>
                  <label>Budget Category
                    <select value={budgetDraft.budget_category} onChange={(event) => setBudgetDraft((current) => ({ ...current, budget_category: event.target.value }))}>
                      {budgetCategories.map((category) => <option key={category}>{category}</option>)}
                    </select>
                  </label>
                  <label>Planned Budget<input inputMode="decimal" value={budgetDraft.planned_budget} onChange={(event) => setBudgetDraft((current) => ({ ...current, planned_budget: event.target.value }))} placeholder="0" /></label>
                  <label>Actual Spending<input inputMode="decimal" value={budgetDraft.actual_spending} onChange={(event) => setBudgetDraft((current) => ({ ...current, actual_spending: event.target.value }))} placeholder="0" /></label>
                  <label>Currency
                    <select value={budgetDraft.currency} onChange={(event) => setBudgetDraft((current) => ({ ...current, currency: event.target.value }))}>
                      {financeCurrencies.map((currency) => <option key={currency}>{currency}</option>)}
                    </select>
                  </label>
                  <label>Remaining Budget<input disabled value={formatMoney((Number(budgetDraft.planned_budget || 0) - Number(budgetDraft.actual_spending || 0)), budgetDraft.currency)} /></label>
                </div>
              </div>

              <div className="admin-panel wide">
                <div className="admin-panel-header">
                  <div>
                    <p>Budget Monitor</p>
                    <h2>Utilization Overview</h2>
                  </div>
                  <span className="admin-muted">Tracks planned, actual, and remaining budget per category</span>
                </div>
                <div className="admin-budget-list">
                  {budgets.slice(0, 12).map((item) => {
                    const planned = parseAmount(item.planned_budget);
                    const actual = parseAmount(item.actual_spending);
                    const utilization = planned > 0 ? Math.min(100, Math.round((actual / planned) * 100)) : 0;
                    return (
                      <article key={item.id}>
                        <div>
                          <strong>{item.budget_category}</strong>
                          <span>{item.fiscal_year} | {formatMoney(item.remaining_budget, item.currency || "IDR")} remaining</span>
                        </div>
                        <div className="admin-budget-bar" aria-label={`${utilization}% budget utilization`}>
                          <span style={{ width: `${utilization}%` }} />
                        </div>
                        <small>{formatMoney(item.actual_spending, item.currency || "IDR")} / {formatMoney(item.planned_budget, item.currency || "IDR")} used</small>
                        <div className="admin-table-actions">
                          <button onClick={() => openModal("financeBudget", item)} type="button">Edit</button>
                          <button className="danger" onClick={() => openDeleteModal("financeBudget", item)} type="button">Delete</button>
                        </div>
                      </article>
                    );
                  })}
                  {!budgets.length ? <p className="admin-empty">No budget planning records yet.</p> : null}
                </div>
              </div>

              <div className="admin-panel wide" id="finance-report-form">
                <div className="admin-panel-header">
                  <div>
                    <p>Financial Reports</p>
                    <h2>Profit, Cash Flow, and Budget Summary</h2>
                  </div>
                  <div className="admin-actions">
                    <button onClick={() => printFinanceReport(financialReportSummary, financialReportDraft)} type="button">PDF / Print</button>
                    <button onClick={() => exportFinanceReportCsv(financialReportSummary)} type="button">CSV</button>
                    <button onClick={() => exportFinanceReportExcel(financialReportSummary, financialReportDraft)} type="button">Excel</button>
                    <button onClick={saveFinancialReport} type="button">Save Report</button>
                  </div>
                </div>
                <div className="admin-settings-form finance-form">
                  <label>Report Type
                    <select value={financialReportDraft.report_type} onChange={(event) => setFinancialReportDraft((current) => ({ ...current, report_type: event.target.value }))}>
                      {financialReportTypes.map((type) => <option key={type}>{type}</option>)}
                    </select>
                  </label>
                  <label>Report Title<input value={financialReportDraft.title} onChange={(event) => setFinancialReportDraft((current) => ({ ...current, title: event.target.value }))} placeholder="GSN Financial Summary" /></label>
                  <label>Period
                    <select
                      value={financialReportDraft.period_preset}
                      onChange={(event) => {
                        const preset = event.target.value;
                        const range = preset === "Custom" ? { from: financialReportDraft.date_from, to: financialReportDraft.date_to } : getPeriodRange(preset);
                        setFinancialReportDraft((current) => ({
                          ...current,
                          period_preset: preset,
                          date_from: range.from,
                          date_to: range.to
                        }));
                      }}
                    >
                      {financePeriodPresets.map((preset) => <option key={preset}>{preset}</option>)}
                    </select>
                  </label>
                  <label>Date From<input type="date" value={financialReportDraft.date_from} onChange={(event) => setFinancialReportDraft((current) => ({ ...current, date_from: event.target.value }))} /></label>
                  <label>Date To<input type="date" value={financialReportDraft.date_to} onChange={(event) => setFinancialReportDraft((current) => ({ ...current, date_to: event.target.value }))} /></label>
                </div>
                <div className="admin-finance-report-grid">
                  <article>
                    <span>Profit & Loss</span>
                    <strong>{formatMoney(financialReportSummary.netProfit, financialReportSummary.currency)}</strong>
                    <small>Revenue {formatMoney(financialReportSummary.totalRevenue, financialReportSummary.currency)} | Expense {formatMoney(financialReportSummary.totalExpenses, financialReportSummary.currency)}</small>
                  </article>
                  <article>
                    <span>Cash Flow</span>
                    <strong>{formatMoney(financialReportSummary.netCashFlow, financialReportSummary.currency)}</strong>
                    <small>Cash In {formatMoney(financialReportSummary.cashIn, financialReportSummary.currency)} | Cash Out {formatMoney(financialReportSummary.cashOut, financialReportSummary.currency)}</small>
                  </article>
                  <article>
                    <span>AR / AP Position</span>
                    <strong>{formatMoney(financialReportSummary.receivableOutstanding - financialReportSummary.payableOutstanding, financialReportSummary.currency)}</strong>
                    <small>AR {formatMoney(financialReportSummary.receivableOutstanding, financialReportSummary.currency)} | AP {formatMoney(financialReportSummary.payableOutstanding, financialReportSummary.currency)}</small>
                  </article>
                  <article>
                    <span>Budget Remaining</span>
                    <strong>{formatMoney(financialReportSummary.remainingBudget, financialReportSummary.currency)}</strong>
                    <small>Actual {formatMoney(financialReportSummary.actualBudget, financialReportSummary.currency)} / Planned {formatMoney(financialReportSummary.plannedBudget, financialReportSummary.currency)}</small>
                  </article>
                </div>
                <div className="admin-report-breakdown">
                  <div>
                    <h3>Revenue Breakdown</h3>
                    {Object.entries(financialReportSummary.revenueByDivision).length ? Object.entries(financialReportSummary.revenueByDivision).map(([division, amount]) => (
                      <p key={division}><span>{division}</span><strong>{formatMoney(amount, financialReportSummary.currency)}</strong></p>
                    )) : <p className="admin-empty">No revenue breakdown yet.</p>}
                  </div>
                  <div>
                    <h3>Expense Breakdown</h3>
                    {Object.entries(financialReportSummary.expenseByCategory).length ? Object.entries(financialReportSummary.expenseByCategory).map(([category, amount]) => (
                      <p key={category}><span>{category}</span><strong>{formatMoney(amount, financialReportSummary.currency)}</strong></p>
                    )) : <p className="admin-empty">No expense breakdown yet.</p>}
                  </div>
                </div>
              </div>

              <div className="admin-panel wide">
                <div className="admin-panel-header">
                  <div>
                    <p>Saved Reports</p>
                    <h2>Financial Report History</h2>
                  </div>
                  <span className="admin-muted">{financialReports.length} reports saved</span>
                </div>
                <div className="admin-table-wrap">
                  <table className="admin-mobile-cards">
                    <thead><tr><th>Date</th><th>Type</th><th>Title</th><th>Net Profit</th><th>Generated By</th><th>Actions</th></tr></thead>
                    <tbody>
                      {financialReports.slice(0, 10).map((item) => {
                        const reportData = item.report_data || {};
                        return (
                          <tr key={item.id}>
                            <td data-label="Date">{formatDate(item.created_at)}</td>
                            <td data-label="Type">{item.report_type}</td>
                            <td data-label="Title">{item.title}</td>
                            <td data-label="Net Profit">{formatMoney(reportData.netProfit || 0, reportData.currency || "IDR")}</td>
                            <td data-label="Generated By">{item.generated_by || "-"}</td>
                            <td data-label="Actions">
                              <div className="admin-table-actions">
                                <button onClick={() => printFinanceReport(reportData, makeSavedReportDraft(item))} type="button">PDF</button>
                                <button onClick={() => exportFinanceReportCsv(reportData)} type="button">CSV</button>
                                <button onClick={() => exportFinanceReportExcel(reportData, makeSavedReportDraft(item))} type="button">Excel</button>
                                <button onClick={() => openModal("financeReport", item)} type="button">Edit</button>
                                <button className="danger" onClick={() => openDeleteModal("financeReport", item)} type="button">Delete</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {!financialReports.length ? <p className="admin-empty table">No financial report has been saved yet.</p> : null}
                </div>
              </div>

              <div className="admin-panel wide">
                <div className="admin-panel-header compact"><div><p>Investor Reports</p><h2>Financial Reporting Readiness</h2></div></div>
                <div className="admin-finance-menu compact">
                  <article><strong>Financial Reports</strong><span>Profit & Loss, Cash Flow, Revenue, Expense, and Budget reports.</span></article>
                  <article><strong>Investor Reports</strong><span>{investorReports.length} saved investor report records.</span></article>
                  <article><strong>Budgets</strong><span>{budgets.length} budget planning records prepared.</span></article>
                  <article><strong>Audit Logs</strong><span>{financeAccessLogs.length} finance access events recorded.</span></article>
                </div>
              </div>

              <div className="admin-panel wide">
                <div className="admin-panel-header">
                  <div>
                    <p>Finance Audit Trail</p>
                    <h2>Before / After Transaction Changes</h2>
                  </div>
                  <button
                    disabled={!latestFinanceActivities.length}
                    onClick={() => exportRowsCsv(
                      `gsn-finance-audit-${new Date().toISOString().slice(0, 10)}.csv`,
                      ["Created At", "Admin", "Role", "Action", "Label", "Reference Type", "Reference ID", "Changed Fields", "Before", "After", "Details"],
                      latestFinanceActivities.map((activity) => {
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
                    Export Finance Audit
                  </button>
                </div>
                <div className="admin-filter-row activity">
                  <select value={financeAuditFilters.admin} onChange={(event) => setFinanceAuditFilters((current) => ({ ...current, admin: event.target.value }))}>
                    {financeAuditAdminOptions.map((admin) => <option key={admin}>{admin}</option>)}
                  </select>
                  <select value={financeAuditFilters.action} onChange={(event) => setFinanceAuditFilters((current) => ({ ...current, action: event.target.value }))}>
                    {financeAuditActionOptions.map((action) => <option key={action}>{action}</option>)}
                  </select>
                  <input type="date" value={financeAuditFilters.from} onChange={(event) => setFinanceAuditFilters((current) => ({ ...current, from: event.target.value }))} />
                  <input type="date" value={financeAuditFilters.to} onChange={(event) => setFinanceAuditFilters((current) => ({ ...current, to: event.target.value }))} />
                  <button onClick={() => setFinanceAuditFilters({ admin: "All", action: "All", from: "", to: "" })} type="button">Reset</button>
                </div>
                <div className="admin-event-list">
                  {latestFinanceActivities.map((activity) => {
                    const changes = getAuditChanges(activity);
                    return (
                      <article key={activity.id}>
                        <strong>{activity.metadata?.admin || "admin"} <span className="admin-role-chip">{activity.metadata?.role || "role"}</span></strong>
                        <span>{activity.label || activity.metadata?.action || "Finance activity"}</span>
                        <em>{activity.metadata?.referenceType || activity.path || "finance"} {activity.metadata?.referenceId ? `| ${activity.metadata.referenceId}` : ""}</em>
                        {changes.length ? (
                          <div className="admin-audit-diff">
                            {changes.slice(0, 8).map((change) => (
                              <div key={change.field}>
                                <b>{change.field}</b>
                                <span>{formatAuditValue(change.before)}</span>
                                <i>to</i>
                                <strong>{formatAuditValue(change.after)}</strong>
                              </div>
                            ))}
                            {changes.length > 8 ? <small>+{changes.length - 8} more changed fields</small> : null}
                          </div>
                        ) : <small>No field-level diff for this activity.</small>}
                        <small>{formatDate(activity.created_at)}</small>
                      </article>
                    );
                  })}
                  {!latestFinanceActivities.length ? <p className="admin-empty">No finance audit activity found for this filter.</p> : null}
                </div>
              </div>
            </FinanceModule>
          ) : null}

          {activeModule === "Attendance" && canUseAttendance ? (
            <AttendanceModule
              currentAttendance={currentAttendance}
              saveAttendance={saveAttendance}
              attendanceDraft={attendanceDraft}
              setAttendanceDraft={setAttendanceDraft}
              attendanceStatuses={attendanceStatuses}
              attendanceWorkModes={attendanceWorkModes}
              todayKey={todayKey}
              formatDate={formatDate}
              attendanceSummary={attendanceSummary}
              attendanceRecords={attendanceRecords}
              exportRowsCsv={exportRowsCsv}
            />
          ) : null}

          {activeModule === "Activity" && hasAccess("activity_log") ? (
            <ActivityModule
              latestAdminActivities={latestAdminActivities}
              activityFilters={activityFilters}
              setActivityFilters={setActivityFilters}
              activityAdminOptions={activityAdminOptions}
              activityActionOptions={activityActionOptions}
              exportRowsCsv={exportRowsCsv}
              getAuditChanges={getAuditChanges}
              formatAuditValue={formatAuditValue}
              formatDate={formatDate}
            />
          ) : null}

          {activeModule === "Admin" ? (
            <section className="admin-panel admin-admin-hub">
              <div className="admin-panel-header">
                <div>
                  <p>Admin Hub</p>
                  <h2>Kontrol Internal</h2>
                </div>
                <span className="admin-muted">Fitur lanjutan disimpan di sini agar dashboard utama tetap ringan.</span>
              </div>
              <div className="admin-admin-shortcuts">
                {adminShortcutModules
                  .filter((module) => {
                    if (module === "Investors") return isExecutive;
                    if (module === "Settings") return canUseSettings;
                    if (module === "Users") return canManageUsers;
                    return true;
                  })
                  .map((module) => (
                    <button key={module} onClick={() => setActiveModule(module)} type="button">
                      <strong>{moduleLabels[module] || module}</strong>
                      <span>
                        {module === "Quotations" ? "Kelola permintaan penawaran dan dokumen quotation." :
                          module === "Investors" ? "Pantau peluang investor dan kerja sama strategis." :
                          module === "Activity" ? "Lihat audit perubahan dan aktivitas admin." :
                          module === "Settings" ? "Atur profil perusahaan, notifikasi, dan analytics." :
                          "Kelola akun dashboard dan role pengguna."}
                      </span>
                    </button>
                  ))}
              </div>
            </section>
          ) : null}

          {activeModule === "Settings" && canUseSettings ? (
            <section className="admin-settings-grid">
              <div className="admin-panel">
                <div className="admin-panel-header">
                  <div>
                    <p>Pengaturan Perusahaan</p>
                    <h2>Profil Bisnis</h2>
                  </div>
                  <button onClick={saveSettings} type="button">Simpan Pengaturan</button>
                </div>
                <div className="admin-settings-form">
                  <label>Nama Perusahaan<input value={settingsDraft.company_name || ""} onChange={(event) => updateSetting("company_name", event.target.value)} /></label>
                  <label>Email Kontak<input value={settingsDraft.contact_email || ""} onChange={(event) => updateSetting("contact_email", event.target.value)} /></label>
                  <label>Nomor WhatsApp<input value={settingsDraft.whatsapp_number || ""} onChange={(event) => updateSetting("whatsapp_number", event.target.value)} /></label>
                  <label>Website URL<input value={settingsDraft.website_url || ""} onChange={(event) => updateSetting("website_url", event.target.value)} /></label>
                  <label>Lokasi Kantor<textarea value={settingsDraft.office_location || ""} onChange={(event) => updateSetting("office_location", event.target.value)} /></label>
                </div>
              </div>

              <div className="admin-panel">
                <div className="admin-panel-header">
                  <div>
                    <p>Preferensi</p>
                    <h2>Notifikasi & Analisis</h2>
                  </div>
                </div>
                <div className="admin-toggle-list">
                  {[
                    ["notification_preferences.new_inquiry", "Notifikasi inquiry baru"],
                    ["notification_preferences.quotation_request", "Notifikasi permintaan penawaran"],
                    ["notification_preferences.nusabot_lead", "Notifikasi lead NusaBot"],
                    ["notification_preferences.follow_up_warning", "Notifikasi follow-up"],
                    ["analytics_settings.track_cta_clicks", "Lacak klik tombol utama"],
                    ["analytics_settings.track_nusabot", "Lacak aktivitas NusaBot"],
                    ["analytics_settings.track_partner_clicks", "Lacak klik partnership"]
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
                    <p>Pusat Otomasi</p>
                    <h2>Workflow Aktif</h2>
                  </div>
                </div>
                <div className="admin-actions">
                  <button onClick={() => runAutomation("/api/automation/followups", "Follow-up automation checked.")} type="button">Cek Follow-Up</button>
                  <button onClick={() => runAutomation("/api/automation/daily-report", "Daily report sent.")} type="button">Kirim Laporan Harian</button>
                </div>
                <p className="admin-empty">Vercel Cron menjalankan cek follow-up dan mengirim laporan harian pukul 08:00 WIB setelah deploy production aktif.</p>
              </div>

              <div className="admin-panel admin-future-panel">
                <div className="admin-panel-header">
                  <div>
                    <p>Siap Dikembangkan</p>
                    <h2>Roadmap Integrasi</h2>
                  </div>
                </div>
                <div className="admin-integration-list">
                  {futureIntegrations.map((name) => (
                    <article key={name}>
                      <strong>{name}</strong>
                      <span>Lapisan integrasi sudah disiapkan</span>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {activeModule === "Users" && canManageUsers ? (
            <UsersModule
              userAccounts={userAccounts}
              loadUsers={loadUsers}
              savedCredentials={savedCredentials}
              adminRoleLabels={adminRoleLabels}
              adminRoleDescriptions={adminRoleDescriptions}
              adminRoleOptions={adminRoleOptions}
              accessOptions={accessOptions}
              defaultPermissionsByRole={defaultPermissionsByRole}
              updateUserAccount={updateUserAccount}
              deleteUserAccount={deleteUserAccount}
              userDraft={userDraft}
              setUserDraft={setUserDraft}
              saveUserAccount={saveUserAccount}
            />
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
                  <p>Aktivitas Website</p>
                  <h2>Klik Terbaru</h2>
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
                {!latestEvents.length ? <p className="admin-empty">Belum ada aktivitas website.</p> : null}
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
                        <select value={modal.draft[field] || ""} onChange={(event) => updateModalField(field, event.target.value)}>
                          {(modalSelectOptions[modal.type]?.[field] || statuses).map((option) => <option key={option}>{option}</option>)}
                        </select>
                      ) : kind === "admin" ? (
                        <select value={modal.draft[field] || ""} onChange={(event) => updateModalField(field, event.target.value)}>
                          <option value="">Unassigned</option>
                          {assignableUsers.map((username) => <option key={username} value={username}>{username}</option>)}
                        </select>
                      ) : kind === "datetime" ? (
                        <input type="datetime-local" value={modal.draft[field] || ""} onChange={(event) => updateModalField(field, event.target.value)} />
                      ) : kind === "date" ? (
                        <input type="date" value={modal.draft[field] || ""} onChange={(event) => updateModalField(field, event.target.value)} />
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

      {savedCredentials ? (
        <AIEmployeeWidget
          authToken={savedCredentials.session}
          username={adminProfile?.username || savedCredentials.username}
          userRole={adminProfile?.role || savedCredentials.role}
          userPermissions={currentPermissions}
        />
      ) : null}
    </main>
  );
}
