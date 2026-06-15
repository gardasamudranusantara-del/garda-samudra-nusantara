import { getStoredAdminUser, isSupabaseConfigured, listStoredAdminUsers, updateStoredAdminUser } from "@/lib/gsnDataStore";
import { hashAdminPassword, isHashedAdminPassword, verifyAdminPassword, verifyAdminSession } from "@/lib/adminSecurity";

const fullAccess = [
  "view",
  "edit_leads",
  "delete_leads",
  "crm_buyers_view",
  "crm_buyers_manage",
  "crm_suppliers_view",
  "crm_suppliers_contacts",
  "crm_suppliers_capacity",
  "crm_suppliers_commercial",
  "crm_suppliers_manage",
  "crm_suppliers_export",
  "edit_investors",
  "delete_investors",
  "investor_reports",
  "investor_dividends",
  "edit_quotations",
  "delete_quotations",
  "download_pdf",
  "settings",
  "settings_notifications",
  "settings_integrations",
  "settings_system",
  "automation",
  "activity_log",
  "ops_approvals",
  "user_management",
  "hr_roles_permissions",
  "finance_access",
  "finance_cash_bank",
  "finance_sales",
  "finance_purchase",
  "finance_tax_legal",
  "finance_budget",
  "finance_reports",
  "finance_audit",
  "finance_manage_access",
  "finance_export",
  "attendance_access",
  "hr_attendance_manage",
  "documents_access",
  "analytics_access"
];

export const adminRoleLabels = {
  ceo: "CEO",
  cso: "CSO",
  owner: "Owner",
  finance: "Finance",
  procurement: "Procurement",
  marketing: "Marketing",
  hr: "HR",
  staff: "Staff",
  viewer: "Viewer"
};

export function normalizeAdminRole(role) {
  return adminRoleLabels[role] ? role : "marketing";
}

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
        role: normalizeAdminRole(role?.trim() || "owner")
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
    password: request.headers.get("x-admin-password") || request.headers.get("x-admin-token") || "",
    session: request.headers.get("x-admin-session") || ""
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
  const sessionAdmin = verifyAdminSession(requestCredentials.session);

  if (sessionAdmin) {
    return sessionAdmin;
  }

  const envAdmin = getEnvAuthorizedAdmin(request);

  if (envAdmin) {
    return envAdmin;
  }

  if (isSupabaseConfigured() && requestCredentials.username && requestCredentials.password) {
    try {
      const account = await getStoredAdminUser(requestCredentials.username);
      if (account?.password && verifyAdminPassword(requestCredentials.password, account.password)) {
        if (!isHashedAdminPassword(account.password)) {
          await updateStoredAdminUser(account.username, { password: hashAdminPassword(requestCredentials.password) });
        }
        return {
          username: account.username,
          role: account.role || "marketing",
          permissions: Array.isArray(account.permissions) ? account.permissions : []
        };
      }
    } catch {
      // Fall back to environment accounts if the admin user table is not ready yet.
    }
  }

  return null;
}

export async function isAdminAuthorized(request) {
  return Boolean(await getAuthorizedAdmin(request));
}

export const rolePermissions = {
  ceo: fullAccess,
  cso: fullAccess,
  owner: fullAccess,
  finance: [
    "view",
    "download_pdf",
    "activity_log",
    "finance_access",
    "finance_cash_bank",
    "finance_sales",
    "finance_purchase",
    "finance_tax_legal",
    "finance_budget",
    "finance_reports",
    "finance_audit",
    "finance_manage_access",
    "finance_export",
    "documents_access"
  ],
  procurement: [
    "view",
    "edit_leads",
    "crm_buyers_view",
    "crm_buyers_manage",
    "edit_quotations",
    "download_pdf",
    "documents_access",
    "activity_log"
  ],
  marketing: [
    "view",
    "edit_leads",
    "crm_buyers_view",
    "edit_quotations",
    "download_pdf",
    "activity_log",
    "analytics_access"
  ],
  hr: [
    "view",
    "activity_log",
    "user_management",
    "hr_roles_permissions",
    "attendance_access",
    "hr_attendance_manage"
  ],
  staff: [
    "view",
    "activity_log"
  ],
  viewer: ["view"]
};

export function getEffectivePermissions(admin) {
  if (Array.isArray(admin?.permissions) && admin.permissions.length) {
    return [...new Set(["view", ...admin.permissions])];
  }

  return rolePermissions[admin?.role] || [];
}

function hasPermission(admin, permission) {
  const permissions = getEffectivePermissions(admin);
  if (permissions.includes(permission)) {
    return true;
  }
  if (permission === "finance_access") {
    return [
      "finance_cash_bank",
      "finance_sales",
      "finance_purchase",
      "finance_tax_legal",
      "finance_budget",
      "finance_reports",
      "finance_audit",
      "finance_manage_access",
      "finance_export"
    ].some((item) => permissions.includes(item));
  }
  if (permission === "supplier_access") {
    return supplierPermissionIds.some((item) => permissions.includes(item));
  }
  if (permission === "settings") {
    return ["settings_notifications", "settings_integrations", "settings_system"].some((item) => permissions.includes(item));
  }
  if (permission === "user_management") {
    return permissions.includes("hr_roles_permissions");
  }
  return false;
}

export async function hasAdminPermission(request, permission) {
  const admin = await getAuthorizedAdmin(request);
  if (!admin) {
    return false;
  }

  return hasPermission(admin, permission);
}

export function canAccessFinance(admin) {
  return [
    "finance_access",
    "finance_cash_bank",
    "finance_sales",
    "finance_purchase",
    "finance_tax_legal",
    "finance_budget",
    "finance_reports",
    "finance_audit",
    "finance_manage_access",
    "finance_export"
  ].some((permission) => hasPermission(admin, permission));
}

const supplierAccessUsernames = new Set(["dapi", "pici"]);
const supplierPermissionIds = [
  "crm_suppliers_view",
  "crm_suppliers_contacts",
  "crm_suppliers_capacity",
  "crm_suppliers_commercial",
  "crm_suppliers_manage",
  "crm_suppliers_export"
];

export function canAccessSuppliers(admin) {
  return supplierAccessUsernames.has(String(admin?.username || "").toLowerCase()) ||
    hasPermission(admin, "supplier_access") ||
    supplierPermissionIds.some((permission) => hasPermission(admin, permission));
}

export function canManageSuppliers(admin) {
  return supplierAccessUsernames.has(String(admin?.username || "").toLowerCase()) ||
    hasPermission(admin, "supplier_access") ||
    hasPermission(admin, "crm_suppliers_manage");
}

export function getSupplierAccessScope(admin) {
  const hasFullAccess = supplierAccessUsernames.has(String(admin?.username || "").toLowerCase()) || hasPermission(admin, "supplier_access");
  return {
    overview: hasFullAccess || hasPermission(admin, "crm_suppliers_view"),
    contacts: hasFullAccess || hasPermission(admin, "crm_suppliers_contacts"),
    capacity: hasFullAccess || hasPermission(admin, "crm_suppliers_capacity"),
    commercial: hasFullAccess || hasPermission(admin, "crm_suppliers_commercial"),
    manage: hasFullAccess || hasPermission(admin, "crm_suppliers_manage"),
    export: hasFullAccess || hasPermission(admin, "crm_suppliers_export")
  };
}

export function sanitizeSuppliersForAdmin(suppliers, admin) {
  const scope = getSupplierAccessScope(admin);
  if (!Object.values(scope).some(Boolean)) {
    return [];
  }

  return (suppliers || []).map((supplier) => ({
    ...supplier,
    contact_person: scope.contacts ? supplier.contact_person : "",
    email: scope.contacts ? supplier.email : "",
    phone: scope.contacts ? supplier.phone : "",
    whatsapp: scope.contacts ? supplier.whatsapp : "",
    products: scope.capacity ? supplier.products : [],
    product_categories: scope.capacity ? supplier.product_categories : [],
    capacity: scope.capacity ? supplier.capacity : "",
    quality_rating: scope.capacity ? supplier.quality_rating : null,
    payment_terms: scope.commercial ? supplier.payment_terms : "",
    bank_account: scope.commercial ? supplier.bank_account : "",
    tax_number: scope.commercial ? supplier.tax_number : "",
    notes: scope.commercial || scope.manage ? supplier.notes : ""
  }));
}

export async function requireSupplierAccess(request) {
  const admin = await getAuthorizedAdmin(request);

  if (!admin) {
    return { ok: false, status: 401, message: "Unauthorized" };
  }

  if (!canAccessSuppliers(admin)) {
    return { ok: false, status: 403, message: "This admin role does not have permission for the supplier module." };
  }

  return { ok: true, admin };
}

export async function requireSupplierManageAccess(request) {
  const admin = await getAuthorizedAdmin(request);

  if (!admin) {
    return { ok: false, status: 401, message: "Unauthorized" };
  }

  if (!canManageSuppliers(admin)) {
    return { ok: false, status: 403, message: "This admin role can view suppliers but cannot create, edit, or delete supplier records." };
  }

  return { ok: true, admin };
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
      role: normalizeAdminRole(account.role || "owner"),
      source: "env",
      is_active: true,
      permissions: rolePermissions[normalizeAdminRole(account.role || "owner")] || []
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
      role: normalizeAdminRole(account.role || "marketing"),
      source: "dashboard",
      is_active: account.is_active !== false,
      permissions: Array.isArray(account.permissions) && account.permissions.length
        ? account.permissions
        : rolePermissions[normalizeAdminRole(account.role || "marketing")] || []
    }));

  return [...envAccounts, ...databaseAccounts];
}

export async function requireAdminPermission(request, permission) {
  const admin = await getAuthorizedAdmin(request);

  if (!admin) {
    return { ok: false, status: 401, message: "Unauthorized" };
  }

  if (!hasPermission(admin, permission)) {
    return { ok: false, status: 403, message: "This admin role does not have permission for this action." };
  }

  return { ok: true, admin };
}
