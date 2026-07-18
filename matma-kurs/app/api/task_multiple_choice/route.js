import { NextResponse } from 'next/server';
import pool from '../../lib/db';

export async function GET() {
  try {
        const [rows] = await pool.execute('SELECT * FROM task_multiple_choice ORDER BY task_multiple_id ASC');

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
        return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}







