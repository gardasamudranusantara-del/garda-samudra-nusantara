import { deleteInvestorInquiry, updateInvestorInquiry } from "@/lib/gsnDataStore";
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
  if (typeof data.investment_interest === "string") {
    updates.investment_interest = data.investment_interest.slice(0, 500);
  }
  if (typeof data.message === "string") {
    updates.message = data.message.slice(0, 1200);
  }

  const result = await updateInvestorInquiry(params.id, updates);
  return Response.json({ ok: true, result });
}

export async function DELETE(request, { params }) {
  if (!isAdminAuthorized(request)) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const result = await deleteInvestorInquiry(params.id);
  return Response.json({ ok: true, result });
}
