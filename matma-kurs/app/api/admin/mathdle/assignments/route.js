import { NextResponse } from 'next/server';
import pool from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/session";

export async function GET(request) {
    const { response } = requireAdmin(request);
    if (response) return response;

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    try {
        const [rows] = await pool.query(
    'SELECT task_id, difficulty FROM daily_assignments WHERE DATE(assignment_date) = ?',
    [date]
);
        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}