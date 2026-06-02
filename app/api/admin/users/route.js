import { listAdminAccounts, requireAdminPermission } from "@/lib/adminAuth";

export async function GET(request) {
  const permission = requireAdminPermission(request, "user_management");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  return Response.json({
    accounts: listAdminAccounts()
  });
}
