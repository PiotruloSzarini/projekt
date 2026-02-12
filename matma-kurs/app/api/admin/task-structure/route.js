import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function GET() {
    try {
        // 1. Pobieramy podstawowe dane o wszystkich zadaniach
        const [tasks] = await pool.query(`
            SELECT t.*, tt.code as task_type_code 
            FROM tasks t
            JOIN task_types tt ON t.task_type_id = tt.task_type_id
            ORDER BY t.created_at DESC
        `);

        if (tasks.length === 0) return NextResponse.json([]);

        const taskIds = tasks.map(t => t.task_id);

        // 2. Pobieramy wszystkie dane szczegółowe dla wszystkich zadań (rownolegle)
        const [
            mcData, mcAnswers,
            siData,
            mpData, mpItems,
            sbsData, sbsSteps,
            hints,
            explData, explSteps
        ] = await Promise.all([
            pool.query(`SELECT * FROM task_multiple_choice WHERE task_id IN (?)`, [taskIds]),
            pool.query(`SELECT * FROM task_multiple_choice_answers WHERE task_multiple_id IN (SELECT task_multiple_id FROM task_multiple_choice WHERE task_id IN (?)) ORDER BY sort_order`, [taskIds]),
            pool.query(`SELECT * FROM task_single_input WHERE task_id IN (?)`, [taskIds]),
            pool.query(`SELECT * FROM task_matching_pairs WHERE task_id IN (?)`, [taskIds]),
            pool.query(`SELECT * FROM task_matching_pairs_items WHERE task_pair_id IN (SELECT task_pair_id FROM task_matching_pairs WHERE task_id IN (?)) ORDER BY sort_order`, [taskIds]),
            pool.query(`SELECT * FROM task_step_by_step WHERE task_id IN (?)`, [taskIds]),
            pool.query(`SELECT * FROM task_step_by_step_steps WHERE task_step_by_step_id IN (SELECT task_step_by_step_id FROM task_step_by_step WHERE task_id IN (?)) ORDER BY sort_order`, [taskIds]),
            pool.query(`SELECT * FROM task_hints WHERE task_id IN (?) ORDER BY sort_order`, [taskIds]),
            pool.query(`SELECT * FROM task_explanation WHERE task_id IN (?)`, [taskIds]),
            pool.query(`SELECT * FROM task_explanation_steps WHERE explanation_id IN (SELECT explanation_id FROM task_explanation WHERE task_id IN (?)) ORDER BY sort_order`, [taskIds])
        ]);

        // 3. Mapowanie danych w strukturę obiektową
        const fullTasks = tasks.map(task => {
            const id = task.task_id;

            return {
                ...task,
                // PODPOWIEDZI
                hints: hints[0].filter(h => h.task_id === id),
                
                // WYJAŚNIENIE
                explanation: {
                    main: explData[0].find(e => e.task_id === id) || null,
                    steps: explSteps[0].filter(s => explData[0].find(e => e.task_id === id)?.explanation_id === s.explanation_id)
                },

                // SZCZEGÓŁY TYPU ZADANIA
                data: {
                    // Wielokrotny wybór
                    multiple_choice: mcData[0].filter(m => m.task_id === id).map(m => ({
                        ...m,
                        answers: mcAnswers[0].filter(a => a.task_multiple_id === m.task_multiple_id)
                    }))[0] || null,

                    // Pojedyncze pole wpisywania
                    single_input: siData[0].find(s => s.task_id === id) || null,

                    // Łączenie par
                    matching_pairs: mpData[0].filter(m => m.task_id === id).map(m => ({
                        ...m,
                        items: mpItems[0].filter(i => i.task_pair_id === m.task_pair_id)
                    }))[0] || null,

                    // Krok po kroku
                    step_by_step: sbsData[0].filter(s => s.task_id === id).map(s => ({
                        ...s,
                        steps: sbsSteps[0].filter(st => st.task_step_by_step_id === s.task_step_by_step_id)
                    }))[0] || null
                }
            };
        });

        return NextResponse.json(fullTasks);
    } catch (error) {
        console.error("DATABASE ERROR:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}