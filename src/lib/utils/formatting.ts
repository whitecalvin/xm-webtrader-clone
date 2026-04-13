/**
 * 가격을 지정된 소수점 자리수로 포맷
 */
export function formatPrice(price: number, digits: number): string {
  if (!price || isNaN(price)) return '-.---';
  return price.toFixed(digits);
}

/**
 * 가격을 메인부분과 마지막 한 자리로 분리 (차트/시세 강조 표시용)
 */
export function formatPriceParts(price: number, digits: number): { main: string; pip: string } {
  const full = price.toFixed(digits);
  return {
    main: full.slice(0, -1),
    pip: full.slice(-1),
  };
}

/**
 * 거래량 포맷
 */
export function formatVolume(volume: number): string {
  return volume.toFixed(2);
}

/**
 * 손익 포맷 (부호 포함)
 */
export function formatProfit(profit: number, currency = 'USD'): string {
  const sign = profit >= 0 ? '+' : '';
  return `${sign}${profit.toFixed(2)} ${currency}`;
}

/**
 * 마진 레벨 포맷
 */
export function formatMarginLevel(level: number): string {
  if (!isFinite(level) || level === 0) return '∞';
  return `${level.toFixed(2)}%`;
}

/**
 * 잔고/금액 포맷
 */
export function formatBalance(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * 날짜/시간 포맷
 */
export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

/**
 * 날짜만 포맷
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * 서버 시간 포맷 (Unix timestamp → HH:MM:SS)
 */
export function formatServerTime(timestamp: number): string {
  if (!timestamp) return '--:--:--';
  const date = new Date(timestamp * 1000);
  return date.toISOString().substring(11, 19);
}

/**
 * 스프레드 포맷 (포인트 단위)
 */
export function formatSpread(spread: number): string {
  return spread.toString();
}

/**
 * 레버리지 포맷
 */
export function formatLeverage(leverage: number): string {
  return `1:${leverage}`;
}

/**
 * 퍼센트 변동률 포맷
 */
export function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}
