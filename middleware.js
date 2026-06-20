import { NextResponse } from 'next/server';

export function middleware(request) {
  const path = request.nextUrl.pathname;

  // Allow access to login page and API routes
  if (path === '/login' || path.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Protect dashboard route
  if (path.startsWith('/dashboard')) {
    const authToken = request.cookies.get('admin_auth')?.value;

    if (!authToken || authToken !== 'authenticated') {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', path);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
