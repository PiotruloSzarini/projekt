import { NextResponse } from 'next/server';

const CSP = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://res.cloudinary.com https://i.ytimg.com",
    "font-src 'self' data:",
    "connect-src 'self' https://api.cloudinary.com https://res.cloudinary.com",
    // iframe z YouTube dla lekcji video
    "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
    "media-src 'self' https://res.cloudinary.com blob:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
].join('; ');

const SECURITY_HEADERS = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': CSP,
};

function withHeaders(response) {
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
        response.headers.set(key, value);
    }
    return response;
}

// Middleware działa w Edge runtime — nie ma dostępu do DB.
// Sprawdzamy tylko obecność tokenu (UX gate), realna weryfikacja jest w API/server components.
function hasSessionToken(request) {
    const token = request.cookies.get('session_token')?.value;
    return typeof token === 'string' && token.length > 0;
}

export function middleware(request) {
    const loggedIn = hasSessionToken(request);
    const role = request.cookies.get('session_user_role')?.value || 'user';
    const { pathname } = request.nextUrl;

    if (pathname === '/login') {
        if (loggedIn) {
            return withHeaders(NextResponse.redirect(new URL(role === 'admin' ? '/' : '/dashboard', request.url)));
        }
        return withHeaders(NextResponse.next());
    }

    if (!loggedIn) {
        return withHeaders(NextResponse.redirect(new URL('/login', request.url)));
    }

    if ((pathname.startsWith('/admin') || pathname === '/') && role !== 'admin') {
        return withHeaders(NextResponse.redirect(new URL('/dashboard', request.url)));
    }

    return withHeaders(NextResponse.next());
}

export const config = {
    matcher: ['/', '/dashboard/:path*', '/login', '/admin/:path*'],
};
