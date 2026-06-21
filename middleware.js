import { NextResponse } from 'next/server';

export function middleware(request) {
  const path = request.nextUrl.pathname;

  // Check if site is closed
  const siteStatus = process.env.SITE_STATUS || 'open';

  // Allow admin routes and API routes even when closed
  const isAdminRoute = path === '/login' || path.startsWith('/dashboard');
  const isApiRoute = path.startsWith('/api');

  if (siteStatus === 'closed' && !isAdminRoute && !isApiRoute) {
    // Redirect to the closed page
    const closedUrl = new URL('/closed', request.url);
    return NextResponse.redirect(closedUrl);
  }

  // Protect dashboard (existing middleware logic)
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
