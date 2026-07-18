import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';

export async function POST(request) {
    const token = request.cookies.get('session_token')?.value;

    if (token) {
        try {
            await pool.execute('DELETE FROM sessions WHERE token = ?', [token]);
        } catch (error) {
            console.error('Błąd usuwania sesji z DB:', error);
        }
    }

    const response = NextResponse.json({ success: true });

    const clearOptions = { path: '/', httpOnly: true, maxAge: 0 };
    response.cookies.set('session_token', '', clearOptions);
    response.cookies.set('session_user_role', '', clearOptions);
    // stare cookies dla użytkowników sprzed migracji
    response.cookies.set('session_user_id', '', clearOptions);

    return response;
}
