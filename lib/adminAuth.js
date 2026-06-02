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

export function getAuthorizedAdmin(request) {
  const credentials = getAdminCredentials();
  const requestUsername = request.headers.get("x-admin-username") || "";
  const requestPassword = request.headers.get("x-admin-password") || request.headers.get("x-admin-token") || "";

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

export function isAdminAuthorized(request) {
  return Boolean(getAuthorizedAdmin(request));
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

export function hasAdminPermission(request, permission) {
  const admin = getAuthorizedAdmin(request);
  if (!admin) {
    return false;
  }

  return Boolean(rolePermissions[admin.role]?.includes(permission));
}

export function listAdminAccounts() {
  const credentials = getAdminCredentials();

  if (Array.isArray(credentials)) {
    return credentials.map((account) => ({
      username: account.username,
      role: account.role || "owner",
      permissions: rolePermissions[account.role || "owner"] || []
    }));
  }

  return credentials.username ? [{
    username: credentials.username,
    role: "owner",
    permissions: rolePermissions.owner
  }] : [];
}

export function requireAdminPermission(request, permission) {
  const admin = getAuthorizedAdmin(request);

  if (!admin) {
    return { ok: false, status: 401, message: "Unauthorized" };
  }

  if (!rolePermissions[admin.role]?.includes(permission)) {
    return { ok: false, status: 403, message: "This admin role does not have permission for this action." };
  }

  return { ok: true, admin };
}
