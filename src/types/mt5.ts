// MT5 도메인 타입 정의

export type Timeframe = 'M1' | 'M5' | 'M15' | 'M30' | 'H1' | 'H4' | 'D1' | 'W1' | 'MN';

export type OrderType =
  | 'MARKET'
  | 'LIMIT'
  | 'STOP'
  | 'STOP_LIMIT';

export type OrderDirection = 'BUY' | 'SELL';

export type PositionType = 'BUY' | 'SELL';

export type SymbolCategory =
  | 'Forex'
  | 'Metals'
  | 'Energies'
  | 'Indices'
  | 'Stocks'
  | 'Crypto';

export type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting';

export interface AccountInfo {
  login: number;
  name: string;
  server: string;
  currency: string;
  leverage: number;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;  // equity / margin * 100 (%)
  profit: number;
  credit: number;
  company: string;
}

export interface SymbolInfo {
  symbol: string;
  description: string;
  baseCurrency: string;
  profitCurrency: string;
  digits: number;
  spread: number;
  minVolume: number;
  maxVolume: number;
  volumeStep: number;
  contractSize: number;
  marginRequired: number;
  category: SymbolCategory;
  stopLevel: number;
}

export interface TickData {
  bid: number;
  ask: number;
  time: number;       // Unix timestamp (초)
  lastUpdated: number; // Date.now() - 애니메이션 트리거용
  prevBid?: number;
  prevAsk?: number;
}

export interface CandleData {
  time: number;   // Unix timestamp (초)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Position {
  ticket: number;
  symbol: string;
  type: PositionType;
  volume: number;
  openPrice: number;
  openTime: string;   // ISO 8601
  stopLoss: number;
  takeProfit: number;
  currentPrice: number;
  profit: number;
  swap: number;
  commission: number;
  comment: string;
  magic: number;
}

export interface PendingOrder {
  ticket: number;
  symbol: string;
  type: string;       // "BUY_LIMIT" | "SELL_LIMIT" | "BUY_STOP" | "SELL_STOP" | "BUY_STOP_LIMIT" | "SELL_STOP_LIMIT"
  volume: number;
  openPrice: number;
  currentPrice: number;
  stopLoss: number;
  takeProfit: number;
  expiration: string | null;
  openTime: string;   // ISO 8601
  comment: string;
  magic: number;
}

export interface DealHistory {
  ticket: number;
  orderId: number;
  positionId: number;
  symbol: string;
  type: string;       // "BUY" | "SELL"
  entry: string;      // "IN" | "OUT" | "INOUT"
  volume: number;
  openPrice: number;
  closePrice: number;
  openTime: string;
  closeTime: string;
  stopLoss: number;
  takeProfit: number;
  profit: number;
  swap: number;
  commission: number;
  comment: string;
}

// MT5 Bridge 통신 타입

export interface MT5Request {
  id: string;
  action: MT5Action;
  params?: Record<string, unknown>;
}

export type MT5Action =
  | 'AUTH'
  | 'SUBSCRIBE'
  | 'UNSUBSCRIBE'
  | 'ORDER_SEND'
  | 'ORDER_MODIFY'
  | 'ORDER_CLOSE'
  | 'GET_ACCOUNT'
  | 'GET_POSITIONS'
  | 'GET_ORDERS'
  | 'GET_HISTORY'
  | 'GET_SYMBOLS'
  | 'GET_CANDLES'
  | 'PING';

export type MT5Response =
  | { type: 'TICK'; symbol: string; bid: number; ask: number; time: number }
  | { type: 'ACCOUNT_UPDATE'; data: AccountInfo }
  | { type: 'POSITION_UPDATE'; data: Position }
  | { type: 'POSITION_CLOSE'; ticket: number }
  | { type: 'ORDER_UPDATE'; data: PendingOrder }
  | { type: 'ORDER_CANCEL'; ticket: number }
  | { type: 'ORDER_RESULT'; id: string; success: boolean; ticket?: number; error?: string }
  | { type: 'CANDLES'; id: string; symbol: string; timeframe: string; data: CandleData[] }
  | { type: 'ACCOUNT'; id: string; data: AccountInfo }
  | { type: 'POSITIONS'; id: string; data: Position[] }
  | { type: 'ORDERS'; id: string; data: PendingOrder[] }
  | { type: 'SYMBOLS'; id: string; data: SymbolInfo[] }
  | { type: 'HISTORY'; id: string; data: DealHistory[] }
  | { type: 'AUTH'; id: string; success: boolean; token?: string; error?: string }
  | { type: 'ERROR'; id: string; code: number; message: string }
  | { type: 'PONG' };

// 주문 요청 타입
export interface OrderRequest {
  symbol: string;
  orderType: OrderType;
  direction: OrderDirection;
  volume: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  comment?: string;
  expiration?: string;  // ISO 8601
  magic?: number;
}

// 포지션 수정 요청
export interface ModifyPositionRequest {
  ticket: number;
  stopLoss?: number;
  takeProfit?: number;
}

// 포지션 청산 요청
export interface ClosePositionRequest {
  ticket: number;
  volume?: number;  // 부분 청산 시
}

// 주문 수정 요청
export interface ModifyOrderRequest {
  ticket: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  expiration?: string;
}

// 거래 내역 조회 요청
export interface HistoryRequest {
  from: string;   // ISO 8601
  to: string;     // ISO 8601
}
