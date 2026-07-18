import { NextResponse } from 'next/server';
import pool from '../../../lib/db';


export async function POST(request) {
    const connection = await pool.getConnection();

    try {
        const { userId, code } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'Brak ID użytkownika' }, { status: 400 });
        }

        const [tokens] = await connection.execute(
            `SELECT * FROM auth_tokens
             WHERE user_id = ? AND token = ? AND is_used = FALSE AND expires_at > NOW()
             ORDER BY expires_at DESC LIMIT 1`,
            [userId, code]
        );

        if (tokens.length === 0) {
            return NextResponse.json({ error: 'Nieprawidłowy lub wygasły kod' }, { status: 401 });
        }

        await connection.execute('UPDATE auth_tokens SET is_used = TRUE WHERE token_id = ?', [tokens[0].token_id]);

        const [roleRows] = await connection.execute(
            `SELECT is_admin FROM auth_credentials WHERE user_id = ? LIMIT 1`,
            [userId]
        );

        const isAdmin = Number(roleRows[0]?.is_admin) === 1;
        const redirectTo = isAdmin ? '/' : '/dashboard';

        const response = NextResponse.json({ success: true, message: 'Zalogowano', isAdmin, redirectTo });

        response.cookies.set('session_user_id', String(userId), {
            path: '/',
            httpOnly: true,
            maxAge: 60 * 60 * 24,
        });

        response.cookies.set('session_user_role', isAdmin ? 'admin' : 'user', {
            path: '/',
            httpOnly: true,
            maxAge: 60 * 60 * 24,
        });

        return response;
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        connection.release();
    }
}
