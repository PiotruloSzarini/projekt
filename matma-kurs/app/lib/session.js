import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export function getSessionUserId(request) {
    const raw = request.cookies.get('session_user_id')?.value;
    const id = parseInt(raw, 10);
    return isNaN(id) || id <= 0 ? null : id;
}

export function getSession(request) {
    const userId = getSessionUserId(request);
    const role = request.cookies.get('session_user_role')?.value || 'user';
    return { userId, isAdmin: role === 'admin' };
}

// Weryfikuje admina przez DB — cookie session_user_role jest tylko UX hint dla middleware,
// nie jest źródłem prawdy dla autoryzacji API.
export async function requireAdmin(request) {
    const userId = getSessionUserId(request);

    if (!userId) {
        return {
            session: { userId: null },
            response: NextResponse.json({ error: 'Brak aktywnej sesji' }, { status: 401 }),
        };
    }

    const [rows] = await pool.execute(
        'SELECT is_admin FROM auth_credentials WHERE user_id = ? LIMIT 1',
        [userId]
    );

    if (!rows.length || Number(rows[0].is_admin) !== 1) {
        return {
            session: { userId },
            response: NextResponse.json({ error: 'Brak uprawnień administratora' }, { status: 403 }),
        };
    }

    return { session: { userId }, response: null };
}
