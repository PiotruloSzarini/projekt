import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { getSession } from '@/app/lib/session';
import { validateInt, ValidationError } from '@/app/lib/validation';
import { checkRateLimit } from '@/app/lib/rateLimiter';

export async function POST(request) {
    const { userId: sessionUserId, isAdmin } = await getSession(request);

    if (!sessionUserId) {
        return NextResponse.json({ error: 'Brak aktywnej sesji' }, { status: 401 });
    }

    const { limited, retryAfterSec } = checkRateLimit(`task-complete:${sessionUserId}`, {
        maxAttempts: 60,
        windowMs: 60 * 1000,
    });
    if (limited) {
        return NextResponse.json(
            { error: `Zbyt wiele prób. Poczekaj ${retryAfterSec}s.` },
            { status: 429 }
        );
    }

    const connection = await pool.getConnection();

    try {
        const body = await request.json();
        let taskId;
        try {
            taskId = validateInt(body.taskId, { field: 'ID zadania', min: 1 });
        } catch (err) {
            if (err instanceof ValidationError) {
                return NextResponse.json({ error: err.message }, { status: 400 });
            }
            throw err;
        }

        await connection.beginTransaction();

        // Jednym zapytaniem: dane zadania + sprawdzenie własności kursu
        const [taskRows] = await connection.query(
            `SELECT
                 t.task_id,
                 t.points,
                 CASE WHEN uc.user_id IS NOT NULL THEN 1 ELSE 0 END AS owned
             FROM tasks t
             JOIN task_groups tg ON t.task_group_id = tg.task_group_id
             JOIN lessons l ON tg.lesson_id = l.lesson_id
             JOIN topics tp ON l.topic_id = tp.topic_id
             JOIN chapters ch ON tp.chapter_id = ch.chapter_id
             LEFT JOIN user_courses uc ON ch.course_id = uc.course_id AND uc.user_id = ?
             WHERE t.task_id = ?
             LIMIT 1`,
            [sessionUserId, taskId]
        );

        if (taskRows.length === 0) {
            await connection.rollback();
            return NextResponse.json({ error: 'Nie znaleziono zadania' }, { status: 404 });
        }

        const task = taskRows[0];

        if (!isAdmin && !Number(task.owned)) {
            await connection.rollback();
            return NextResponse.json({ error: 'Brak dostępu do tego zadania' }, { status: 403 });
        }

        const [existingRows] = await connection.query(
            'SELECT completion_id FROM task_completions WHERE user_id = ? AND task_id = ? LIMIT 1',
            [sessionUserId, taskId]
        );

        if (existingRows.length > 0) {
            await connection.rollback();
            return NextResponse.json({
                success: true,
                alreadyCompleted: true,
                pointsAwarded: 0,
                message: 'To zadanie zostało już zaliczone.',
            });
        }

        const pointsAwarded = Number(task.points || 0) || 0;

        await connection.query(
            'INSERT INTO task_completions (user_id, task_id, points_awarded) VALUES (?, ?, ?)',
            [sessionUserId, taskId, pointsAwarded]
        );

        await connection.query(
            `
            INSERT INTO user_stats (user_id, total_points, tasks_completed)
            VALUES (?, ?, 1)
            ON DUPLICATE KEY UPDATE
                total_points = COALESCE(total_points, 0) + VALUES(total_points),
                tasks_completed = COALESCE(tasks_completed, 0) + 1
            `,
            [sessionUserId, pointsAwarded]
        );

        await connection.commit();

        return NextResponse.json({
            success: true,
            alreadyCompleted: false,
            pointsAwarded,
            message: `Zdobywasz ${pointsAwarded} pkt.`,
        });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
    } finally {
        connection.release();
    }
}
