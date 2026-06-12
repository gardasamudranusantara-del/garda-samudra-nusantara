import { isAutomationAuthorized } from "@/lib/automationAuth";
import { hasAdminPermission } from "@/lib/adminAuth";
import { insertNotification, isSupabaseConfigured, listFinanceSnapshot, listNotifications, listOpenInquiries, updateInquiry } from "@/lib/gsnDataStore";
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

function financeSeverity(days) {
  if (days === null) return "Review";
  if (days < 0) return "Overdue";
  if (days === 0) return "Due Today";
  return "Due Soon";
}

export async function GET(request) {
  if (!isAutomationAuthorized(request) && !(await hasAdminPermission(request, "automation"))) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return Response.json({ configured: false, created: 0, message: "Supabase is not configured." });
  }

  const [inquiries, notifications, finance] = await Promise.all([
    listOpenInquiries(),
    listNotifications(),
    listFinanceSnapshot()
  ]);

  const existing = new Set(
    notifications
      .filter((item) => ["follow_up", "finance_reminder"].includes(item.reference_type) && item.reference_id)
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

  const financeReminders = [
    ...(finance?.receivables || [])
      .filter((item) => !["Paid", "Cancelled"].includes(item.status))
      .map((item) => ({ ...item, module: "AR", type: "Finance AR Reminder", days: daysUntil(item.due_date) }))
      .filter((item) => item.days !== null && item.days <= 3),
    ...(finance?.payables || [])
      .filter((item) => !["Paid", "Cancelled"].includes(item.status))
      .map((item) => ({ ...item, module: "AP", type: "Finance AP Reminder", days: daysUntil(item.due_date) }))
      .filter((item) => item.days !== null && item.days <= 3),
    ...(finance?.expenses || [])
      .filter((item) => item.status === "Pending Approval")
      .map((item) => ({ ...item, module: "Expense", type: "Finance Expense Approval", days: null }))
  ];

  for (const item of financeReminders) {
    if (!item.id) {
      continue;
    }

    const key = makeKey(item.type, item.id);
    if (existing.has(key)) {
      continue;
    }

    const title = item.module === "AR"
      ? item.invoice_number || item.buyer_name || "Buyer invoice"
      : item.module === "AP"
        ? item.invoice_number || item.supplier_name || "Supplier bill"
        : item.expense_category || "Expense approval";
    const severity = financeSeverity(item.days);
    const amount = `${item.currency || "IDR"} ${Number(item.amount || 0).toLocaleString("en")}`;
    const message = item.module === "Expense"
      ? `${title} is waiting for finance approval.`
      : `${title} is ${severity.toLowerCase()}${item.days !== null ? ` (${item.days < 0 ? `${Math.abs(item.days)} days overdue` : item.days === 0 ? "due today" : `due in ${item.days} days`})` : ""}.`;

    const result = await insertNotification({
      type: item.type,
      title,
      message,
      reference_type: "finance_reminder",
      reference_id: item.id
    });

    await notifyOwner({
      title: `GSN Finance ${severity}: ${item.module}`,
      message,
      channels: ["email", "telegram", "whatsapp"],
      lines: [
        `Record: ${title}`,
        `Amount: ${amount}`,
        `Status: ${item.status || "-"}`,
        `Due date: ${item.due_date || "-"}`,
        `Owner action: ${item.module === "Expense" ? "Approve or reject expense." : "Review payment status and follow up."}`
      ]
    });

    created.push(result?.[0] || { type: item.type, reference_id: item.id });
    existing.add(key);
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
