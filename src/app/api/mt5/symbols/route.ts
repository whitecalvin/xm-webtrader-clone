import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';
import type { SymbolInfo } from '@/types/mt5';

const MOCK_SYMBOLS: SymbolInfo[] = [
  { symbol: 'EURUSD', description: 'Euro vs US Dollar', baseCurrency: 'EUR', profitCurrency: 'USD', digits: 5, spread: 10, minVolume: 0.01, maxVolume: 500, volumeStep: 0.01, contractSize: 100000, marginRequired: 1000, category: 'Forex', stopLevel: 5 },
  { symbol: 'GBPUSD', description: 'Great Britain Pound vs US Dollar', baseCurrency: 'GBP', profitCurrency: 'USD', digits: 5, spread: 13, minVolume: 0.01, maxVolume: 500, volumeStep: 0.01, contractSize: 100000, marginRequired: 1000, category: 'Forex', stopLevel: 5 },
  { symbol: 'USDJPY', description: 'US Dollar vs Japanese Yen', baseCurrency: 'USD', profitCurrency: 'JPY', digits: 3, spread: 12, minVolume: 0.01, maxVolume: 500, volumeStep: 0.01, contractSize: 100000, marginRequired: 1000, category: 'Forex', stopLevel: 5 },
  { symbol: 'USDCHF', description: 'US Dollar vs Swiss Franc', baseCurrency: 'USD', profitCurrency: 'CHF', digits: 5, spread: 14, minVolume: 0.01, maxVolume: 500, volumeStep: 0.01, contractSize: 100000, marginRequired: 1000, category: 'Forex', stopLevel: 5 },
  { symbol: 'AUDUSD', description: 'Australian Dollar vs US Dollar', baseCurrency: 'AUD', profitCurrency: 'USD', digits: 5, spread: 12, minVolume: 0.01, maxVolume: 500, volumeStep: 0.01, contractSize: 100000, marginRequired: 1000, category: 'Forex', stopLevel: 5 },
  { symbol: 'USDCAD', description: 'US Dollar vs Canadian Dollar', baseCurrency: 'USD', profitCurrency: 'CAD', digits: 5, spread: 15, minVolume: 0.01, maxVolume: 500, volumeStep: 0.01, contractSize: 100000, marginRequired: 1000, category: 'Forex', stopLevel: 5 },
  { symbol: 'NZDUSD', description: 'New Zealand Dollar vs US Dollar', baseCurrency: 'NZD', profitCurrency: 'USD', digits: 5, spread: 18, minVolume: 0.01, maxVolume: 500, volumeStep: 0.01, contractSize: 100000, marginRequired: 1000, category: 'Forex', stopLevel: 5 },
  { symbol: 'EURGBP', description: 'Euro vs Great Britain Pound', baseCurrency: 'EUR', profitCurrency: 'GBP', digits: 5, spread: 15, minVolume: 0.01, maxVolume: 500, volumeStep: 0.01, contractSize: 100000, marginRequired: 1000, category: 'Forex', stopLevel: 5 },
  { symbol: 'XAUUSD', description: 'Gold vs US Dollar', baseCurrency: 'XAU', profitCurrency: 'USD', digits: 2, spread: 35, minVolume: 0.01, maxVolume: 50, volumeStep: 0.01, contractSize: 100, marginRequired: 2000, category: 'Metals', stopLevel: 10 },
  { symbol: 'XAGUSD', description: 'Silver vs US Dollar', baseCurrency: 'XAG', profitCurrency: 'USD', digits: 3, spread: 300, minVolume: 0.01, maxVolume: 100, volumeStep: 0.01, contractSize: 5000, marginRequired: 500, category: 'Metals', stopLevel: 10 },
  { symbol: 'USOIL', description: 'Crude Oil WTI', baseCurrency: 'US', profitCurrency: 'USD', digits: 3, spread: 50, minVolume: 0.01, maxVolume: 100, volumeStep: 0.01, contractSize: 1000, marginRequired: 500, category: 'Energies', stopLevel: 10 },
  { symbol: 'UKOIL', description: 'Crude Oil Brent', baseCurrency: 'UK', profitCurrency: 'USD', digits: 3, spread: 50, minVolume: 0.01, maxVolume: 100, volumeStep: 0.01, contractSize: 1000, marginRequired: 500, category: 'Energies', stopLevel: 10 },
  { symbol: 'US30', description: 'Dow Jones Industrial Average', baseCurrency: 'US', profitCurrency: 'USD', digits: 2, spread: 30, minVolume: 0.01, maxVolume: 50, volumeStep: 0.01, contractSize: 1, marginRequired: 300, category: 'Indices', stopLevel: 10 },
  { symbol: 'US500', description: 'S&P 500 Index', baseCurrency: 'US', profitCurrency: 'USD', digits: 2, spread: 30, minVolume: 0.01, maxVolume: 50, volumeStep: 0.01, contractSize: 10, marginRequired: 300, category: 'Indices', stopLevel: 10 },
  { symbol: 'USTEC', description: 'NASDAQ 100 Index', baseCurrency: 'US', profitCurrency: 'USD', digits: 2, spread: 40, minVolume: 0.01, maxVolume: 50, volumeStep: 0.01, contractSize: 10, marginRequired: 300, category: 'Indices', stopLevel: 10 },
  { symbol: 'BTCUSD', description: 'Bitcoin vs US Dollar', baseCurrency: 'BTC', profitCurrency: 'USD', digits: 2, spread: 500, minVolume: 0.01, maxVolume: 1, volumeStep: 0.01, contractSize: 1, marginRequired: 1000, category: 'Crypto', stopLevel: 20 },
  { symbol: 'ETHUSD', description: 'Ethereum vs US Dollar', baseCurrency: 'ETH', profitCurrency: 'USD', digits: 2, spread: 300, minVolume: 0.01, maxVolume: 10, volumeStep: 0.01, contractSize: 1, marginRequired: 500, category: 'Crypto', stopLevel: 20 },
];

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const bridgeUrl = process.env.MT5_BRIDGE_URL;
  if (!bridgeUrl) {
    return NextResponse.json(MOCK_SYMBOLS);
  }

  try {
    const res = await fetch(`${bridgeUrl}/symbols`, {
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
