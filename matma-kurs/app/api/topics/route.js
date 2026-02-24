import { NextResponse } from 'next/server';
import pool from '../../lib/db';

export async function GET() {
  try {
    // Sortujemy według sort_order zamiast topic_id
    const [rows] = await pool.execute('SELECT * FROM topics ORDER BY sort_order ASC');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}