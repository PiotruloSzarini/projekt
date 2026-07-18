import { NextResponse } from 'next/server';
import db from '@/app/lib/db';
import { getSessionUserId } from '@/app/lib/session';
import { getWarsawDateString } from '@/app/lib/services/mathdle';

export async function GET(request) {
    let connection;

    try {
        const today = getWarsawDateString();
        const userId = getSessionUserId(request);

        connection = await db.getConnection();

        const [taskRows] = await connection.query(
            `
            SELECT
                a.assignment_id,
                t.task_id,
                t.question,
                t.math_content,
                t.math_img,
                t.points,
                t.task_type_id,
                tt.code as task_type_code,
                a.difficulty,
                a.special_event
            FROM daily_assignments a
            JOIN tasks t ON a.task_id = t.task_id
            JOIN task_types tt ON t.task_type_id = tt.task_type_id
            WHERE a.assignment_date = ?
            ORDER BY a.difficulty ASC, a.assignment_id ASC
            `,
            [today]
        );

        const taskIds = taskRows.map((task) => task.task_id);
        const taskTypeById = new Map(taskRows.map((task) => [task.task_id, task.task_type_code]));

        const [
            mcData,
            mcAnswers,
            siData,
            mpData,
            mpItems,
            sbsData,
            sbsSteps,
            hintRows,
        ] = taskIds.length > 0
            ? await Promise.all([
                connection.query(`SELECT * FROM task_multiple_choice WHERE task_id IN (?)`, [taskIds]),
                connection.query(
                    `SELECT * FROM task_multiple_choice_answers WHERE task_multiple_id IN (
                        SELECT task_multiple_id FROM task_multiple_choice WHERE task_id IN (?)
                    ) ORDER BY sort_order`,
                    [taskIds]
                ),
                connection.query(`SELECT * FROM task_single_input WHERE task_id IN (?)`, [taskIds]),
                connection.query(`SELECT * FROM task_matching_pairs WHERE task_id IN (?)`, [taskIds]),
                connection.query(
                    `SELECT * FROM task_matching_pairs_items WHERE task_pair_id IN (
                        SELECT task_pair_id FROM task_matching_pairs WHERE task_id IN (?)
                    ) ORDER BY sort_order`,
                    [taskIds]
                ),
                connection.query(`SELECT * FROM task_step_by_step WHERE task_id IN (?)`, [taskIds]),
                connection.query(
                    `SELECT * FROM task_step_by_step_steps WHERE task_step_by_step_id IN (
                        SELECT task_step_by_step_id FROM task_step_by_step WHERE task_id IN (?)
                    ) ORDER BY sort_order`,
                    [taskIds]
                ),
                connection.query(
                    `SELECT hint_id, task_id, content, sort_order
                     FROM task_hints
                     WHERE task_id IN (?)
                     ORDER BY task_id ASC, sort_order ASC, hint_id ASC`,
                    [taskIds]
                ),
            ])
            : [[[]], [[]], [[]], [[]], [[]], [[]], [[]], [[]]];

        const mcRows = mcData[0] || [];
        const mcAnswerRows = mcAnswers[0] || [];
        const siRows = siData[0] || [];
        const mpRows = mpData[0] || [];
        const mpItemRows = mpItems[0] || [];
        const sbsRows = sbsData[0] || [];
        const sbsStepRows = sbsSteps[0] || [];
        const hintRowsData = hintRows[0] || [];

        let completedTaskIds = [];
        if (userId && taskIds.length > 0) {
            const [completionRows] = await connection.query(
                `
                SELECT task_id
                FROM daily_challenge_completions
                WHERE user_id = ? AND assignment_date = ? AND task_id IN (?)
                ORDER BY created_at ASC
                `,
                [userId, today, taskIds]
            );

            completedTaskIds = completionRows.map((row) => row.task_id);
        }

        const hintsByTaskId = hintRowsData.reduce((acc, hint) => {
            if (!acc[hint.task_id]) acc[hint.task_id] = [];
            acc[hint.task_id].push(hint);
            return acc;
        }, {});

        const tasks = taskRows.map((task) => ({
            ...task,
            hints: hintsByTaskId[task.task_id] || [],
            details: {
                multiple_choice: mcRows.find((row) => row.task_id === task.task_id)
                    ? {
                        ...mcRows.find((row) => row.task_id === task.task_id),
                        answers: mcAnswerRows.filter((row) => {
                            const parent = mcRows.find((item) => item.task_id === task.task_id);
                            return parent && row.task_multiple_id === parent.task_multiple_id;
                        }),
                    }
                    : null,
                single_input: siRows.find((row) => row.task_id === task.task_id) || null,
                matching_pairs: mpRows.find((row) => row.task_id === task.task_id)
                    ? {
                        ...mpRows.find((row) => row.task_id === task.task_id),
                        items: mpItemRows.filter((row) => {
                            const parent = mpRows.find((item) => item.task_id === task.task_id);
                            return parent && row.task_pair_id === parent.task_pair_id;
                        }),
                    }
                    : null,
                step_by_step: sbsRows.find((row) => row.task_id === task.task_id)
                    ? {
                        ...sbsRows.find((row) => row.task_id === task.task_id),
                        steps: sbsStepRows.filter((row) => {
                            const parent = sbsRows.find((item) => item.task_id === task.task_id);
                            return parent && row.task_step_by_step_id === parent.task_step_by_step_id;
                        }),
                    }
                    : null,
            },
            isCompleted: completedTaskIds.includes(task.task_id),
            task_type_code: taskTypeById.get(task.task_id) || task.task_type_code,
        }));

        return NextResponse.json({
            tasks,
            completedTaskIds,
            completedCount: completedTaskIds.length,
            totalCount: tasks.length,
        });
    } catch (error) {
        console.error('Błąd pobierania zadań na dziś:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}
