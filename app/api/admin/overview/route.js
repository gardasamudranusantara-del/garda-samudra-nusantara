import { getAdminSettings, isSupabaseConfigured, listAdminActivities, listInquiries, listInvestorInquiries, listNotifications, listQuotationDocuments, listQuotationRequests, listTrackingEvents } from "@/lib/gsnDataStore";
import { isAdminAuthorized } from "@/lib/adminAuth";

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
  if (!isAdminAuthorized(request)) {
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
      events: [],
      adminActivities: [],
      summary: summarize([], [], [], [])
    });
  }

  const [inquiries, investorInquiries, quotationRequests, quotationDocuments, notifications, settings, events, adminActivities] = await Promise.all([
    listInquiries(),
    listInvestorInquiries(),
    listQuotationRequests(),
    listQuotationDocuments(),
    listNotifications(),
    getAdminSettings(),
    listTrackingEvents(),
    listAdminActivities()
  ]);

  return Response.json({
    configured: true,
    inquiries,
    investorInquiries,
    quotationRequests,
    quotationDocuments,
    notifications,
    settings,
    events,
    adminActivities,
    summary: summarize(inquiries, events, investorInquiries, quotationRequests)
  });
}
