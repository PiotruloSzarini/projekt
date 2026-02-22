import { NextResponse } from 'next/server';
import db from '@/app/lib/db';

export async function POST(req) {
    try {
        const { userId, taskId, difficulty, userAnswer } = await req.json();

        // 1. Pobierz poprawną odpowiedź (Używamy kolumny 'answer' z Twojej tabeli tasks)
        const [tasks] = await db.query("SELECT answer FROM tasks WHERE task_id = ?", [taskId]);
        if (tasks.length === 0) return NextResponse.json({ error: "Zadanie nie istnieje" }, { status: 404 });

        const task = tasks[0];

        // 2. Porównanie (case-insensitive i usuwanie spacji)
        if (String(task.answer).toLowerCase().trim() !== String(userAnswer).toLowerCase().trim()) {
            return NextResponse.json({ isCorrect: false, message: "Błędna odpowiedź" });
        }

        // 3. System punktacji
        const pointsMap = { 1: 1, 2: 3, 3: 5 };
        const pointsToAdd = pointsMap[difficulty] || 0;

        // 4. Aktualizacja punktów użytkownika
        await db.query("UPDATE users SET total_points = total_points + ? WHERE id = ?", [pointsToAdd, userId]);
        
        return NextResponse.json({ 
            isCorrect: true, 
            pointsEarned: pointsToAdd,
            message: `Brawo! Zdobyłeś ${pointsToAdd} pkt.` 
        });

    } catch (error) {
        console.error("SUBMIT ERROR:", error);
        return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
    }
}