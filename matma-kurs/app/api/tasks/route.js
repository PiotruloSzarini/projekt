import { NextResponse } from 'next/server';
import pool from '../../lib/db';

async function ensureTaskSortOrderColumn() {
  const [columns] = await pool.query(`
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'tasks'
      AND COLUMN_NAME = 'sort_order'
    LIMIT 1
  `);

  if (columns.length === 0) {
    await pool.query(`ALTER TABLE tasks ADD COLUMN sort_order INT NULL`);
  }
}

export async function GET() {
  try {
    await ensureTaskSortOrderColumn();
    const [rows] = await pool.execute(
      'SELECT * FROM tasks ORDER BY COALESCE(sort_order, 999999), task_id ASC'
    );

    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}







