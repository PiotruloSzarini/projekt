import { NextResponse } from 'next/server';
import pool from "@/app/lib/db";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    try {
        const [rows] = await pool.query(
            // Pobieramy dodatkowo special_event
            `SELECT assignment_date, difficulty, special_event 
             FROM daily_assignments 
             WHERE assignment_date BETWEEN ? AND ?`,
            [start, end]
        );

        const statusMap = {};
        rows.forEach(row => {
            const date = new Date(row.assignment_date.getTime() - (row.assignment_date.getTimezoneOffset() * 60000))
                .toISOString()
                .split('T')[0];

            if (!statusMap[date]) {
                // [easy, medium, hard, isSpecial]
                statusMap[date] = [0, 0, 0, false];
            }
            
            statusMap[date][row.difficulty - 1] = 1;
            
            // Jeśli choć jedno zadanie tego dnia jest "special", cały dzień oznaczamy jako specjalny
            if (row.special_event === 1 || row.special_event === true) {
                statusMap[date][3] = true;
            }
        });

        return NextResponse.json(statusMap);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}