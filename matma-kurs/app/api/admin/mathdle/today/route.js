import { NextResponse } from 'next/server';
import db from '@/app/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Pobieramy datę w formacie YYYY-MM-DD (Czas Polski)
        const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Warsaw' });
        
        console.log("=== API DEBUG: Szukam zadań dla daty:", today);

        const [rows] = await db.query(`
            SELECT 
                t.task_id, 
                t.question, 
                t.points,
                a.difficulty,
                a.special_event
            FROM daily_assignments a
            JOIN tasks t ON a.task_id = t.task_id
            WHERE DATE(a.assignment_date) = ?
            ORDER BY a.difficulty ASC
        `, [today]);

        console.log("=== API DEBUG: Znaleziono wierszy:", rows.length);

        return NextResponse.json(rows);
    } catch (error) {
        console.error("=== API ERROR ===", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}