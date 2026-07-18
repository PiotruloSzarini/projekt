import { NextResponse } from 'next/server';

const SECURITY_HEADERS = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
};

function withHeaders(response) {
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
        response.headers.set(key, value);
    }
    return response;
}

function getValidUserId(request) {
    const raw = request.cookies.get('session_user_id')?.value;
    const id = parseInt(raw, 10);
    return isNaN(id) || id <= 0 ? null : id;
}

export function middleware(request) {
    const userId = getValidUserId(request);
    const role = request.cookies.get('session_user_role')?.value || 'user';
    const { pathname } = request.nextUrl;

    if (pathname === '/login') {
        if (userId) {
            return withHeaders(NextResponse.redirect(new URL(role === 'admin' ? '/' : '/dashboard', request.url)));
        }
        return withHeaders(NextResponse.next());
    }

    if (!userId) {
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
