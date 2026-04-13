import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const bridgeUrl = process.env.MT5_BRIDGE_URL;
  if (!bridgeUrl) {
    // Mock 데이터
    return NextResponse.json({
      login: session.login,
      name: '테스트 계좌',
      server: session.server,
      currency: 'USD',
      leverage: 500,
      balance: 10000,
      equity: 10250,
      margin: 200,
      freeMargin: 10050,
      marginLevel: 5125,
      profit: 250,
      credit: 0,
      company: 'XM',
    });
  }

  try {
    const res = await fetch(`${bridgeUrl}/account`, {
      headers: {
        Authorization: `Bearer ${session.mt5Token}`,
        'X-Account-Login': String(session.login),
      },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
