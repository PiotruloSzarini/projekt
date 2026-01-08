import { NextResponse } from 'next/server';
import pool from '../../lib/db';

export async function GET() {
  try {
      const [rows] = await pool.execute('SELECT * FROM task_matching_pairs_items ORDER BY task_pair_id, sort_order');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}






