import { requireAdminPermission } from "@/lib/adminAuth";
import { notifyOwner } from "@/lib/ownerNotifications";

export async function POST(request) {
  const permission = await requireAdminPermission(request, "finance_manage_access");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const results = await notifyOwner({
    title: "GSN Finance Test Notification",
    message: "This is a production readiness test for finance owner alerts.",
    channels: ["email", "telegram", "whatsapp"],
    lines: [
      `Triggered by: ${permission.admin?.username || "admin"}`,
      `Role: ${permission.admin?.role || "-"}`,
      `Time: ${new Date().toISOString()}`,
      "If you receive this, finance automation channels are connected."
    ]
  });

  return Response.json({
    ok: true,
    results
  });
}
