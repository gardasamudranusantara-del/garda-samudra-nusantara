import { listAdminAccounts, requireAdminPermission } from "@/lib/adminAuth";
import { deleteStoredAdminUser, getStoredAdminUserForAudit, insertAdminActivity, updateStoredAdminUser, upsertStoredAdminUser } from "@/lib/gsnDataStore";

function cleanUsername(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40);
}

function cleanRole(value) {
  return ["ceo", "cso", "owner", "marketing"].includes(value) ? value : "marketing";
}

export async function GET(request) {
  const permission = await requireAdminPermission(request, "user_management");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  return Response.json({
    accounts: await listAdminAccounts()
  });
}

export async function POST(request) {
  const permission = await requireAdminPermission(request, "user_management");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const data = await request.json();
  const username = cleanUsername(data.username);
  const password = String(data.password || "").trim();
  const role = cleanRole(data.role);

  if (!username || password.length < 6) {
    return Response.json({ message: "Username and password with at least 6 characters are required." }, { status: 400 });
  }

  const before = await getStoredAdminUserForAudit(username);
  const after = { username, role, is_active: data.is_active !== false };
  const result = await upsertStoredAdminUser({
    username,
    password,
    role,
    is_active: data.is_active !== false
  });

  await insertAdminActivity({
    admin: permission.admin,
    action: "upsert_admin_user",
    label: `Saved admin user ${username}`,
    referenceType: "admin_user",
    referenceId: username,
    metadata: {
      fields: ["username", "role", "is_active"],
      before: before || {},
      after
    }
  });

  return Response.json({ ok: true, result });
}

export async function PATCH(request) {
  const permission = await requireAdminPermission(request, "user_management");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const data = await request.json();
  const username = cleanUsername(data.username);
  const updates = {};

  if (!username) {
    return Response.json({ message: "Username is required." }, { status: 400 });
  }

  if (["ceo", "cso", "owner", "marketing"].includes(data.role)) {
    updates.role = data.role;
  }
  if (typeof data.password === "string" && data.password.trim()) {
    if (data.password.trim().length < 6) {
      return Response.json({ message: "Password must be at least 6 characters." }, { status: 400 });
    }
    updates.password = data.password.trim();
  }
  if (typeof data.is_active === "boolean") {
    updates.is_active = data.is_active;
  }

  if (!Object.keys(updates).length) {
    return Response.json({ message: "No updates provided." }, { status: 400 });
  }

  const before = await getStoredAdminUserForAudit(username);
  if (["ceo", "cso"].includes(before?.role)) {
    if (updates.role && updates.role !== before.role) {
      return Response.json({ message: "Executive account cannot be demoted from the dashboard." }, { status: 403 });
    }
    if (updates.is_active === false) {
      return Response.json({ message: "Executive account cannot be suspended from the dashboard." }, { status: 403 });
    }
  }
  const result = await updateStoredAdminUser(username, updates);
  const auditUpdates = { ...updates };
  if (auditUpdates.password) {
    auditUpdates.password = "[updated]";
  }
  await insertAdminActivity({
    admin: permission.admin,
    action: "update_admin_user",
    label: `Updated admin user ${username}`,
    referenceType: "admin_user",
    referenceId: username,
    metadata: {
      fields: Object.keys(updates).filter((field) => field !== "password"),
      before: Object.fromEntries(Object.keys(auditUpdates).map((field) => [field, field === "password" ? "[hidden]" : before?.[field] ?? null])),
      after: auditUpdates
    }
  });

  return Response.json({ ok: true, result });
}

export async function DELETE(request) {
  const permission = await requireAdminPermission(request, "user_management");
  if (!permission.ok) {
    return Response.json({ message: permission.message }, { status: permission.status });
  }

  const { searchParams } = new URL(request.url);
  const username = cleanUsername(searchParams.get("username"));

  if (!username) {
    return Response.json({ message: "Username is required." }, { status: 400 });
  }
  if (username === permission.admin.username) {
    return Response.json({ message: "You cannot delete your own active account." }, { status: 400 });
  }

  const before = await getStoredAdminUserForAudit(username);
  if (["ceo", "cso"].includes(before?.role)) {
    return Response.json({ message: "Executive account cannot be deleted from the dashboard." }, { status: 403 });
  }
  const result = await deleteStoredAdminUser(username);
  await insertAdminActivity({
    admin: permission.admin,
    action: "delete_admin_user",
    label: `Deleted admin user ${username}`,
    referenceType: "admin_user",
    referenceId: username,
    metadata: { before }
  });

  return Response.json({ ok: true, result });
}
