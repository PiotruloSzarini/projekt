import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/session";
import { placeTaskInGroup } from "@/app/lib/taskOrdering";
import { logAdminAction } from "@/app/lib/audit";

export async function POST(request) {
    const { session, response } = await requireAdmin(request);
    if (response) return response;

    const connection = await pool.getConnection();
    try {
        const body = await request.json();
        
        const { 
            task_group_id, 
            task_type_id, 
            question, 
            math_img,
            math_content,
            difficulty, 
            points,
            sort_order,
            details,      
            hints,        
            explanation   
        } = body;

        await connection.beginTransaction();

        let finalGroupId = null;
        if (task_group_id) {
            const [groupCheck] = await connection.execute(
                "SELECT task_group_id FROM task_groups WHERE task_group_id = ?",
                [task_group_id]
            );
            if (groupCheck.length > 0) {
                finalGroupId = task_group_id;
            } else {
                console.warn(`Próba dodania do nieistniejącej grupy ${task_group_id}. Ustawiam NULL.`);
                finalGroupId = null;
            }
        }

        // 1. INSERT DO GŁÓWNEJ TABELI: tasks
        // Używamy "task_group_id || null", aby upewnić się, że puste wartości trafią jako NULL do bazy
        const [taskResult] = await connection.execute(
            `INSERT INTO tasks (task_group_id, task_type_id, question, math_img, math_content, difficulty, points) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [finalGroupId, parseInt(task_type_id), question, math_img || null, math_content || null, difficulty || 1, points || 0]
        );
        const taskId = taskResult.insertId;
        await placeTaskInGroup(connection, taskId, finalGroupId, sort_order);

        // 2. OBSŁUGA TYPÓW ZADAŃ (Tutaj kod zostaje bez zmian, bo bazuje na taskId)
        
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
            const [pairResult] = await connection.execute(`INSERT INTO task_matching_pairs (task_id) VALUES (?)`, [taskId]);
            const pairId = pairResult.insertId;

            for (const item of details.pairs) {
                await connection.execute(
                    `INSERT INTO task_matching_pairs_items (task_pair_id, left_text, left_photo_url, right_text, right_photo_url, sort_order) 
                    VALUES (?, ?, ?, ?, ?, ?)`,
                    [pairId, item.left_text || null, item.left_photo_url || null, item.right_text || null, item.right_photo_url || null, item.sort_order]
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

        // 3. PODPOWIEDZI
        if (hints && Array.isArray(hints)) {
            for (const hint of hints) {
                if (hint.content && hint.content.trim() !== "") {
                    await connection.execute(
                        `INSERT INTO task_hints (task_id, content, sort_order) VALUES (?, ?, ?)`,
                        [taskId, hint.content, hint.sort_order]
                    );
                }
            }
        }

        // 4. WYJAŚNIENIA
        if (explanation && explanation.steps && explanation.steps.length > 0) {
            const [explResult] = await connection.execute(
                `INSERT INTO task_explanation (task_id) VALUES (?)`,
                [taskId]
            );
            const explanationId = explResult.insertId;

            for (const step of explanation.steps) {
                if (step.content && step.content.trim() !== "") {
                    await connection.execute(
                        `INSERT INTO task_explanation_steps (explanation_id, content, sort_order) 
                        VALUES (?, ?, ?)`,
                        [explanationId, step.content, step.sort_order]
                    );
                }
            }
        }

        await connection.commit();

        logAdminAction(request, session.userId, 'task.create', {
            entityType: 'task',
            entityId: taskId,
            metadata: { task_type_id, task_group_id: task_group_id || null },
        });

        return NextResponse.json({
            success: true,
            message: task_group_id ? "Dodano zadanie do lekcji" : "Dodano zadanie do bazy ogólnej",
            taskId: taskId
        }, { status: 201 });

    } catch (error) {
        await connection.rollback();
        console.error("CREATE TASK ERROR:", error);
        console.error(error);
        return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
    } finally {
        connection.release();
    }
}
