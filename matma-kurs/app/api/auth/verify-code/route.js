import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export async function POST(request) {
  try {
    const { userId, code } = await request.json();

    const [tokens] = await pool.execute(
      `SELECT * FROM auth_tokens 
       WHERE user_id = ? AND token = ? AND is_used = FALSE AND expires_at > NOW()
       ORDER BY expires_at DESC LIMIT 1`,
      [userId, code]
    );

    if (tokens.length === 0) {
      return NextResponse.json({ error: 'Nieprawidłowy lub wygasły kod' }, { status: 401 });
    }

    await pool.execute('UPDATE auth_tokens SET is_used = TRUE WHERE token_id = ?', [tokens[0].token_id]);

    const response = NextResponse.json({ success: true, message: 'Zalogowano' });

    response.cookies.set('session_user_id', userId, {
      path: '/',
      httpOnly: true,
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}