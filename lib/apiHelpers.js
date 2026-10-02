export function safeString(val, fallback = '') {
  if (val == null) return fallback;
  return typeof val === 'string' ? val.trim() : String(val).trim();
}

export async function parseBody(req) {
  try {
    const body = await req.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return { error: 'Invalid request body', status: 400 };
    }
    return { data: body };
  } catch {
    return { error: 'Malformed JSON', status: 400 };
  }
}

export function errorResponse(message, status = 500) {
  return Response.json({ error: message }, { status });
}

export function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
