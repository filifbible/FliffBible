import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Apply CORS only to API routes
  if (pathname.startsWith('/api')) {
    const origin = req.headers.get('origin') ?? '';
    const host   = req.headers.get('host')   ?? '';

    // Allow same-origin requests (dynamically derived from the request host)
    // and localhost for development
    const allowedOrigins = [
      `https://${host}`,
      `http://${host}`,
      'http://localhost:3000',
    ];

    if (origin && !allowedOrigins.includes(origin)) {
      return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
