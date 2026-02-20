import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req) {
    try {
        const { userId, taskId, difficulty, userAnswer } = await req.json();

        // 1. Pobierz poprawną odpowiedź z bazy
        const [tasks] = await db.query("SELECT correct_answer FROM tasks WHERE task_id = ?", [taskId]);
        if (tasks.length === 0) return NextResponse.json({ error: "Zadanie nie istnieje" }, { status: 404 });

        const task = tasks[0];

        // 2. Sprawdź odpowiedź
        if (String(task.correct_answer).trim() !== String(userAnswer).trim()) {
            return NextResponse.json({ isCorrect: false, message: "Błędna odpowiedź" });
        }

        // 3. Mapowanie punktów
        const pointsMap = { 1: 1, 2: 3, 3: 5 };
        const pointsToAdd = pointsMap[difficulty] || 0;

        // 4. Zapisz punkty i historię (Najlepiej w transakcji)
        // Zakładamy, że masz tabelę 'users' z kolumną 'total_points' 
        // oraz tabelę 'user_history' by zapobiec spamerom
        await db.query("UPDATE users SET total_points = total_points + ? WHERE id = ?", [pointsToAdd, userId]);
        
        return NextResponse.json({ 
            isCorrect: true, 
            pointsEarned: pointsToAdd,
            message: `Brawo! Zdobyłeś ${pointsToAdd} pkt.` 
        });

    } catch (error) {
        return NextResponse.json({ error: "Błąd serwera" }, { status: 500 });
    }
}