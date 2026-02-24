import { NextResponse } from 'next/server';
import db from '@/app/lib/db';

export async function GET() {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Pobieramy zadania z nowej tabeli daily_assignments
        const [rows] = await db.query(`
    SELECT 
        t.task_id, 
        t.question, 
        t.task_type_id,
        t.points,            -- DODAJ TO
        tt.code as task_type_code,
        a.difficulty,
        a.special_event
    FROM daily_assignments a
    JOIN tasks t ON a.task_id = t.task_id
    JOIN task_types tt ON t.task_type_id = tt.task_type_id
    WHERE a.assignment_date = ?
    ORDER BY a.difficulty ASC
`, [today]);
        return NextResponse.json(rows);
    } catch (error) {
        console.error("Błąd pobierania zadań na dziś:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}