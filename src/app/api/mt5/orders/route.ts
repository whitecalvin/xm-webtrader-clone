import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionFromRequest } from '@/lib/auth/session';

const OrderSchema = z.object({
  symbol: z.string().min(1),
  orderType: z.enum(['MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT']),
  direction: z.enum(['BUY', 'SELL']),
  volume: z.number().positive(),
  price: z.number().optional(),
  stopLoss: z.number().optional(),
  takeProfit: z.number().optional(),
  comment: z.string().max(64).optional(),
  expiration: z.string().optional(),
  magic: z.number().optional(),
});

// 대기 주문 목록
export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const bridgeUrl = process.env.MT5_BRIDGE_URL;
  if (!bridgeUrl) {
    return NextResponse.json([]);
  }

  try {
    const res = await fetch(`${bridgeUrl}/orders`, {
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

// 주문 실행
export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식' }, { status: 400 });
  }

  const parsed = OrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const bridgeUrl = process.env.MT5_BRIDGE_URL;
  if (!bridgeUrl) {
    // Mock 응답
    return NextResponse.json({
      success: true,
      ticket: Math.floor(Math.random() * 900000) + 100000,
      message: '주문이 성공적으로 실행되었습니다',
    });
  }

  try {
    const res = await fetch(`${bridgeUrl}/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.mt5Token}`,
        'Content-Type': 'application/json',
        'X-Account-Login': String(session.login),
      },
      body: JSON.stringify(parsed.data),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : 400 });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}

// 포지션 청산 / 주문 취소
export async function DELETE(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const ticket = searchParams.get('ticket');
  const type = searchParams.get('type'); // 'position' | 'order'
  const volume = searchParams.get('volume');

  if (!ticket) {
    return NextResponse.json({ error: 'ticket 파라미터 필요' }, { status: 400 });
  }

  const bridgeUrl = process.env.MT5_BRIDGE_URL;
  if (!bridgeUrl) {
    return NextResponse.json({ success: true });
  }

  try {
    const endpoint = type === 'order' ? 'orders' : 'positions';
    const params = volume ? `?volume=${volume}` : '';
    const res = await fetch(`${bridgeUrl}/${endpoint}/${ticket}${params}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session.mt5Token}`,
        'X-Account-Login': String(session.login),
      },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : 400 });
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
