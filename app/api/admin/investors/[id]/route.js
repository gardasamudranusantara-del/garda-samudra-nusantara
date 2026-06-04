import { deleteInvestorInquiry, getInvestorInquiry, insertAdminActivity, updateInvestorInquiry } from "@/lib/gsnDataStore";
import { requireAdminPermission } from "@/lib/adminAuth";

export async function PATCH(request, { params }) {
  const permission = await requireAdminPermission(request, "edit_investors");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
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

  const before = await getInvestorInquiry(params.id);
  const result = await updateInvestorInquiry(params.id, updates);
  await insertAdminActivity({
    admin: permission.admin,
    action: "edit_investor",
    label: `Edited investor inquiry ${params.id}`,
    referenceType: "investor",
    referenceId: params.id,
    metadata: {
      fields: Object.keys(updates),
      before: Object.fromEntries(Object.keys(updates).map((field) => [field, before?.[field] ?? null])),
      after: updates
    }
  });
  return Response.json({ ok: true, result });
}

export async function DELETE(request, { params }) {
  const permission = await requireAdminPermission(request, "delete_investors");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const before = await getInvestorInquiry(params.id);
  const result = await deleteInvestorInquiry(params.id);
  await insertAdminActivity({
    admin: permission.admin,
    action: "delete_investor",
    label: `Deleted investor inquiry ${params.id}`,
    referenceType: "investor",
    referenceId: params.id,
    metadata: { before }
  });
  return Response.json({ ok: true, result });
}
