import { NextResponse } from 'next/server';
import db from '@/lib/db'; // upewnij się, że ścieżka do bazy jest poprawna

export async function GET() {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Pobieramy zadania przypisane na dziś
        // Łączymy tabelę przypisań (np. mathdle_assignments) z tabelą zadań (tasks)
        const [rows] = await db.query(`
            SELECT 
                t.task_id, 
                t.question, 
                t.task_type_code,
                a.difficulty
            FROM mathdle_assignments a
            JOIN tasks t ON a.task_id = t.task_id
            WHERE a.assignment_date = ?
            ORDER BY a.difficulty ASC
        `, [today]);

        return NextResponse.json(rows);
    } catch (error) {
        console.error("Błąd pobierania zadań na dziś:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}