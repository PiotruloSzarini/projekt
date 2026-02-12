import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function DELETE(request) {
    try {
        // Pobieramy task_id z parametrów URL (np. /api/admin/tasks/delete?task_id=123)
        const { searchParams } = new URL(request.url);
        const task_id = searchParams.get('task_id');

        if (!task_id) {
            return NextResponse.json(
                { error: "Brak parametru task_id w zapytaniu." }, 
                { status: 400 }
            );
        }

        // 1. Sprawdzamy, czy zadanie w ogóle istnieje (opcjonalne, ale dobre dla logów)
        const [taskExists] = await pool.execute(
            `SELECT task_id FROM tasks WHERE task_id = ?`, 
            [task_id]
        );

        if (taskExists.length === 0) {
            return NextResponse.json(
                { error: "Zadanie o podanym ID nie istnieje." }, 
                { status: 404 }
            );
        }

        // 2. USUNIĘCIE GŁÓWNEGO REKORDU
        // Dzięki Twoim kluczom obcym: FOREIGN KEY (...) REFERENCES tasks(...) ON DELETE CASCADE
        // baza automatycznie usunie dane z:
        // - task_multiple_choice (+ answers)
        // - task_single_input
        // - task_matching_pairs (+ items)
        // - task_step_by_step (+ steps)
        // - task_hints
        // - task_explanation (+ steps)
        const [result] = await pool.execute(
            `DELETE FROM tasks WHERE task_id = ?`, 
            [task_id]
        );

        return NextResponse.json({ 
            success: true, 
            message: `Zadanie ID:${task_id} oraz wszystkie powiązane dane zostały usunięte.` 
        });

    } catch (error) {
        console.error("DELETE TASK ERROR:", error);
        return NextResponse.json(
            { error: "Błąd serwera podczas usuwania zadania: " + error.message }, 
            { status: 500 }
        );
    }
}