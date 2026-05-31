import { getAuthorizedAdmin } from "@/lib/adminAuth";

export async function POST(request) {
  const admin = getAuthorizedAdmin(request);

  if (!admin) {
    return Response.json({ message: "Invalid username or password." }, { status: 401 });
  }

  return Response.json({ ok: true, admin });
}
