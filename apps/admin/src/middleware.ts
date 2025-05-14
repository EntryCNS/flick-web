import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // const token = request.cookies.get('token')?.value;

  // const isLoggedIn = !!token;
  // const isOnLoginPage = request.nextUrl.pathname === '/login';

  // if (!isLoggedIn && !isOnLoginPage) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  // if (isLoggedIn && isOnLoginPage) {
  //   return NextResponse.redirect(new URL('/dashboard', request.url));
  // }

  // return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|static|favicon.ico).*)'],
}