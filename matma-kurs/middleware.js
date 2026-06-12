import { NextResponse } from 'next/server';

export function middleware(request) {
    const session = request.cookies.get('session_user_id');
    const role = request.cookies.get('session_user_role')?.value || 'user';
    const { pathname } = request.nextUrl;

    if (pathname === '/login' || pathname.startsWith('/api/auth')) {
        return NextResponse.next();
    }

    if (!session && (pathname === '/' || pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (session && pathname === '/login') {
        return NextResponse.redirect(new URL(role === 'admin' ? '/' : '/dashboard', request.url));
    }

    if (pathname.startsWith('/admin') && role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (pathname === '/' && role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/dashboard/:path*', '/login', '/api/:path*', '/admin/:path*'],
};
