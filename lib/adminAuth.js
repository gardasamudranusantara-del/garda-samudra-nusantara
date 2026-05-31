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
