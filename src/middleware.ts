import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname !== '/') {
    return NextResponse.next();
  }

  const isMiniAppPath = pathname.startsWith('/miniapp');
  const isMiniAppQuery = searchParams.get('miniApp') === 'true';
  const userAgent = request.headers.get('user-agent') || '';

  const isFarcasterClient =
    userAgent.includes('Farcaster') || userAgent.includes('Warpcast') || userAgent.includes('MiniApp');

  const isIframe =
    request.headers.get('sec-fetch-dest') === 'iframe' || request.headers.get('x-frame-options') !== null;

  const isLikelyMiniApp = isMiniAppPath || isMiniAppQuery || isFarcasterClient || isIframe;

  if (isLikelyMiniApp) {
    return NextResponse.redirect(new URL('/miniapp/dashboard', request.url));
  } else {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
