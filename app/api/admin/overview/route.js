import { getEffectiveAdminSettings, isSupabaseConfigured, listAdminActivities, listAttendanceRecords, listBusinessDocuments, listBuyerProfiles, listFinanceSnapshot, listInquiries, listInvestorInquiries, listNotifications, listQuotationDocuments, listQuotationRequests, listSuppliers, listTrackingEvents } from "@/lib/gsnDataStore";
import { canAccessFinance, canAccessSuppliers, getAuthorizedAdmin } from "@/lib/adminAuth";

function summarize(inquiries, events, investorInquiries = [], quotationRequests = []) {
  const highPriority = inquiries.filter((item) => item.lead_priority === "High").length;
  const newLeads = inquiries.filter((item) => item.status === "New").length;
  const productCounts = new Map();
  const countryCounts = new Map();

  inquiries.forEach((item) => {
    (Array.isArray(item.products) ? item.products : []).forEach((product) => {
      productCounts.set(product, (productCounts.get(product) || 0) + 1);
    });
    if (item.country) {
      countryCounts.set(item.country, (countryCounts.get(item.country) || 0) + 1);
    }
  });

  return {
    totalInquiries: inquiries.length,
    totalInvestorInquiries: investorInquiries.length,
    totalQuotationRequests: quotationRequests.length,
    highPriority,
    newLeads,
    totalEvents: events.length,
    topProducts: [...productCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6),
    topCountries: [...countryCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
  };
}

export async function GET(request) {
  const admin = await getAuthorizedAdmin(request);

  if (!admin) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return Response.json({
      configured: false,
      inquiries: [],
      investorInquiries: [],
      quotationRequests: [],
      quotationDocuments: [],
      notifications: [],
      settings: null,
      attendanceRecords: [],
      buyerProfiles: [],
      suppliers: [],
      businessDocuments: [],
      events: [],
      adminActivities: [],
      finance: null,
      summary: summarize([], [], [], [])
    });
  }

  const [inquiries, investorInquiries, quotationRequests, quotationDocuments, notifications, settings, attendanceRecords, buyerProfiles, suppliers, businessDocuments, events, adminActivities, finance] = await Promise.all([
    listInquiries(),
    listInvestorInquiries(),
    listQuotationRequests(),
    listQuotationDocuments(),
    listNotifications(),
    getEffectiveAdminSettings(),
    listAttendanceRecords(),
    listBuyerProfiles(),
    canAccessSuppliers(admin) ? listSuppliers() : Promise.resolve([]),
    listBusinessDocuments(),
    listTrackingEvents(),
    listAdminActivities(),
    canAccessFinance(admin) ? listFinanceSnapshot() : Promise.resolve(null)
  ]);

  return Response.json({
    configured: true,
    inquiries,
    investorInquiries,
    quotationRequests,
    quotationDocuments,
    notifications,
    settings,
    attendanceRecords,
    buyerProfiles,
    suppliers,
    businessDocuments,
    events,
    adminActivities,
    finance,
    summary: summarize(inquiries, events, investorInquiries, quotationRequests)
  });
}
