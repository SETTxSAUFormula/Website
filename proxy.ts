import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const pathname = request.nextUrl.pathname;
  requestHeaders.set(
    'x-sauformula-language',
    pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'tr',
  );
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
