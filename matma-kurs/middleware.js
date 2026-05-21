import { NextResponse } from 'next/server';

export function middleware(request) {
    const session = request.cookies.get('session_user_id');
    const { pathname } = request.nextUrl;

    // 1. Pozwól na dostęp do strony logowania i API autoryzacji bez sesji
    if (pathname === '/login' || pathname.startsWith('/api/auth')) {
        return NextResponse.next();
    }

    // 2. Jeśli nie ma sesji i użytkownik pcha się do dashboardu -> wyrzuć go na /login
    if (pathname.startsWith('/dashboard') && !session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 3. Jeśli użytkownik jest już zalogowany i wchodzi na /login -> przenieś go na stronę główną dashboardu
    if (pathname === '/login' && session) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
    }

    // Konfiguracja: obejmij dashboard i api (oprócz statyków i obrazków)
    export const config = {
    matcher: ['/dashboard/:path*', '/login', '/api/:path*'],
    };