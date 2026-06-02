import { isAdminAuthorized, requireAdminPermission } from "@/lib/adminAuth";
import { getAdminSettings, insertAdminActivity, upsertAdminSettings } from "@/lib/gsnDataStore";

export async function GET(request) {
  if (!isAdminAuthorized(request)) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const settings = await getAdminSettings();
  return Response.json({ settings });
}

export async function PATCH(request) {
  const permission = requireAdminPermission(request, "settings");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const data = await request.json();
  const result = await upsertAdminSettings({
    company_name: String(data.company_name || "").slice(0, 160),
    contact_email: String(data.contact_email || "").slice(0, 160),
    whatsapp_number: String(data.whatsapp_number || "").slice(0, 80),
    website_url: String(data.website_url || "").slice(0, 200),
    office_location: String(data.office_location || "").slice(0, 240),
    notification_preferences: data.notification_preferences || {},
    analytics_settings: data.analytics_settings || {},
    integration_settings: data.integration_settings || {}
  });
  await insertAdminActivity({
    admin: permission.admin,
    action: "update_settings",
    label: "Updated admin settings",
    referenceType: "settings",
    referenceId: null
  });

  return Response.json({ ok: true, result });
}
