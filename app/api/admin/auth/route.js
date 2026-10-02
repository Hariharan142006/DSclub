
import { generateAdminToken, ADMIN_TOKEN_COOKIE } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body) return Response.json({ error: 'Invalid body' }, { status: 400 });
    
    const { username, password } = body;
    const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASS = process.env.ADMIN_PASSWORD;

    if (!ADMIN_PASS) {
      return Response.json({ error: 'Admin password not configured on server.' }, { status: 500 });
    }

    if (username?.trim() === ADMIN_USER && password === ADMIN_PASS) {
      const token = generateAdminToken();

      // Return success + set httpOnly session cookie and return token for flexibility
      return new Response(JSON.stringify({ success: true, token }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': [
            `${ADMIN_TOKEN_COOKIE}=${token}`,
            'Path=/',
            'HttpOnly',
            'SameSite=Lax',
            'Max-Age=86400',
            process.env.NODE_ENV === 'production' ? 'Secure' : '',
          ].filter(Boolean).join('; '),
        },
      });
    }

    return Response.json({ error: 'Invalid credentials.' }, { status: 401 });
  } catch (err) {
    console.error('Admin auth error:', err);
    return Response.json({ error: 'Auth failed.' }, { status: 500 });
  }
}

export async function DELETE() {
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `${ADMIN_TOKEN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
    },
  });
}
