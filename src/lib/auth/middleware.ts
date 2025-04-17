import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from './jwt';

export async function authMiddleware(req: NextRequest) {
  // Get token from cookies
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify token
  const payload = verifyToken(token);

  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  return { userId: payload.id, userEmail: payload.email, userRole: payload.role };
}

export async function adminMiddleware(req: NextRequest) {
  const auth = await authMiddleware(req);

  if ('error' in auth) {
    return auth;
  }

  if (auth.userRole !== 'admin') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  return auth;
}
