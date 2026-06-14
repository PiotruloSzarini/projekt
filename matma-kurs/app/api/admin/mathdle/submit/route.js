import { NextResponse } from 'next/server';
import db from '@/app/lib/db';

function getSessionUserId(request) {
    return request.cookies.get('session_user_id')?.value || null;
}

function getWarsawDateString(date = new Date()) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Warsaw',
    }).format(date);
}

function normalizeAnswer(value) {
    return String(value ?? '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/,/g, '.')
        .replace(/[â’â€“â€”]/g, '-')
        .normalize('NFKC');
}

function isSameAnswer(expected, actual) {
    return normalizeAnswer(expected) === normalizeAnswer(actual);
}

async function ensureDailyCompletionTable(connection) {
    await connection.query(`
        CREATE TABLE IF NOT EXISTS daily_challenge_completions (
            completion_id INT NOT NULL AUTO_INCREMENT,
            user_id INT NOT NULL,
            assignment_date DATE NOT NULL,
            task_id INT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (completion_id),
            UNIQUE KEY uniq_daily_completion (user_id, assignment_date, task_id),
            KEY idx_daily_completion_user_date (user_id, assignment_date),
            CONSTRAINT fk_daily_completion_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
            CONSTRAINT fk_daily_completion_task FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
        )
    `);
}

async function loadTaskBundle(connection, taskId) {
    const [taskRows] = await connection.query(
        `
        SELECT t.task_id, t.task_type_id, tt.code AS task_type_code, t.points
        FROM tasks t
        JOIN task_types tt ON tt.task_type_id = t.task_type_id
        WHERE t.task_id = ?
        LIMIT 1
        `,
        [taskId]
    );

    if (!taskRows.length) return null;

    const task = taskRows[0];
    const typeCode = String(task.task_type_code || '').trim().toUpperCase();

    if (typeCode === 'SINGLE_INPUT') {
        const [rows] = await connection.query(
            'SELECT task_id, correct_value, answer_type, tolerance FROM task_single_input WHERE task_id = ? LIMIT 1',
            [taskId]
        );
        return { ...task, details: { single_input: rows[0] || null } };
    }

    if (typeCode === 'MULTIPLE_CHOICE') {
        const [mcRows] = await connection.query(
            'SELECT task_multiple_id, task_id, explanation FROM task_multiple_choice WHERE task_id = ? LIMIT 1',
            [taskId]
        );

        if (!mcRows.length) return { ...task, details: { multiple_choice: null } };

        const [answers] = await connection.query(
            'SELECT * FROM task_multiple_choice_answers WHERE task_multiple_id = ? ORDER BY sort_order ASC, answer_id ASC',
            [mcRows[0].task_multiple_id]
        );

        return {
            ...task,
            details: {
                multiple_choice: {
                    ...mcRows[0],
                    answers,
                },
            },
        };
    }

    if (typeCode === 'MATCHING') {
        const [pairRows] = await connection.query(
            'SELECT task_pair_id, task_id FROM task_matching_pairs WHERE task_id = ? LIMIT 1',
            [taskId]
        );

        if (!pairRows.length) return { ...task, details: { matching_pairs: null } };

        const [items] = await connection.query(
            'SELECT * FROM task_matching_pairs_items WHERE task_pair_id = ? ORDER BY sort_order ASC, pair_item_id ASC',
            [pairRows[0].task_pair_id]
        );

        return {
            ...task,
            details: {
                matching_pairs: {
                    ...pairRows[0],
                    items,
                },
            },
        };
    }

    if (typeCode === 'STEP_BY_STEP') {
        const [stepRows] = await connection.query(
            'SELECT task_step_by_step_id, task_id, instruction FROM task_step_by_step WHERE task_id = ? LIMIT 1',
            [taskId]
        );

        if (!stepRows.length) return { ...task, details: { step_by_step: null } };

        const [steps] = await connection.query(
            'SELECT * FROM task_step_by_step_steps WHERE task_step_by_step_id = ? ORDER BY sort_order ASC, step_id ASC',
            [stepRows[0].task_step_by_step_id]
        );

        return {
            ...task,
            details: {
                step_by_step: {
                    ...stepRows[0],
                    steps,
                },
            },
        };
    }

    return { ...task, details: {} };
}

async function getTaskCompletionIds(connection, userId, date, taskIds) {
    if (!userId || taskIds.length === 0) return [];

    const [rows] = await connection.query(
        `
        SELECT task_id
        FROM daily_challenge_completions
        WHERE user_id = ? AND assignment_date = ? AND task_id IN (?)
        ORDER BY created_at ASC
        `,
        [userId, date, taskIds]
    );

    return rows.map((row) => row.task_id);
}

export async function POST(req) {
    let connection;

    try {
        const sessionUserId = getSessionUserId(req);
        const { taskId, difficulty, userAnswer, stepId } = await req.json();

        if (!sessionUserId) {
            return NextResponse.json({ error: 'Brak aktywnej sesji' }, { status: 401 });
        }

        connection = await db.getConnection();
        await ensureDailyCompletionTable(connection);
        await connection.beginTransaction();

        const today = getWarsawDateString();

        const [alreadyDoneRows] = await connection.query(
            `
            SELECT completion_id
            FROM daily_challenge_completions
            WHERE user_id = ? AND assignment_date = ? AND task_id = ?
            LIMIT 1
            `,
            [sessionUserId, today, taskId]
        );

        if (alreadyDoneRows.length > 0) {
            await connection.rollback();
            return NextResponse.json(
                { isCorrect: false, alreadyCompleted: true, message: 'To zadanie zostało już ukończone dzisiaj.' },
                { status: 409 }
            );
        }

        const task = await loadTaskBundle(connection, taskId);

        if (!task) {
            await connection.rollback();
            return NextResponse.json(
                { isCorrect: false, message: 'Nie znaleziono zadania do sprawdzenia.' },
                { status: 404 }
            );
        }

        const typeCode = String(task.task_type_code || '').trim().toUpperCase();
        const pointsMap = { 1: 1, 2: 3, 3: 5 };
        const pointsToAdd = pointsMap[difficulty] ?? Number(task.points || 0) ?? 0;

        if (typeCode === 'SINGLE_INPUT') {
            const correctValue = task.details?.single_input?.correct_value;
            if (correctValue == null) {
                await connection.rollback();
                return NextResponse.json(
                    { isCorrect: false, message: 'To zadanie nie ma ustawionej poprawnej odpowiedzi.' },
                    { status: 404 }
                );
            }

            if (!isSameAnswer(correctValue, userAnswer)) {
                await connection.rollback();
                return NextResponse.json({
                    isCorrect: false,
                    message: 'Spróbuj jeszcze raz',
                });
            }
        } else if (typeCode === 'MULTIPLE_CHOICE') {
            const answers = task.details?.multiple_choice?.answers || [];
            const correctAnswers = answers.filter((answer) => Number(answer.is_correct) === 1);

            if (correctAnswers.length === 0) {
                await connection.rollback();
                return NextResponse.json(
                    { isCorrect: false, message: 'To zadanie wielokrotnego wyboru nie ma poprawnej odpowiedzi.' },
                    { status: 404 }
                );
            }

            const chosenId = String(userAnswer ?? '').trim();
            const isCorrect = correctAnswers.some((answer) => String(answer.answer_id) === chosenId);

            if (!isCorrect) {
                await connection.rollback();
                return NextResponse.json({
                    isCorrect: false,
                    message: 'Spróbuj jeszcze raz',
                });
            }
        } else if (typeCode === 'MATCHING') {
            const items = task.details?.matching_pairs?.items || [];
            const parsedAnswer = typeof userAnswer === 'string' ? JSON.parse(userAnswer || '{}') : (userAnswer || {});

            const expected = items.reduce((acc, item) => {
                acc[String(item.pair_item_id)] = String(item.pair_item_id);
                return acc;
            }, {});

            const isCorrect = Object.keys(expected).every((key) => String(parsedAnswer[key] ?? '') === expected[key]);

            if (!isCorrect) {
                await connection.rollback();
                return NextResponse.json({
                    isCorrect: false,
                    message: 'Spróbuj jeszcze raz',
                });
            }
        } else if (typeCode === 'STEP_BY_STEP') {
            const steps = task.details?.step_by_step?.steps || [];
            const currentStepId = Number(stepId);
            const currentStepIndex = steps.findIndex((step) => Number(step.step_id) === currentStepId);

            if (currentStepIndex < 0) {
                await connection.rollback();
                return NextResponse.json(
                    { isCorrect: false, message: 'Nie znaleziono kroku do sprawdzenia.' },
                    { status: 404 }
                );
            }

            const currentStep = steps[currentStepIndex];
            const isCorrect = isSameAnswer(currentStep.step_answer, userAnswer);

            if (!isCorrect) {
                await connection.rollback();
                return NextResponse.json({
                    isCorrect: false,
                    message: 'Spróbuj jeszcze raz',
                });
            }

            const isLastStep = currentStepIndex === steps.length - 1;
            if (!isLastStep) {
                await connection.commit();
                return NextResponse.json({
                    isCorrect: true,
                    stepCompleted: true,
                    nextStepId: steps[currentStepIndex + 1].step_id,
                    message: 'Krok zaliczony. Przechodzimy dalej.',
                });
            }
        } else {
            await connection.rollback();
            return NextResponse.json(
                { isCorrect: false, message: 'Ten typ zadania nie jest jeszcze wspierany w daily challenge.' },
                { status: 400 }
            );
        }

        await connection.query(
            `
            INSERT INTO daily_challenge_completions (user_id, assignment_date, task_id)
            VALUES (?, ?, ?)
            `,
            [sessionUserId, today, taskId]
        );

        await connection.query(
            `
            INSERT INTO user_stats (user_id, total_points, daily_completed)
            VALUES (?, ?, 1)
            ON DUPLICATE KEY UPDATE
                total_points = COALESCE(total_points, 0) + VALUES(total_points),
                daily_completed = COALESCE(daily_completed, 0) + 1
            `,
            [sessionUserId, pointsToAdd]
        );

        const [allTasksToday] = await connection.query(
            'SELECT task_id FROM daily_assignments WHERE assignment_date = ? ORDER BY difficulty ASC, assignment_id ASC',
            [today]
        );
        const completedTaskIds = await getTaskCompletionIds(connection, sessionUserId, today, allTasksToday.map((row) => row.task_id));

        await connection.commit();

        return NextResponse.json({
            isCorrect: true,
            message: `Doskonale! Zdobywasz ${pointsToAdd} pkt.`,
            completedTaskIds,
            completedCount: completedTaskIds.length,
        });
    } catch (error) {
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error('Błąd rollback:', rollbackError);
            }
        }

        console.error('BŁĄD SYSTEMU:', error);
        return NextResponse.json({
            isCorrect: false,
            message: error.message ? `Błąd serwera: ${error.message}` : 'Błąd serwera.',
        }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}
