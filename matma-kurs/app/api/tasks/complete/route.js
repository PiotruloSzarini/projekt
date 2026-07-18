import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { getSessionUserId } from '@/app/lib/session';

export async function POST(request) {
    const connection = await pool.getConnection();

    try {
        const sessionUserId = getSessionUserId(request);
        const { taskId } = await request.json();

        if (!sessionUserId) {
            return NextResponse.json({ error: 'Brak aktywnej sesji' }, { status: 401 });
        }

        if (!taskId) {
            return NextResponse.json({ error: 'Brak ID zadania' }, { status: 400 });
        }

        await connection.beginTransaction();

        const [taskRows] = await connection.query(
            'SELECT task_id, points FROM tasks WHERE task_id = ? LIMIT 1',
            [taskId]
        );

        if (taskRows.length === 0) {
            await connection.rollback();
            return NextResponse.json({ error: 'Nie znaleziono zadania' }, { status: 404 });
        }

        const task = taskRows[0];

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
