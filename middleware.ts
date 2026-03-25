import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL ?? '',
  'http://localhost:3000',
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Apply CORS only to API routes
  if (pathname.startsWith('/api')) {
    const origin = req.headers.get('origin') ?? '';
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
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
