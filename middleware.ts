import { NextRequest, NextResponse } from 'next/server';

/**
 * Routes that are always accessible regardless of maintenance mode.
 * - /manutencao → the maintenance page itself
 * - /api/maintenance → endpoint the page and middleware use
 * - /painel-admin → admins can still access the admin panel
 * - /_next / /favicon → Next.js internals & static assets
 */
const MAINTENANCE_BYPASS_PREFIXES = [
  '/manutencao',
  '/api/maintenance',
  '/painel-admin',
  '/_next',
  '/favicon',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Maintenance mode check ────────────────────────────────────────────────
  // Skip the check for routes that must always be accessible
  const isBypassed = MAINTENANCE_BYPASS_PREFIXES.some(prefix =>
    pathname.startsWith(prefix),
  );

  if (!isBypassed) {
    try {
      const maintenanceUrl = new URL('/api/maintenance', req.url);
      const res = await fetch(maintenanceUrl.toString(), {
        // Use a short timeout – if the check hangs, don't block users
        signal: AbortSignal.timeout(3000),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.is_active === true) {
          const url = req.nextUrl.clone();
          url.pathname = '/manutencao';
          return NextResponse.redirect(url);
        }
      }
    } catch {
      // If the check fails, allow the request to proceed (fail-open)
    }
  }

  // ── CORS for API routes ───────────────────────────────────────────────────
  if (pathname.startsWith('/api')) {
    const origin = req.headers.get('origin') ?? '';
    const host   = req.headers.get('host')   ?? '';

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
  /*
   * Run on every route EXCEPT Next.js static files that never need
   * maintenance checks or CORS handling.
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
