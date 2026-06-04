import { getStoredAdminUser, isSupabaseConfigured, listStoredAdminUsers } from "@/lib/gsnDataStore";

export function getAdminCredentials() {
  const accounts = (process.env.ADMIN_DASHBOARD_ACCOUNTS || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [username, password, role = "owner"] = entry.split(":");
      return {
        username: username?.trim() || "",
        password: password?.trim() || "",
        role: role?.trim() || "owner"
      };
    })
    .filter((account) => account.username && account.password);

  if (accounts.length) {
    return accounts;
  }

  return {
    username: process.env.ADMIN_DASHBOARD_USERNAME || "",
    password: process.env.ADMIN_DASHBOARD_PASSWORD || process.env.ADMIN_DASHBOARD_TOKEN || ""
  };
}

function getRequestCredentials(request) {
  return {
    username: request.headers.get("x-admin-username") || "",
    password: request.headers.get("x-admin-password") || request.headers.get("x-admin-token") || ""
  };
}

function getEnvAuthorizedAdmin(request) {
  const credentials = getAdminCredentials();
  const { username: requestUsername, password: requestPassword } = getRequestCredentials(request);

  if (Array.isArray(credentials)) {
    const account = credentials.find(
      (account) => requestUsername === account.username && requestPassword === account.password
    );
    return account ? { username: account.username, role: account.role || "owner" } : null;
  }

  const isAuthorized = Boolean(
    credentials.username &&
    credentials.password &&
    requestUsername === credentials.username &&
    requestPassword === credentials.password
  );

  return isAuthorized ? { username: credentials.username, role: "owner" } : null;
}

export async function getAuthorizedAdmin(request) {
  const requestCredentials = getRequestCredentials(request);

  if (isSupabaseConfigured() && requestCredentials.username && requestCredentials.password) {
    try {
      const account = await getStoredAdminUser(requestCredentials.username);
      if (account?.password === requestCredentials.password) {
        return { username: account.username, role: account.role || "marketing" };
      }
    } catch {
      // Fall back to environment accounts if the admin user table is not ready yet.
    }
  }

  return getEnvAuthorizedAdmin(request);
}

export async function isAdminAuthorized(request) {
  return Boolean(await getAuthorizedAdmin(request));
}

export const rolePermissions = {
  owner: [
    "view",
    "edit_leads",
    "delete_leads",
    "edit_investors",
    "delete_investors",
    "edit_quotations",
    "delete_quotations",
    "download_pdf",
    "settings",
    "automation",
    "activity_log",
    "user_management"
  ],
  marketing: [
    "view",
    "edit_leads",
    "edit_quotations",
    "download_pdf",
    "activity_log"
  ]
};

export async function hasAdminPermission(request, permission) {
  const admin = await getAuthorizedAdmin(request);
  if (!admin) {
    return false;
  }

  return Boolean(rolePermissions[admin.role]?.includes(permission));
}

export async function listAdminAccounts() {
  const credentials = getAdminCredentials();
  let storedAccounts = [];

  if (isSupabaseConfigured()) {
    try {
      storedAccounts = await listStoredAdminUsers();
    } catch {
      storedAccounts = [];
    }
  }

  const envAccounts = Array.isArray(credentials) ? credentials.map((account) => ({
      username: account.username,
      role: account.role || "owner",
      source: "env",
      is_active: true,
      permissions: rolePermissions[account.role || "owner"] || []
    })) : (credentials.username ? [{
      username: credentials.username,
      role: "owner",
      source: "env",
      is_active: true,
      permissions: rolePermissions.owner
    }] : []);

  const envUsernames = new Set(envAccounts.map((account) => account.username));
  const databaseAccounts = storedAccounts
    .filter((account) => !envUsernames.has(account.username))
    .map((account) => ({
      username: account.username,
      role: account.role || "marketing",
      source: "dashboard",
      is_active: account.is_active !== false,
      permissions: rolePermissions[account.role || "marketing"] || []
    }));

  return [...envAccounts, ...databaseAccounts];
}

export async function requireAdminPermission(request, permission) {
  const admin = await getAuthorizedAdmin(request);

  if (!admin) {
    return { ok: false, status: 401, message: "Unauthorized" };
  }

  if (!rolePermissions[admin.role]?.includes(permission)) {
    return { ok: false, status: 403, message: "This admin role does not have permission for this action." };
  }

  return { ok: true, admin };
}
