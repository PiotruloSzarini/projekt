import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function PUT(request) {
    const connection = await pool.getConnection();
    try {
        const body = await request.json();
        const { 
            task_id, 
            task_type_id, // Potrzebne, żeby wiedzieć, które tabele procesować
            question, 
            difficulty, 
            points,
            details,      // Answers, pairs, itp.
            hints,        // Tablica hintów
            explanation   // Obiekt z tablicą steps
        } = body;

        if (!task_id) return NextResponse.json({ error: "Brak ID zadania" }, { status: 400 });

        await connection.beginTransaction();

        // 1. UPDATE GŁÓWNEGO ZADANIA
        await connection.execute(
            `UPDATE tasks SET question = ?, difficulty = ?, points = ? WHERE task_id = ?`,
            [question, difficulty, points, task_id]
        );

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
                        `UPDATE task_matching_pairs_items SET left_text = ?, right_text = ?, sort_order = ? WHERE pair_item_id = ?`,
                        [p.left_text, p.right_text, p.sort_order, p.pair_item_id]
                    );
                } else {
                    await connection.execute(
                        `INSERT INTO task_matching_pairs_items (task_pair_id, left_text, right_text, sort_order) VALUES (?, ?, ?, ?)`,
                        [pairId, p.left_text, p.right_text, p.sort_order]
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