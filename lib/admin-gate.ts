export const ADMIN_GATE_COOKIE = "admin_gate";

export function getAdminAccessSecret() {
  return process.env.ADMIN_ACCESS_SECRET?.trim() ?? "";
}

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function adminGateToken(secret: string) {
  return sha256(`admin-gate:${secret}`);
}

function timingSafeEqualStrings(left: string, right: string) {
  if (left.length !== right.length) return false;

  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}

export function isValidAccessKey(key: string | null | undefined) {
  const secret = getAdminAccessSecret();
  if (!secret || !key) return false;
  return timingSafeEqualStrings(key, secret);
}

export async function hasValidGateCookie(cookieValue: string | undefined) {
  const secret = getAdminAccessSecret();
  if (!secret || !cookieValue) return false;
  return cookieValue === (await adminGateToken(secret));
}

export function gateCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  };
}
