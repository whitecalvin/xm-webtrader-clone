import type { Position, SymbolInfo } from '@/types/mt5';

/**
 * 포지션의 현재 손익 계산
 */
export function calculatePositionProfit(
  position: Position,
  currentPrice: number,
  symbolInfo: SymbolInfo
): number {
  const direction = position.type === 'BUY' ? 1 : -1;
  const priceDiff = direction * (currentPrice - position.openPrice);
  return priceDiff * position.volume * symbolInfo.contractSize;
}

/**
 * 마진 소요액 계산
 */
export function calculateMarginRequired(
  volume: number,
  price: number,
  leverage: number,
  contractSize: number
): number {
  return (volume * contractSize * price) / leverage;
}

/**
 * pip 당 가치 계산 (USD 기준)
 */
export function calculatePipValue(
  volume: number,
  contractSize: number,
  pipSize: number,
  quoteToUsdRate = 1
): number {
  return volume * contractSize * pipSize * quoteToUsdRate;
}

/**
 * pip 크기 반환 (digits에 따라)
 */
export function getPipSize(digits: number): number {
  // 5자리: 0.00001 (1 pip = 0.0001)
  // 3자리: 0.001 (1 pip = 0.01)
  // 2자리: 0.01 (1 pip = 0.1)
  if (digits === 5 || digits === 4) return 0.0001;
  if (digits === 3 || digits === 2) return 0.01;
  return 1;
}

/**
 * 마진 레벨 상태 판별
 */
export function getMarginLevelStatus(marginLevel: number): 'safe' | 'warning' | 'danger' {
  if (marginLevel <= 0 || !isFinite(marginLevel)) return 'safe';
  if (marginLevel >= 200) return 'safe';
  if (marginLevel >= 100) return 'warning';
  return 'danger';
}

/**
 * 포지션 종류 표시 문자열
 */
export function getOrderTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    BUY: '매수',
    SELL: '매도',
    BUY_LIMIT: '매수 지정가',
    SELL_LIMIT: '매도 지정가',
    BUY_STOP: '매수 스탑',
    SELL_STOP: '매도 스탑',
    BUY_STOP_LIMIT: '매수 스탑 리밋',
    SELL_STOP_LIMIT: '매도 스탑 리밋',
  };
  return labels[type] ?? type;
}

/**
 * 스프레드를 pip 단위로 계산
 */
export function spreadToPips(spread: number, digits: number): number {
  if (digits === 5 || digits === 3) return spread / 10;
  return spread;
}
