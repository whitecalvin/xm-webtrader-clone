// API 응답 타입

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginRequest {
  login: number;
  password: string;
  server: string;
}

export interface LoginResponse {
  accountInfo: {
    login: number;
    name: string;
    server: string;
    currency: string;
    leverage: number;
    balance: number;
    equity: number;
  };
}

export interface SessionPayload {
  login: number;
  server: string;
  mt5Token: string;
  iat?: number;
  exp?: number;
}

export interface MT5Server {
  id: string;
  name: string;
  host: string;
  port: number;
}

// Mock 서버 목록
export const DEMO_SERVERS: MT5Server[] = [
  { id: 'xm-demo', name: 'XM Demo', host: 'mt5-demo.xm.com', port: 443 },
  { id: 'xm-real', name: 'XM Real', host: 'mt5.xm.com', port: 443 },
];
