import { isAutomationAuthorized } from "@/lib/automationAuth";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { insertNotification, isSupabaseConfigured, listInquiries, listInvestorInquiries, listQuotationDocuments, listQuotationRequests, listTrackingEvents } from "@/lib/gsnDataStore";
import { notifyOwner } from "@/lib/ownerNotifications";

function isToday(value) {
  const date = new Date(value);
  const now = new Date();
  return date.getUTCFullYear() === now.getUTCFullYear()
    && date.getUTCMonth() === now.getUTCMonth()
    && date.getUTCDate() === now.getUTCDate();
}

function countBy(items, getter) {
  const map = new Map();
  items.forEach((item) => {
    const value = getter(item);
    if (value) {
      map.set(value, (map.get(value) || 0) + 1);
    }
  });
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
}

export async function GET(request) {
  if (!isAutomationAuthorized(request) && !isAdminAuthorized(request)) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return Response.json({ configured: false, message: "Supabase is not configured." });
  }

  const [inquiries, investors, quotations, documents, events] = await Promise.all([
    listInquiries(),
    listInvestorInquiries(),
    listQuotationRequests(),
    listQuotationDocuments(),
    listTrackingEvents()
  ]);

  const todayLeads = inquiries.filter((lead) => isToday(lead.created_at));
  const highPriority = inquiries.filter((lead) => lead.lead_priority === "High");
  const openLeads = inquiries.filter((lead) => !["Converted", "Closed"].includes(lead.status));
  const topCountries = countBy(inquiries, (lead) => lead.country);
  const topEvents = countBy(events, (event) => event.event);

  const lines = [
    `Total leads: ${inquiries.length}`,
    `New leads today: ${todayLeads.length}`,
    `High priority leads: ${highPriority.length}`,
    `Open follow-ups: ${openLeads.length}`,
    `Investor inquiries: ${investors.length}`,
    `Quotation requests: ${quotations.length}`,
    `Saved quotation documents: ${documents.length}`,
    `Tracking events: ${events.length}`,
    "",
    `Top countries: ${topCountries.map(([name, count]) => `${name} (${count})`).join(", ") || "-"}`,
    `Top actions: ${topEvents.map(([name, count]) => `${name} (${count})`).join(", ") || "-"}`
  ];

  await notifyOwner({
    title: "GSN Daily Lead Report",
    message: "Daily summary from the GSN Admin Dashboard.",
    lines
  });

  await insertNotification({
    type: "Daily Report",
    title: "GSN Daily Lead Report",
    message: `${todayLeads.length} new leads today, ${openLeads.length} open follow-ups.`,
    reference_type: "daily_report",
    reference_id: null
  });

  return Response.json({
    ok: true,
    report: {
      totalLeads: inquiries.length,
      newLeadsToday: todayLeads.length,
      highPriority: highPriority.length,
      openFollowUps: openLeads.length,
      investorInquiries: investors.length,
      quotationRequests: quotations.length,
      quotationDocuments: documents.length,
      trackingEvents: events.length
    }
  });
}

export async function POST(request) {
  return GET(request);
}
