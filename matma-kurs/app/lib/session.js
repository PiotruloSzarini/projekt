import { NextResponse } from 'next/server';

export function getSessionUserId(request) {
    return request.cookies.get('session_user_id')?.value || null;
}

export function getSessionRole(request) {
    return request.cookies.get('session_user_role')?.value || 'user';
}

export function getSession(request) {
    const userId = getSessionUserId(request);
    const role = getSessionRole(request);

    return {
        userId,
        role,
        isAdmin: role === 'admin',
    };
}

export function requireAdmin(request) {
    const session = getSession(request);

    if (!session.userId) {
        return {
            session,
            response: NextResponse.json({ error: 'Brak aktywnej sesji' }, { status: 401 }),
        };
    }

    if (!session.isAdmin) {
        return {
            session,
            response: NextResponse.json({ error: 'Brak uprawnień administratora' }, { status: 403 }),
        };
    }

    return { session, response: null };
}
