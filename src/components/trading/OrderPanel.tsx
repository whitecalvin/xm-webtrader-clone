'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { useMarketStore } from '@/store/marketStore';
import { useAccountStore } from '@/store/accountStore';
import { useUIStore } from '@/store/uiStore';
import { apiClient } from '@/lib/api/client';
import { clsx } from 'clsx';
import type { OrderType } from '@/types/mt5';

const orderSchema = z.object({
  volume: z.number().min(0.01).max(500),
  price: z.number().optional(),
  stopLoss: z.number().optional(),
  takeProfit: z.number().optional(),
  comment: z.string().max(64).optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

const ORDER_TYPES: { value: OrderType; label: string }[] = [
  { value: 'MARKET', label: '시장가' },
  { value: 'LIMIT', label: '지정가' },
  { value: 'STOP', label: '스탑' },
  { value: 'STOP_LIMIT', label: '스탑 리밋' },
];

export function OrderPanel() {
  const t = useTranslations('trading');
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<OrderFormValues | null>(null);

  const symbol = useUIStore((s) => s.orderPanelSymbol);
  const orderDirection = useUIStore((s) => s.orderDirection);
  const setOrderDirection = useUIStore((s) => s.setOrderDirection);
  const confirmOrders = useUIStore((s) => s.confirmOrders);

  const tick = useMarketStore((s) => s.ticks[symbol]);
  const symbolInfo = useMarketStore((s) => s.symbols.find((sym) => sym.symbol === symbol));
  const accountInfo = useAccountStore((s) => s.info);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: { volume: 0.01 },
  });

  const volume = watch('volume', 0.01);
  const digits = symbolInfo?.digits ?? 5;
  const currentPrice = orderDirection === 'BUY' ? (tick?.ask ?? 0) : (tick?.bid ?? 0);
  const isBuy = orderDirection === 'BUY';

  const executeOrder = async (values: OrderFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/mt5/orders', {
        symbol,
        orderType,
        direction: orderDirection,
        volume: values.volume,
        ...(orderType !== 'MARKET' && values.price && { price: values.price }),
        ...(values.stopLoss && { stopLoss: values.stopLoss }),
        ...(values.takeProfit && { takeProfit: values.takeProfit }),
        ...(values.comment && { comment: values.comment }),
      });

      const { ticket } = response.data;
      toast.success(`주문 성공 (티켓: ${ticket})`);
      reset({ volume: 0.01 });
      setShowConfirm(false);
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { error?: string } } })?.response?.data?.error ?? '주문 실행 실패';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
      setPendingOrder(null);
    }
  };

  const onSubmit = (values: OrderFormValues) => {
    if (confirmOrders) {
      setPendingOrder(values);
      setShowConfirm(true);
    } else {
      executeOrder(values);
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-2 border-l border-border-default">
      {/* 심볼 헤더 */}
      <div className="px-3 py-2 border-b border-border-default">
        <div className="text-sm font-bold text-text-primary">{symbol}</div>
        {tick && (
          <div className="flex gap-3 mt-0.5">
            <div className="text-xs">
              <span className="text-text-muted">매도 </span>
              <span className="text-trade-sell font-mono font-semibold">{tick.bid.toFixed(digits)}</span>
            </div>
            <div className="text-xs">
              <span className="text-text-muted">매수 </span>
              <span className="text-trade-buy font-mono font-semibold">{tick.ask.toFixed(digits)}</span>
            </div>
          </div>
        )}
      </div>

      {/* 주문 유형 */}
      <div className="px-3 py-2 border-b border-border-default">
        <div className="flex gap-1 flex-wrap">
          {ORDER_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setOrderType(type.value)}
              className={clsx(
                'px-2 py-0.5 text-xs rounded transition-colors',
                orderType === type.value
                  ? 'bg-surface-4 text-text-primary'
                  : 'text-text-muted hover:text-text-secondary'
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* 주문 폼 */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* 매수/매도 버튼 */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setOrderDirection('SELL')}
            className={clsx(
              'py-3 rounded-lg text-sm font-bold transition-all',
              !isBuy
                ? 'text-white shadow-lg'
                : 'bg-surface-3 text-text-muted hover:bg-surface-4'
            )}
            style={!isBuy ? { backgroundColor: '#ef5350' } : {}}
          >
            <div>{t('sell')}</div>
            {tick && <div className="text-xs font-mono mt-0.5">{tick.bid.toFixed(digits)}</div>}
          </button>
          <button
            type="button"
            onClick={() => setOrderDirection('BUY')}
            className={clsx(
              'py-3 rounded-lg text-sm font-bold transition-all',
              isBuy
                ? 'text-white shadow-lg'
                : 'bg-surface-3 text-text-muted hover:bg-surface-4'
            )}
            style={isBuy ? { backgroundColor: '#26a69a' } : {}}
          >
            <div>{t('buy')}</div>
            {tick && <div className="text-xs font-mono mt-0.5">{tick.ask.toFixed(digits)}</div>}
          </button>
        </div>

        {/* 거래량 */}
        <div>
          <label className="block text-xs text-text-muted mb-1">{t('volume')} ({t('lots')})</label>
          <input
            {...register('volume', { valueAsNumber: true })}
            type="number"
            step={symbolInfo?.volumeStep ?? 0.01}
            min={symbolInfo?.minVolume ?? 0.01}
            max={symbolInfo?.maxVolume ?? 500}
            className="w-full px-2 py-1.5 text-xs font-mono rounded bg-surface-3 border border-border-default text-text-primary outline-none focus:border-xm-primary"
          />
          <div className="flex gap-1 mt-1">
            {[0.01, 0.1, 0.5, 1.0].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => reset({ ...watch(), volume: v })}
                className="px-1.5 py-0.5 text-xs text-text-muted hover:text-text-secondary hover:bg-surface-4 rounded transition-colors"
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* 지정가 */}
        {orderType !== 'MARKET' && (
          <div>
            <label className="block text-xs text-text-muted mb-1">{t('price')}</label>
            <input
              {...register('price', { valueAsNumber: true })}
              type="number"
              step={Math.pow(10, -digits)}
              placeholder={currentPrice.toFixed(digits)}
              className="w-full px-2 py-1.5 text-xs font-mono rounded bg-surface-3 border border-border-default text-text-primary outline-none focus:border-xm-primary"
            />
          </div>
        )}

        {/* SL */}
        <div>
          <label className="block text-xs text-text-muted mb-1">{t('stopLoss')}</label>
          <input
            {...register('stopLoss', { valueAsNumber: true })}
            type="number"
            step={Math.pow(10, -digits)}
            placeholder="0"
            className="w-full px-2 py-1.5 text-xs font-mono rounded bg-surface-3 border border-border-default text-trade-sell outline-none focus:border-trade-sell"
          />
        </div>

        {/* TP */}
        <div>
          <label className="block text-xs text-text-muted mb-1">{t('takeProfit')}</label>
          <input
            {...register('takeProfit', { valueAsNumber: true })}
            type="number"
            step={Math.pow(10, -digits)}
            placeholder="0"
            className="w-full px-2 py-1.5 text-xs font-mono rounded bg-surface-3 border border-border-default text-trade-buy outline-none focus:border-trade-buy"
          />
        </div>

        {/* 주문 버튼 */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={clsx(
            'w-full py-2.5 rounded-lg font-bold text-white text-sm transition-opacity',
            isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'
          )}
          style={{ backgroundColor: isBuy ? '#26a69a' : '#ef5350' }}
        >
          {isSubmitting ? '처리 중...' : `${isBuy ? t('buy') : t('sell')} ${symbol}`}
        </button>
      </form>

      {/* 주문 확인 모달 */}
      {showConfirm && pendingOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface-2 border border-border-default rounded-xl p-6 w-80 shadow-xl">
            <h3 className="text-sm font-semibold text-text-primary mb-4">{t('orderConfirmTitle')}</h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-text-muted">심볼</span>
                <span className="font-semibold">{symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">방향</span>
                <span className={clsx('font-bold', isBuy ? 'text-trade-buy' : 'text-trade-sell')}>
                  {isBuy ? t('buy') : t('sell')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">수량</span>
                <span className="font-mono">{pendingOrder.volume} lot</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">가격</span>
                <span className="font-mono">{orderType === 'MARKET' ? '시장가' : pendingOrder.price?.toFixed(digits)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowConfirm(false); setPendingOrder(null); }}
                className="flex-1 py-2 rounded-lg text-sm bg-surface-3 text-text-secondary hover:bg-surface-4 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => executeOrder(pendingOrder)}
                disabled={isSubmitting}
                className="flex-1 py-2 rounded-lg text-sm font-bold text-white transition-opacity disabled:opacity-70"
                style={{ backgroundColor: isBuy ? '#26a69a' : '#ef5350' }}
              >
                {isSubmitting ? '처리 중...' : t('placeOrder')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
