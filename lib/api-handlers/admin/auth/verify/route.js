import { verifyAdmin } from '@/lib/auth';

export async function GET(request) {
  const authError = verifyAdmin(request);
  if (authError) return authError;
  return Response.json({ authenticated: true });
}
