import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

async function ensureTaskSortOrderColumn(connection) {
    const [columns] = await connection.query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'tasks'
          AND COLUMN_NAME = 'sort_order'
        LIMIT 1
    `);

    if (columns.length === 0) {
        await connection.query(`ALTER TABLE tasks ADD COLUMN sort_order INT NULL`);
    }
}

async function normalizeTaskGroup(connection, groupId) {
    if (!groupId) return;

    const [rows] = await connection.query(
        `SELECT task_id
         FROM tasks
         WHERE task_group_id = ?
         ORDER BY COALESCE(sort_order, 999999), task_id ASC`,
        [groupId]
    );

    for (let index = 0; index < rows.length; index += 1) {
        await connection.query(
            `UPDATE tasks SET sort_order = ? WHERE task_id = ?`,
            [index + 1, rows[index].task_id]
        );
    }
}

async function placeTaskInGroup(connection, taskId, groupId, sortOrder) {
    if (!groupId) {
        await connection.query(
            `UPDATE tasks SET task_group_id = NULL, sort_order = NULL WHERE task_id = ?`,
            [taskId]
        );
        return;
    }

    const [groupTasks] = await connection.query(
        `SELECT task_id
         FROM tasks
         WHERE task_group_id = ? AND task_id <> ?
         ORDER BY COALESCE(sort_order, 999999), task_id ASC`,
        [groupId, taskId]
    );

    const maxPosition = groupTasks.length + 1;
    const desiredPosition = Math.min(
        Math.max(parseInt(sortOrder, 10) || maxPosition, 1),
        maxPosition
    );
    const orderedIds = groupTasks.map((task) => task.task_id);
    orderedIds.splice(desiredPosition - 1, 0, taskId);

    for (let index = 0; index < orderedIds.length; index += 1) {
        await connection.query(
            `UPDATE tasks SET task_group_id = ?, sort_order = ? WHERE task_id = ?`,
            [groupId, index + 1, orderedIds[index]]
        );
    }
}

export async function PUT(request) {
    const connection = await pool.getConnection();
    try {
        const body = await request.json();
        const { 
            task_id, 
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

        if (!task_id) return NextResponse.json({ error: "Brak ID zadania" }, { status: 400 });

        await connection.beginTransaction();
        await ensureTaskSortOrderColumn(connection);

        const [currentTaskRows] = await connection.query(
            `SELECT task_group_id FROM tasks WHERE task_id = ? FOR UPDATE`,
            [task_id]
        );
        const oldGroupId = currentTaskRows[0]?.task_group_id;

        // 1. UPDATE GŁÓWNEGO ZADANIA
        await connection.execute(
            `UPDATE tasks SET question = ?, math_img = ?, math_content = ?, difficulty = ?, points = ? WHERE task_id = ?`,
            [question, math_img || null, math_content || null, difficulty, points, task_id]
        );

        const nextGroupId = task_group_id ? parseInt(task_group_id, 10) : null;
        if (nextGroupId) {
            const [groupRows] = await connection.query(
                `SELECT task_group_id FROM task_groups WHERE task_group_id = ?`,
                [nextGroupId]
            );
            if (groupRows.length === 0) {
                await connection.rollback();
                return NextResponse.json({ error: "Nie znaleziono grupy zadan" }, { status: 404 });
            }
        }

        await normalizeTaskGroup(connection, oldGroupId);
        await placeTaskInGroup(connection, task_id, nextGroupId, sort_order);
        if (oldGroupId && Number(oldGroupId) !== Number(nextGroupId)) {
            await normalizeTaskGroup(connection, oldGroupId);
        }

        // 2. SZCZEGÓŁY TYPU (Logika Sync dla list)
        
        // --- TYP 1: MULTIPLE CHOICE ---
        if (parseInt(task_type_id) === 1) {
            await connection.execute(
                `UPDATE task_multiple_choice SET explanation = ? WHERE task_id = ?`,
                [details.general_explanation || null, task_id]
            );
            
            const [mcRows] = await connection.execute(`SELECT task_multiple_id FROM task_multiple_choice WHERE task_id = ?`, [task_id]);
            const mcId = mcRows[0].task_multiple_id;

            // Sync Odpowiedzi
            const incomingAnswerIds = details.answers.filter(a => a.answer_id).map(a => a.answer_id);
            if (incomingAnswerIds.length > 0) {
                await connection.query(`DELETE FROM task_multiple_choice_answers WHERE task_multiple_id = ? AND answer_id NOT IN (?)`, [mcId, incomingAnswerIds]);
            } else {
                await connection.execute(`DELETE FROM task_multiple_choice_answers WHERE task_multiple_id = ?`, [mcId]);
            }

            for (const ans of details.answers) {
                if (ans.answer_id) {
                    await connection.execute(
                        `UPDATE task_multiple_choice_answers SET answer_text = ?, is_correct = ?, sort_order = ? WHERE answer_id = ?`,
                        [ans.answer_text, ans.is_correct ? 1 : 0, ans.sort_order, ans.answer_id]
                    );
                } else {
                    await connection.execute(
                        `INSERT INTO task_multiple_choice_answers (task_multiple_id, answer_text, is_correct, sort_order) VALUES (?, ?, ?, ?)`,
                        [mcId, ans.answer_text, ans.is_correct ? 1 : 0, ans.sort_order]
                    );
                }
            }
        }

        // --- TYP 2: SINGLE INPUT ---
        else if (parseInt(task_type_id) === 2) {
            await connection.execute(
                `UPDATE task_single_input SET correct_value = ?, answer_type = ?, tolerance = ? WHERE task_id = ?`,
                [details.correct_value, details.answer_type, details.tolerance || 0, task_id]
            );
        }

        // --- TYP 3: MATCHING PAIRS ---
        else if (parseInt(task_type_id) === 3) {
            const [pairRows] = await connection.execute(`SELECT task_pair_id FROM task_matching_pairs WHERE task_id = ?`, [task_id]);
            const pairId = pairRows[0].task_pair_id;

            const incomingPairIds = details.pairs.filter(p => p.pair_item_id).map(p => p.pair_item_id);
            if (incomingPairIds.length > 0) {
                await connection.query(`DELETE FROM task_matching_pairs_items WHERE task_pair_id = ? AND pair_item_id NOT IN (?)`, [pairId, incomingPairIds]);
            } else {
                await connection.execute(`DELETE FROM task_matching_pairs_items WHERE task_pair_id = ?`, [pairId]);
            }

            for (const p of details.pairs) {
                if (p.pair_item_id) {
                    await connection.execute(
                        `UPDATE task_matching_pairs_items 
                        SET left_text = ?, left_photo_url = ?, right_text = ?, right_photo_url = ?, sort_order = ? 
                        WHERE pair_item_id = ?`,
                        [p.left_text || null, p.left_photo_url || null, p.right_text || null, p.right_photo_url || null, p.sort_order, p.pair_item_id]
                    );
                } else {
                    await connection.execute(
                        `INSERT INTO task_matching_pairs_items (task_pair_id, left_text, left_photo_url, right_text, right_photo_url, sort_order) 
                        VALUES (?, ?, ?, ?, ?, ?)`,
                        [pairId, p.left_text || null, p.left_photo_url || null, p.right_text || null, p.right_photo_url || null, p.sort_order]
                    );
                }
            }
        }

        // --- TYP 4: STEP BY STEP ---
        else if (parseInt(task_type_id) === 4) {
            await connection.execute(
                `UPDATE task_step_by_step SET instruction = ? WHERE task_id = ?`,
                [details.instruction || null, task_id]
            );

            const [sbsRows] = await connection.execute(
                `SELECT task_step_by_step_id FROM task_step_by_step WHERE task_id = ?`,
                [task_id]
            );
            const sbsId = sbsRows[0]?.task_step_by_step_id;

            if (!sbsId) {
                throw new Error('Nie znaleziono konfiguracji step by step dla tego zadania');
            }

            const incomingStepIds = details.steps.filter(step => step.step_id).map(step => step.step_id);
            if (incomingStepIds.length > 0) {
                await connection.query(
                    `DELETE FROM task_step_by_step_steps WHERE task_step_by_step_id = ? AND step_id NOT IN (?)`,
                    [sbsId, incomingStepIds]
                );
            } else {
                await connection.execute(
                    `DELETE FROM task_step_by_step_steps WHERE task_step_by_step_id = ?`,
                    [sbsId]
                );
            }

            for (const step of details.steps) {
                if (step.step_id) {
                    await connection.execute(
                        `UPDATE task_step_by_step_steps
                         SET step_instruction = ?, step_answer = ?, answer_type = ?, tolerance = ?, sort_order = ?
                         WHERE step_id = ?`,
                        [
                            step.step_instruction,
                            step.step_answer,
                            step.answer_type,
                            step.tolerance || 0,
                            step.sort_order,
                            step.step_id
                        ]
                    );
                } else {
                    await connection.execute(
                        `INSERT INTO task_step_by_step_steps
                         (task_step_by_step_id, step_instruction, step_answer, answer_type, tolerance, sort_order)
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [
                            sbsId,
                            step.step_instruction,
                            step.step_answer,
                            step.answer_type,
                            step.tolerance || 0,
                            step.sort_order
                        ]
                    );
                }
            }
        }

        // 3. SYNCHRONIZACJA HINTÓW
        const incomingHintIds = hints.filter(h => h.hint_id).map(h => h.hint_id);
        if (incomingHintIds.length > 0) {
            await connection.query(`DELETE FROM task_hints WHERE task_id = ? AND hint_id NOT IN (?)`, [task_id, incomingHintIds]);
        } else {
            await connection.execute(`DELETE FROM task_hints WHERE task_id = ?`, [task_id]);
        }

        for (const h of hints) {
            if (h.hint_id) {
                await connection.execute(
                    `UPDATE task_hints SET content = ?, sort_order = ? WHERE hint_id = ?`,
                    [h.content, h.sort_order, h.hint_id]
                );
            } else {
                await connection.execute(
                    `INSERT INTO task_hints (task_id, content, sort_order) VALUES (?, ?, ?)`,
                    [task_id, h.content, h.sort_order]
                );
            }
        }

        // 4. SYNCHRONIZACJA WYJAŚNIENIA (Explanation Steps)
        // Najpierw sprawdźmy czy task_explanation w ogóle istnieje dla tego taska
        let [explRows] = await connection.execute(`SELECT explanation_id FROM task_explanation WHERE task_id = ?`, [task_id]);
        let explanationId;

        if (explRows.length === 0) {
            const [insExpl] = await connection.execute(`INSERT INTO task_explanation (task_id) VALUES (?)`, [task_id]);
            explanationId = insExpl.insertId;
        } else {
            explanationId = explRows[0].explanation_id;
        }

        const incomingExplStepIds = explanation.steps.filter(s => s.explanation_step_id).map(s => s.explanation_step_id);
        if (incomingExplStepIds.length > 0) {
            await connection.query(`DELETE FROM task_explanation_steps WHERE explanation_id = ? AND explanation_step_id NOT IN (?)`, [explanationId, incomingExplStepIds]);
        } else {
            await connection.execute(`DELETE FROM task_explanation_steps WHERE explanation_id = ?`, [explanationId]);
        }

        for (const step of explanation.steps) {
            if (step.explanation_step_id) {
                await connection.execute(
                    `UPDATE task_explanation_steps SET content = ?, sort_order = ? WHERE explanation_step_id = ?`,
                    [step.content, step.sort_order, step.explanation_step_id]
                );
            } else {
                await connection.execute(
                    `INSERT INTO task_explanation_steps (explanation_id, content, sort_order) VALUES (?, ?, ?)`,
                    [explanationId, step.content, step.sort_order]
                );
            }
        }

        await connection.commit();
        return NextResponse.json({ success: true, message: "Zadanie zaktualizowane pomyślnie" });

    } catch (error) {
        await connection.rollback();
        console.error("UPDATE TASK ERROR:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        connection.release();
    }
}
