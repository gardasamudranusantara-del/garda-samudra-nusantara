import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

const hashPrefix = "scrypt";
const sessionTtlSeconds = 60 * 60 * 8;

function base64Url(input) {
  return Buffer.from(input).toString("base64url");
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.ADMIN_DASHBOARD_PASSWORD || "gsn-admin-local-session";
}

function sign(value) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

export function hashAdminPassword(password) {
  const salt = randomBytes(16).toString("base64url");
  const hash = scryptSync(String(password || ""), salt, 64).toString("base64url");
  return `${hashPrefix}$${salt}$${hash}`;
}

export function isHashedAdminPassword(value) {
  return String(value || "").startsWith(`${hashPrefix}$`);
}

export function verifyAdminPassword(password, storedPassword) {
  const stored = String(storedPassword || "");
  if (!isHashedAdminPassword(stored)) {
    return stored === String(password || "");
  }

  const [, salt, expectedHash] = stored.split("$");
  if (!salt || !expectedHash) {
    return false;
  }

  const actual = scryptSync(String(password || ""), salt, 64);
  const expected = Buffer.from(expectedHash, "base64url");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function createAdminSession(admin) {
  const payload = {
    username: admin?.username || "",
    role: admin?.role || "viewer",
    permissions: Array.isArray(admin?.permissions) ? admin.permissions : [],
    exp: Math.floor(Date.now() / 1000) + sessionTtlSeconds
  };
  const encodedPayload = base64Url(JSON.stringify(payload));
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyAdminSession(token) {
  const [encodedPayload, signature] = String(token || "").split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expected = sign(encodedPayload);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    if (!payload?.username || !payload?.role || Number(payload.exp || 0) < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return { username: payload.username, role: payload.role, permissions: Array.isArray(payload.permissions) ? payload.permissions : [] };
  } catch {
    return null;
  }
}
