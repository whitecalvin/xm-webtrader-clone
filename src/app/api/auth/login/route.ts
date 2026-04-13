import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSession, getSessionCookieOptions } from '@/lib/auth/session';

const LoginSchema = z.object({
  login: z.number().int().positive(),
  password: z.string().min(1),
  server: z.string().min(1),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식' }, { status: 400 });
  }

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: '잘못된 입력값' }, { status: 400 });
  }

  const { login, password, server } = parsed.data;

  try {
    const bridgeUrl = process.env.MT5_BRIDGE_URL;
    if (!bridgeUrl) {
      // Mock 응답 (개발 환경)
      const mockToken = `mock-token-${Date.now()}`;
      const mockAccountInfo = {
        login,
        name: '테스트 계좌',
        server,
        currency: 'USD',
        leverage: 500,
        balance: 10000,
        equity: 10000,
        margin: 0,
        freeMargin: 10000,
        marginLevel: 0,
        profit: 0,
        credit: 0,
        company: 'XM',
      };

      const jwt = await createSession({
        login,
        server,
        mt5Token: mockToken,
      });

      const response = NextResponse.json({ accountInfo: mockAccountInfo }, { status: 200 });
      const cookieOptions = getSessionCookieOptions();
      response.cookies.set(cookieOptions.name, jwt, {
        httpOnly: cookieOptions.httpOnly,
        secure: cookieOptions.secure,
        sameSite: cookieOptions.sameSite,
        maxAge: cookieOptions.maxAge,
        path: cookieOptions.path,
      });
      return response;
    }

    // 실제 MT5 Bridge 호출
    const bridgeResponse = await fetch(`${bridgeUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password, server }),
    });

    if (!bridgeResponse.ok) {
      const errorData = await bridgeResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error ?? '계좌 인증 실패' },
        { status: 401 }
      );
    }

    const { sessionToken, accountInfo } = await bridgeResponse.json();

    const jwt = await createSession({
      login,
      server,
      mt5Token: sessionToken,
    });

    const response = NextResponse.json({ accountInfo }, { status: 200 });
    const cookieOptions = getSessionCookieOptions();
    response.cookies.set(cookieOptions.name, jwt, {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      maxAge: cookieOptions.maxAge,
      path: cookieOptions.path,
    });

    return response;
  } catch (error) {
    console.error('[API] Login error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다' }, { status: 500 });
  }
}
