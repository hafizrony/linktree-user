import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. If hitting root "/", decide where to go
  if (pathname === '/') {
    return token 
      ? NextResponse.redirect(new URL('/dashboard', request.url))
      : NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Protect /dashboard: If no token, go to login
  if (pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. If logged in, don't allow going back to /login or /register
//   if ((pathname === '/login' || pathname === '/register') && token) {
//     return NextResponse.redirect(new URL('/dashboard', request.url));
//   }

  // 4. Everything else (like /[username]) is allowed
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};