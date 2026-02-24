import { NextResponse } from 'next/server';
import db from '@/app/lib/db';

export async function POST(req) {
    let connection;
    try {
        const { date, assignments } = await req.json();

        if (!date) {
            return NextResponse.json({ error: "Brak daty" }, { status: 400 });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Walidacja powtórek w obrębie MIESIĄCA
            if (assignments && assignments.length > 0) {
                const taskIds = assignments.map(a => a.task_id);
                const monthPattern = date.substring(0, 7) + '%'; 

                // Pobieramy ID i datę, jeśli zadanie już istnieje w tym miesiącu (ale nie dziś)
                const [duplicates] = await connection.query(
                    `SELECT task_id, DATE_FORMAT(assignment_date, '%d.%m.%Y') as human_date 
                     FROM daily_assignments 
                     WHERE task_id IN (?) 
                     AND assignment_date LIKE ? 
                     AND DATE(assignment_date) != DATE(?)`,
                    [taskIds, monthPattern, date]
                );

                if (duplicates.length > 0) {
                    const dup = duplicates[0];
                    await connection.rollback();
                    connection.release();
                    // Zwracamy ładny komunikat, który Twój handleSave wyświetli w alert()
                    return NextResponse.json({ 
                        error: `Zadanie o ID ${dup.task_id} jest już zajęte w dniu ${dup.human_date}. Wybierz inne zadanie.` 
                    }, { status: 400 });
                }
            }

            // 2. CZYSZCZENIE DNIA
            await connection.query(
                "DELETE FROM daily_assignments WHERE DATE(assignment_date) = DATE(?)",
                [date]
            );

            // 3. WSTAWIANIE NOWYCH
            if (assignments && assignments.length > 0) {
                const values = assignments.map(asg => [
                    asg.assignment_date,
                    asg.task_id,
                    asg.difficulty,
                    asg.special_event || false
                ]);

                await connection.query(
                    "INSERT INTO daily_assignments (assignment_date, task_id, difficulty, special_event) VALUES ?",
                    [values]
                );
            }

            await connection.commit();
            connection.release();
            return NextResponse.json({ success: true });

        } catch (dbError) {
            if (connection) await connection.rollback();
            throw dbError;
        }
    } catch (error) {
        if (connection) connection.release();
        console.error("BŁĄD API ASSIGN:", error);
        return NextResponse.json({ error: error.message || "Błąd serwera" }, { status: 500 });
    }
}