import { updateInquiry } from "@/lib/gsnDataStore";
import { isAdminAuthorized } from "@/lib/adminAuth";

export async function PATCH(request, { params }) {
  if (!isAdminAuthorized(request)) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();
  const updates = {};

  if (typeof data.status === "string") {
    updates.status = data.status.slice(0, 40);
  }
  if (typeof data.internal_notes === "string") {
    updates.internal_notes = data.internal_notes.slice(0, 1200);
  }
  if (typeof data.follow_up_at === "string") {
    updates.follow_up_at = data.follow_up_at || null;
  }

  const result = await updateInquiry(params.id, updates);
  return Response.json({ ok: true, result });
}
