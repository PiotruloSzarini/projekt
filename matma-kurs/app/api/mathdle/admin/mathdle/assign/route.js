import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req) {
    try {
        const { date, assignments } = await req.json();

        if (!date || !assignments) {
            return NextResponse.json({ error: "Brak daty lub zadań" }, { status: 400 });
        }

        // Używamy transakcji, żeby mieć pewność, że albo zapisze się wszystko, albo nic
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // 1. Usuwamy stare przypisania dla wybranego dnia (czyścimy sloty przed nowym zapisem)
            await connection.query(
                "DELETE FROM mathdle_assignments WHERE assignment_date = ?",
                [date]
            );

            // 2. Jeśli admin przesłał jakieś zadania, wstawiamy je
            if (assignments.length > 0) {
                const values = assignments.map(asg => [
                    asg.assignment_date,
                    asg.task_id,
                    asg.difficulty
                ]);

                await connection.query(
                    "INSERT INTO mathdle_assignments (assignment_date, task_id, difficulty) VALUES ?",
                    [values]
                );
            }

            await connection.commit();
            connection.release();

            return NextResponse.json({ success: true, message: "Zapisano harmonogram" });

        } catch (dbError) {
            await connection.rollback();
            connection.release();
            throw dbError;
        }

    } catch (error) {
        console.error("Błąd zapisu przypisań:", error);
        return NextResponse.json({ error: "Błąd serwera podczas zapisu" }, { status: 500 });
    }
}