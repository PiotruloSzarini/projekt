import { NextResponse } from 'next/server';
import pool from '../../lib/db';

export async function GET() {
  try {
        const [rows] = await pool.execute('SELECT * FROM task_types ORDER BY task_type_id ASC');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}





