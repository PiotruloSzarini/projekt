import { NextResponse } from 'next/server';
import db from '@/app/lib/db';

export async function POST(req) {
    try {
        const { userId, taskId, difficulty, userAnswer } = await req.json();

        // 1. POBIERANIE POPRAWNEJ ODPOWIEDZI (Z tabeli task_single_input)
        // Łączymy tabelę tasks z tabelą odpowiedzi dedykowaną dla wpisywania tekstu
        const [rows] = await db.query(`
            SELECT t.task_id, s.correct_value 
            FROM tasks t
            JOIN task_single_input s ON t.task_id = s.task_id
            WHERE t.task_id = ?
        `, [taskId]);
        
        if (!rows || rows.length === 0) {
            return NextResponse.json({ 
                error: "To zadanie nie ma zdefiniowanej odpowiedzi w task_single_input" 
            }, { status: 404 });
        }

        const task = rows[0];

        // 2. PORÓWNANIE (usuwamy spacje, małe litery)
        const isCorrect = String(task.correct_value).toLowerCase().trim() === String(userAnswer).toLowerCase().trim();

        if (!isCorrect) {
            return NextResponse.json({ isCorrect: false, message: "Błędna odpowiedź, spróbuj jeszcze raz!" });
        }

        // 3. SYSTEM PUNKTACJI
        const pointsMap = { 1: 1, 2: 3, 3: 5 };
        const pointsToAdd = pointsMap[difficulty] || 0;

        // 4. AKTUALIZACJA PUNKTÓW UŻYTKOWNIKA
        // Upewnij się, że masz tabelę 'users' z kolumną 'total_points' i 'id'
        try {
            await db.query(
                "UPDATE users SET total_points = total_points + ? WHERE id = ?", 
                [pointsToAdd, userId]
            );
        } catch (dbErr) {
            console.error("Błąd aktualizacji punktów:", dbErr.message);
            // Jeśli nie masz tabeli users, i tak powiedz userowi, że ma rację
            return NextResponse.json({ 
                isCorrect: true, 
                message: "Dobrze! (Błąd zapisu punktów: brak tabeli users)" 
            });
        }
        
        return NextResponse.json({ 
            isCorrect: true, 
            message: `Doskonale! Zdobywasz ${pointsToAdd} pkt.` 
        });

    } catch (error) {
        console.error("BŁĄD SYSTEMU:", error);
        return NextResponse.json({ error: "Błąd serwera: " + error.message }, { status: 500 });
    }
}