import crypto from 'crypto';

const ADMIN_TOKEN_COOKIE = 'ds_admin_token';
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

function getSecret() {
  // Use ADMIN_PASSWORD as the HMAC key; if it changes, all sessions are invalidated
  return process.env.ADMIN_PASSWORD || 'fallback-change-me';
}

/**
 * Generate a signed admin session token.
 * Format: `<timestamp_base36>:<random_nonce>.<hmac_signature>`
 */
export function generateAdminToken() {
  const timestamp = Date.now().toString(36);
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = `${timestamp}:${nonce}`;
  const signature = crypto
    .createHmac('sha256', getSecret())
    .update(payload)
    .digest('hex');
  return `${payload}.${signature}`;
}

/**
 * Verify a signed admin token string.
 * Returns true if valid and not expired, false otherwise.
 */
export function verifyAdminToken(token) {
  if (!token || typeof token !== 'string') return false;

  const dotIndex = token.lastIndexOf('.');
  if (dotIndex === -1) return false;

  const payload = token.substring(0, dotIndex);
  const signature = token.substring(dotIndex + 1);

  // Recompute expected signature
  const expected = crypto
    .createHmac('sha256', getSecret())
    .update(payload)
    .digest('hex');

  // Constant-time comparison (both are 64 hex chars from SHA-256)
  if (signature.length !== expected.length) return false;
  try {
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expected, 'hex')
    );
    if (!isValid) return false;
  } catch {
    return false;
  }

  // Check expiry
  const timestampStr = payload.split(':')[0];
  const timestamp = parseInt(timestampStr, 36);
  if (isNaN(timestamp) || Date.now() - timestamp > TOKEN_EXPIRY_MS) return false;

  return true;
}

/**
 * Verify that a request comes from an authenticated admin.
 * Checks the httpOnly cookie first, then the Authorization header as fallback.
 *
 * Usage in a route handler:
 *   const authError = verifyAdmin(request);
 *   if (authError) return authError;
 *
 * @returns {Response|null} A 401 Response if not authenticated, or null if OK.
 */
export function verifyAdmin(request) {
  // 1. Try httpOnly cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const cookieMatch = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${ADMIN_TOKEN_COOKIE}=([^;]+)`)
  );
  const cookieToken = cookieMatch ? cookieMatch[1] : null;

  if (verifyAdminToken(cookieToken)) return null;

  // 2. Fallback: Bearer token in Authorization header
  const authHeader = request.headers.get('authorization') || '';
  const bearerToken = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null;

  if (verifyAdminToken(bearerToken)) return null;

  // Not authenticated
  return Response.json(
    { error: 'Unauthorized. Admin login required.' },
    { status: 401 }
  );
}

export { ADMIN_TOKEN_COOKIE };
