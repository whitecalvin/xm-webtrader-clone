'use client';

import type { MT5Action, MT5Request, MT5Response } from '@/types/mt5';

type MessageHandler = (message: MT5Response) => void;
type ConnectionStateHandler = (state: ConnectionState) => void;
type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
  timeout: ReturnType<typeof setTimeout>;
}

class MT5BridgeClient {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string;
  private globalHandlers: Set<MessageHandler> = new Set();
  private stateHandlers: Set<ConnectionStateHandler> = new Set();
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;
  private readonly baseReconnectDelay = 1000;
  private connectionState: ConnectionState = 'disconnected';
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private subscribedSymbols: Set<string> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isDestroyed = false;

  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
  }

  async connect(): Promise<void> {
    if (this.isDestroyed) return;
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.setConnectionState('connecting');

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          this.setConnectionState('connected');
          this.startPing();
          // 재연결 시 심볼 재구독
          if (this.subscribedSymbols.size > 0) {
            this.subscribe([...this.subscribedSymbols]);
          }
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data) as MT5Response;
            this.handleMessage(msg);
          } catch {
            console.error('[MT5] Failed to parse message:', event.data);
          }
        };

        this.ws.onclose = () => {
          this.stopPing();
          if (!this.isDestroyed) {
            this.setConnectionState('disconnected');
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('[MT5] WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        this.setConnectionState('disconnected');
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.isDestroyed = true;
    this.stopPing();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.pendingRequests.forEach(({ reject, timeout }) => {
      clearTimeout(timeout);
      reject(new Error('Connection closed'));
    });
    this.pendingRequests.clear();
    this.ws?.close();
    this.ws = null;
    this.setConnectionState('disconnected');
  }

  subscribe(symbols: string[]): void {
    symbols.forEach((s) => this.subscribedSymbols.add(s));
    if (this.isConnected()) {
      this.send({ id: crypto.randomUUID(), action: 'SUBSCRIBE', params: { symbols } });
    }
  }

  unsubscribe(symbols: string[]): void {
    symbols.forEach((s) => this.subscribedSymbols.delete(s));
    if (this.isConnected()) {
      this.send({ id: crypto.randomUUID(), action: 'UNSUBSCRIBE', params: { symbols } });
    }
  }

  async request<T>(action: MT5Action, params?: Record<string, unknown>): Promise<T> {
    if (!this.isConnected()) {
      throw new Error('WebSocket not connected');
    }

    const id = crypto.randomUUID();
    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request timeout: ${action}`));
      }, 15000);

      this.pendingRequests.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
        timeout,
      });

      this.send({ id, action, params });
    });
  }

  onMessage(handler: MessageHandler): () => void {
    this.globalHandlers.add(handler);
    return () => this.globalHandlers.delete(handler);
  }

  onStateChange(handler: ConnectionStateHandler): () => void {
    this.stateHandlers.add(handler);
    return () => this.stateHandlers.delete(handler);
  }

  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private send(message: MT5Request): void {
    if (this.isConnected()) {
      this.ws!.send(JSON.stringify(message));
    }
  }

  private handleMessage(msg: MT5Response): void {
    // 응답 메시지 처리 (Promise resolve)
    if ('id' in msg && msg.id) {
      const pending = this.pendingRequests.get(msg.id);
      if (pending) {
        clearTimeout(pending.timeout);
        this.pendingRequests.delete(msg.id);

        if (msg.type === 'ERROR') {
          pending.reject(new Error(msg.message));
        } else {
          pending.resolve(msg);
        }
        return;
      }
    }

    // 전역 핸들러에 전달 (TICK, ACCOUNT_UPDATE 등 실시간 데이터)
    this.globalHandlers.forEach((handler) => handler(msg));
  }

  private setConnectionState(state: ConnectionState): void {
    this.connectionState = state;
    this.stateHandlers.forEach((handler) => handler(state));
  }

  private scheduleReconnect(): void {
    if (this.isDestroyed || this.reconnectAttempts >= this.maxReconnectAttempts) return;

    this.setConnectionState('reconnecting');
    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
      30000
    );
    this.reconnectAttempts++;
    console.log(`[MT5] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      if (!this.isDestroyed) this.connect().catch(console.error);
    }, delay);
  }

  private startPing(): void {
    this.pingInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send({ id: 'ping', action: 'PING' });
      }
    }, 30000);
  }

  private stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}

// 싱글톤 인스턴스 관리
let clientInstance: MT5BridgeClient | null = null;

export function getMT5Client(url: string, token: string): MT5BridgeClient {
  if (!clientInstance) {
    clientInstance = new MT5BridgeClient(url, token);
  }
  return clientInstance;
}

export function destroyMT5Client(): void {
  clientInstance?.disconnect();
  clientInstance = null;
}

export function getMT5ClientInstance(): MT5BridgeClient | null {
  return clientInstance;
}
