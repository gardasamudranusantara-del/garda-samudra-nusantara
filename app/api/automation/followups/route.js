import { isAutomationAuthorized } from "@/lib/automationAuth";
import { hasAdminPermission } from "@/lib/adminAuth";
import { insertNotification, isSupabaseConfigured, listNotifications, listOpenInquiries, updateInquiry } from "@/lib/gsnDataStore";
import { notifyOwner } from "@/lib/ownerNotifications";

const thresholds = [
  { hours: 24, type: "Follow-Up 24h Reminder", label: "Reminder" },
  { hours: 48, type: "Follow-Up 48h Warning", label: "Warning" },
  { hours: 72, type: "Follow-Up 72h Critical", label: "Critical" }
];

function hoursSince(value) {
  return Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 36e5));
}

function hoursPastDeadline(value) {
  if (!value) {
    return 0;
  }

  return Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 36e5));
}

function makeKey(type, referenceId) {
  return `${type}:${referenceId}`;
}

export async function GET(request) {
  if (!isAutomationAuthorized(request) && !(await hasAdminPermission(request, "automation"))) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return Response.json({ configured: false, created: 0, message: "Supabase is not configured." });
  }

  const [inquiries, notifications] = await Promise.all([
    listOpenInquiries(),
    listNotifications()
  ]);

  const existing = new Set(
    notifications
      .filter((item) => item.reference_type === "follow_up" && item.reference_id)
      .map((item) => makeKey(item.type, item.reference_id))
  );

  const created = [];

  for (const inquiry of inquiries) {
    const age = hoursSince(inquiry.created_at);
    const deadlineAge = hoursPastDeadline(inquiry.follow_up_deadline);
    const effectiveAge = Math.max(age, deadlineAge ? 24 + deadlineAge : 0);
    const dueThresholds = thresholds.filter((threshold) => effectiveAge >= threshold.hours);

    for (const threshold of dueThresholds) {
      const key = makeKey(threshold.type, inquiry.id);
      if (existing.has(key)) {
        continue;
      }

      const title = inquiry.full_name || inquiry.company_name || "GSN Lead";
      const message = inquiry.follow_up_deadline && deadlineAge
        ? `${title} passed the manual follow-up deadline by ${deadlineAge} hours.`
        : `${title} has not been marked contacted after ${age} hours.`;
      const result = await insertNotification({
        type: threshold.type,
        title,
        message,
        reference_type: "follow_up",
        reference_id: inquiry.id
      });

      await notifyOwner({
        title: `GSN ${threshold.label}: follow up needed`,
        message,
        channels: ["telegram", "whatsapp"],
        lines: [
          `Company: ${inquiry.company_name || "-"}`,
          `WhatsApp: ${inquiry.whatsapp || "-"}`,
          `Country: ${inquiry.country || "-"}`,
          `Assigned to: ${inquiry.assigned_to || "Unassigned"}`,
          `Deadline: ${inquiry.follow_up_deadline || "-"}`,
          `Status: ${inquiry.status || "New"}`
        ]
      });

      await updateInquiry(inquiry.id, {
        follow_up_at: new Date().toISOString()
      });

      created.push(result?.[0] || { type: threshold.type, reference_id: inquiry.id });
      existing.add(key);
    }
  }

  return Response.json({
    ok: true,
    checked: inquiries.length,
    created: created.length,
    notifications: created
  });
}

export async function POST(request) {
  return GET(request);
}
