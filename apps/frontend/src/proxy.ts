import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const SESSION_COOKIE = 'teralya_session';
const IDENTITY_COOKIE = 'teralya_identity';

export function proxy(request: NextRequest) {
  if (!['GET', 'HEAD'].includes(request.method)) {
    return NextResponse.next();
  }

  const hasSession = request.cookies.has(SESSION_COOKIE) && request.cookies.has(IDENTITY_COOKIE);

  if (!hasSession) {
    return NextResponse.redirect(new URL('/acceso', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/cuenta/:path*', '/pedidos/:path*', '/bodega/:path*', '/admin/:path*'],
};
