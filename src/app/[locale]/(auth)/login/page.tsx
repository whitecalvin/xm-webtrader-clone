import { LoginForm } from '@/components/auth/LoginForm';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-surface-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 로고 영역 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 bg-xm-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">X</span>
            </div>
            <span className="text-2xl font-bold text-text-primary">WebTrader</span>
          </div>
          <p className="text-text-secondary text-sm">MetaTrader 5 온라인 거래 플랫폼</p>
        </div>

        {/* 로그인 폼 */}
        <div className="bg-surface-2 border border-border-default rounded-xl p-6 shadow-xl">
          <LoginForm />
        </div>

        {/* 하단 안내 */}
        <p className="text-center text-text-muted text-xs mt-6">
          MT5 계좌번호와 비밀번호로 로그인하세요
        </p>
      </div>
    </div>
  );
}
