import { isAdminAuthorized } from "@/lib/adminAuth";
import { markAllNotificationsRead, updateNotification } from "@/lib/gsnDataStore";

export async function PATCH(request) {
  if (!isAdminAuthorized(request)) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();

  if (data.all === true) {
    const result = await markAllNotificationsRead();
    return Response.json({ ok: true, result });
  }

  if (!data.id) {
    return Response.json({ message: "Notification id is required." }, { status: 400 });
  }

  const result = await updateNotification(data.id, { is_read: Boolean(data.is_read) });
  return Response.json({ ok: true, result });
}
