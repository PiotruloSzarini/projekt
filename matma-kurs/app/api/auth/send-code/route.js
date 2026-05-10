import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'Brak User ID' }, { status: 400 });
    }

    const [users] = await pool.execute('SELECT user_id FROM users WHERE user_id = ?', [userId]);
    
    if (users.length === 0) {
      return NextResponse.json({ error: 'Użytkownik nie istnieje w bazie' }, { status: 404 });
    }

    const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await pool.execute(
      'INSERT INTO auth_tokens (user_id, token, expires_at, is_used) VALUES (?, ?, ?, ?)',
      [userId, mockCode, expiresAt, false]
    );

    return NextResponse.json({ 
      success: true, 
      code: mockCode,
      message: 'Kod wygenerowany pomyślnie' 
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}