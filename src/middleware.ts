import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import { getSessionFromRequest } from './lib/auth/session';

const intlMiddleware = createMiddleware(routing);

// 인증 없이 접근 가능한 경로 패턴 (locale prefix 제외)
const PUBLIC_PATH_PATTERNS = ['/login'];

function isPublicPath(pathname: string): boolean {
  // /ko/login, /en/login, etc.
  return PUBLIC_PATH_PATTERNS.some((p) => {
    const regex = new RegExp(`^/[a-z]{2}${p}$`);
    return regex.test(pathname);
  });
}

function isApiPath(pathname: string): boolean {
  return pathname.startsWith('/api/');
}

function isPublicApiPath(pathname: string): boolean {
  return pathname.startsWith('/api/auth/');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API 경로 처리
  if (isApiPath(pathname)) {
    if (!isPublicApiPath(pathname)) {
      const session = await getSessionFromRequest(request);
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    return NextResponse.next();
  }

  // i18n 미들웨어 실행
  const response = intlMiddleware(request);

  // 플랫폼 경로 인증 체크
  if (!isPublicPath(pathname)) {
    const session = await getSessionFromRequest(request);
    if (!session) {
      // 현재 locale 감지
      const localeMatch = pathname.match(/^\/([a-z]{2})\//);
      const locale = localeMatch ? localeMatch[1] : 'ko';
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\..*).*)' ,
  ],
};
