import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function POST(request) {
    const connection = await pool.getConnection();
    try {
        const body = await request.json();
        
        // Destrukturyzacja wszystkiego co wysyłamy z frontu
        const { 
            task_group_id, 
            task_type_id, 
            question, 
            difficulty, 
            points,
            details,      // Dane specyficzne dla typu (odpowiedzi, pary itp.)
            hints,        // Tablica: [{ content: '...', sort_order: 0 }]
            explanation   // Obiekt: { steps: [{ content: '...', sort_order: 0 }] }
        } = body;

        await connection.beginTransaction();

        // 1. INSERT DO GŁÓWNEJ TABELI: tasks
        const [taskResult] = await connection.execute(
            `INSERT INTO tasks (task_group_id, task_type_id, question, difficulty, points) 
            VALUES (?, ?, ?, ?, ?)`,
            [task_group_id, task_type_id, question, difficulty || 1, points || 0]
        );
        const taskId = taskResult.insertId;

        // 2. OBSŁUGA TYPÓW ZADAŃ (zależnie od task_type_id)
        
        // --- TYP 1: MULTIPLE CHOICE ---
        if (parseInt(task_type_id) === 1) {
            const [mcResult] = await connection.execute(
                `INSERT INTO task_multiple_choice (task_id, explanation) VALUES (?, ?)`,
                [taskId, details.general_explanation || null]
            );
            const mcId = mcResult.insertId;

            for (const ans of details.answers) {
                await connection.execute(
                    `INSERT INTO task_multiple_choice_answers (task_multiple_id, answer_text, is_correct, sort_order) 
                    VALUES (?, ?, ?, ?)`,
                    [mcId, ans.answer_text, ans.is_correct ? 1 : 0, ans.sort_order]
                );
            }
        }

        // --- TYP 2: SINGLE INPUT ---
        else if (parseInt(task_type_id) === 2) {
            await connection.execute(
                `INSERT INTO task_single_input (task_id, correct_value, answer_type, tolerance) 
                VALUES (?, ?, ?, ?)`,
                [taskId, details.correct_value, details.answer_type, details.tolerance || 0]
            );
        }

        // --- TYP 3: MATCHING PAIRS ---
        else if (parseInt(task_type_id) === 3) {
            const [pairResult] = await connection.execute(
                `INSERT INTO task_matching_pairs (task_id) VALUES (?)`,
                [taskId]
            );
            const pairId = pairResult.insertId;

            for (const item of details.pairs) {
                await connection.execute(
                    `INSERT INTO task_matching_pairs_items (task_pair_id, left_text, right_text, sort_order) 
                    VALUES (?, ?, ?, ?)`,
                    [pairId, item.left_text, item.right_text, item.sort_order]
                );
            }
        }

        // --- TYP 4: STEP BY STEP ---
        else if (parseInt(task_type_id) === 4) {
            const [sbsResult] = await connection.execute(
                `INSERT INTO task_step_by_step (task_id, instruction) VALUES (?, ?)`,
                [taskId, details.instruction || null]
            );
            const sbsId = sbsResult.insertId;

            for (const step of details.steps) {
                await connection.execute(
                    `INSERT INTO task_step_by_step_steps 
                    (task_step_by_step_id, step_instruction, step_answer, answer_type, tolerance, sort_order) 
                    VALUES (?, ?, ?, ?, ?, ?)`,
                    [sbsId, step.step_instruction, step.step_answer, step.answer_type, step.tolerance || 0, step.sort_order]
                );
            }
        }

        // 3. INSERT PODPOWIEDZI: task_hints
        if (hints && Array.isArray(hints)) {
            for (const hint of hints) {
                if (hint.content.trim() !== "") {
                    await connection.execute(
                        `INSERT INTO task_hints (task_id, content, sort_order) VALUES (?, ?, ?)`,
                        [taskId, hint.content, hint.sort_order]
                    );
                }
            }
        }

        // 4. INSERT WYJAŚNIENIA: task_explanation + task_explanation_steps
        if (explanation && explanation.steps && explanation.steps.length > 0) {
            const [explResult] = await connection.execute(
                `INSERT INTO task_explanation (task_id) VALUES (?)`,
                [taskId]
            );
            const explanationId = explResult.insertId;

            for (const step of explanation.steps) {
                if (step.content.trim() !== "") {
                    await connection.execute(
                        `INSERT INTO task_explanation_steps (explanation_id, content, sort_order) 
                        VALUES (?, ?, ?)`,
                        [explanationId, step.content, step.sort_order]
                    );
                }
            }
        }

        // Jeśli wszystko przeszło - COMMIT
        await connection.commit();
        
        return NextResponse.json({ 
            success: true, 
            message: "Zadanie utworzone pomyślnie", 
            taskId: taskId 
        }, { status: 201 });

    } catch (error) {
        // W razie jakiegokolwiek błędu - COFAMY wszystko
        await connection.rollback();
        console.error("CREATE TASK ERROR:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        connection.release();
    }
}