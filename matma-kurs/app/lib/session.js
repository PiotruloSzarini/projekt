import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

// cookieSource może być request.cookies (z API routes) albo cookies() (z server components)
// Oba mają identyczne API .get(name)?.value
async function loadSessionData(cookieSource) {
    const token = cookieSource.get('session_token')?.value;
    if (!token) return null;

    const [rows] = await pool.execute(
        `SELECT s.user_id, ac.is_admin
         FROM sessions s
         LEFT JOIN auth_credentials ac ON s.user_id = ac.user_id
         WHERE s.token = ? AND s.expires_at > NOW()
         LIMIT 1`,
        [token]
    );

    if (!rows.length) return null;
    return {
        userId: rows[0].user_id,
        isAdmin: Number(rows[0].is_admin) === 1,
    };
}

export async function getSessionUserId(request) {
    const data = await loadSessionData(request.cookies);
    return data?.userId ?? null;
}

export async function getSession(request) {
    const data = await loadSessionData(request.cookies);
    return {
        userId: data?.userId ?? null,
        isAdmin: data?.isAdmin ?? false,
    };
}

export async function getSessionFromCookies(cookieStore) {
    const data = await loadSessionData(cookieStore);
    return {
        userId: data?.userId ?? null,
        isAdmin: data?.isAdmin ?? false,
    };
}

export async function requireAdmin(request) {
    const session = await getSession(request);

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
