import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from') ?? '';
  const to = searchParams.get('to') ?? '';

  const bridgeUrl = process.env.MT5_BRIDGE_URL;
  if (!bridgeUrl) {
    return NextResponse.json([]);
  }

  try {
    const res = await fetch(
      `${bridgeUrl}/history?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      {
        headers: {
          Authorization: `Bearer ${session.mt5Token}`,
          'X-Account-Login': String(session.login),
        },
      }
    );
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : res.status });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
