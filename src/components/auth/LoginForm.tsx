'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/store/authStore';
import { DEMO_SERVERS } from '@/types/api';
import { clsx } from 'clsx';

const loginSchema = z.object({
  login: z
    .string()
    .min(1, '계좌 번호를 입력해 주세요')
    .regex(/^\d+$/, '숫자만 입력해 주세요'),
  password: z.string().min(1, '비밀번호를 입력해 주세요'),
  server: z.string().min(1, '서버를 선택해 주세요'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const locale = useLocale();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { server: DEMO_SERVERS[0].id },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', {
        login: parseInt(values.login),
        password: values.password,
        server: values.server,
      });

      const { accountInfo } = response.data;
      setAuth({
        accountLogin: accountInfo.login,
        accountName: accountInfo.name,
        server: accountInfo.server,
        currency: accountInfo.currency ?? 'USD',
        token: 'session',
      });

      toast.success('로그인 성공!');
      router.push(`/${locale}/trade`);
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        t('loginError');
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* 계좌 번호 */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          {t('accountNumber')}
        </label>
        <input
          {...register('login')}
          type="text"
          inputMode="numeric"
          placeholder={t('accountNumberPlaceholder')}
          className={clsx(
            'w-full px-3 py-2 rounded-lg bg-surface-3 border text-text-primary text-sm outline-none transition-colors',
            errors.login
              ? 'border-trade-sell focus:border-trade-sell'
              : 'border-border-default focus:border-xm-primary'
          )}
        />
        {errors.login && (
          <p className="text-xs text-trade-sell mt-1">{errors.login.message}</p>
        )}
      </div>

      {/* 비밀번호 */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          {t('password')}
        </label>
        <input
          {...register('password')}
          type="password"
          placeholder={t('passwordPlaceholder')}
          className={clsx(
            'w-full px-3 py-2 rounded-lg bg-surface-3 border text-text-primary text-sm outline-none transition-colors',
            errors.password
              ? 'border-trade-sell focus:border-trade-sell'
              : 'border-border-default focus:border-xm-primary'
          )}
        />
        {errors.password && (
          <p className="text-xs text-trade-sell mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* 서버 선택 */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          {t('server')}
        </label>
        <select
          {...register('server')}
          className={clsx(
            'w-full px-3 py-2 rounded-lg bg-surface-3 border text-text-primary text-sm outline-none transition-colors appearance-none cursor-pointer',
            errors.server
              ? 'border-trade-sell'
              : 'border-border-default focus:border-xm-primary'
          )}
        >
          {DEMO_SERVERS.map((server) => (
            <option key={server.id} value={server.id} className="bg-surface-3">
              {server.name}
            </option>
          ))}
        </select>
        {errors.server && (
          <p className="text-xs text-trade-sell mt-1">{errors.server.message}</p>
        )}
      </div>

      {/* 로그인 버튼 */}
      <button
        type="submit"
        disabled={isLoading}
        className={clsx(
          'w-full py-2.5 rounded-lg font-semibold text-white text-sm transition-opacity mt-2',
          isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'
        )}
        style={{ backgroundColor: '#e63329' }}
      >
        {isLoading ? t('loggingIn') : t('loginButton')}
      </button>
    </form>
  );
}
