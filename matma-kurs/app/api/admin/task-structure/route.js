import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/session";

const DEFAULT_LIMIT = 500;
const MAX_LIMIT = 1000;

function groupBy(rows, key) {
    return rows.reduce((acc, row) => {
        const k = row[key];
        if (!acc.has(k)) acc.set(k, []);
        acc.get(k).push(row);
        return acc;
    }, new Map());
}

function indexBy(rows, key) {
    return rows.reduce((acc, row) => acc.set(row[key], row), new Map());
}

export async function GET(request) {
    const { response } = await requireAdmin(request);
    if (response) return response;

    try {
        const { searchParams } = new URL(request.url);
        const limitParam = parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10);
        const limit = Math.min(Math.max(limitParam || DEFAULT_LIMIT, 1), MAX_LIMIT);
        const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10) || 0, 0);

        const [[countRow]] = await pool.query('SELECT COUNT(*) AS total FROM tasks');
        const totalCount = Number(countRow.total || 0);

        const [tasks] = await pool.query(
            `SELECT t.*, tt.code as task_type_code
             FROM tasks t
             JOIN task_types tt ON t.task_type_id = tt.task_type_id
             ORDER BY COALESCE(t.sort_order, 999999), t.created_at DESC
             LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        if (tasks.length === 0) {
            return NextResponse.json({ tasks: [], totalCount, limit, offset });
        }

        const taskIds = tasks.map(t => t.task_id);

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

        // Indexujemy raz — potem O(1) lookup zamiast .find/.filter w pętli
        const mcByTaskId = indexBy(mcData[0], 'task_id');
        const mcAnswersByMultipleId = groupBy(mcAnswers[0], 'task_multiple_id');
        const siByTaskId = indexBy(siData[0], 'task_id');
        const mpByTaskId = indexBy(mpData[0], 'task_id');
        const mpItemsByPairId = groupBy(mpItems[0], 'task_pair_id');
        const sbsByTaskId = indexBy(sbsData[0], 'task_id');
        const sbsStepsByParentId = groupBy(sbsSteps[0], 'task_step_by_step_id');
        const hintsByTaskId = groupBy(hints[0], 'task_id');
        const explByTaskId = indexBy(explData[0], 'task_id');
        const explStepsByParentId = groupBy(explSteps[0], 'explanation_id');

        const fullTasks = tasks.map(task => {
            const id = task.task_id;
            const mc = mcByTaskId.get(id);
            const mp = mpByTaskId.get(id);
            const sbs = sbsByTaskId.get(id);
            const expl = explByTaskId.get(id);

            return {
                ...task,
                hints: hintsByTaskId.get(id) || [],
                explanation: {
                    main: expl || null,
                    steps: expl ? (explStepsByParentId.get(expl.explanation_id) || []) : [],
                },
                data: {
                    multiple_choice: mc
                        ? { ...mc, answers: mcAnswersByMultipleId.get(mc.task_multiple_id) || [] }
                        : null,
                    single_input: siByTaskId.get(id) || null,
                    matching_pairs: mp
                        ? { ...mp, items: mpItemsByPairId.get(mp.task_pair_id) || [] }
                        : null,
                    step_by_step: sbs
                        ? { ...sbs, steps: sbsStepsByParentId.get(sbs.task_step_by_step_id) || [] }
                        : null,
                },
            };
        });

        return NextResponse.json({ tasks: fullTasks, totalCount, limit, offset });
    } catch (error) {
        console.error("DATABASE ERROR:", error);
        return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
    }
}
