import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import type { SessionPayload } from '@/types/api';

const SESSION_COOKIE = 'xm-session';
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7일

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return new TextEncoder().encode(secret);
}

export async function createSession(payload: SessionPayload): Promise<string> {
  const secret = getSecret();
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(secret);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSessionFromCookie(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export function getSessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: SESSION_DURATION,
    path: '/',
  };
}
