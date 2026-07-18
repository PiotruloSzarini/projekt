import { NextResponse } from 'next/server';
import pool from '../../lib/db';
import { getSessionUserId } from '@/app/lib/session';
import { normalizeAvatarUrl } from '@/app/lib/avatar';

export async function GET(request) {
    const userId = getSessionUserId(request);

    try {
        const [rows] = await pool.execute(
            `
            SELECT
                u.user_id,
                u.name,
                u.avatar_url,
                COALESCE(s.total_points, 0) AS total_points,
                COALESCE(s.tasks_completed, 0) AS tasks_completed,
                COALESCE(s.videos_watched, 0) AS videos_watched,
                COALESCE(s.daily_completed, 0) AS daily_completed,
                COALESCE(s.weak_points_completed, 0) AS weak_points_completed,
                COALESCE(s.level, 1) AS level
            FROM users u
            LEFT JOIN user_stats s ON u.user_id = s.user_id
            ORDER BY total_points DESC, tasks_completed DESC, u.name ASC
            `,
            []
        );

        const rankedRows = rows.map((row, index) => ({
            ...row,
            avatar_url: normalizeAvatarUrl(row.avatar_url, row.user_id),
            rank: index + 1,
            nick: `@${String(row.name || 'user').toLowerCase().replace(/\s+/g, '')}`,
            active: userId ? String(row.user_id) === String(userId) : false,
        }));

        const topUsers = rankedRows.slice(0, 3).map((row, index) => ({
            icon: row.avatar_url,
            name: row.name,
            nick: row.nick,
            points: row.total_points,
            tasks: row.tasks_completed,
            daily_challange: row.daily_completed,
            isFirst: index === 0,
        }));

        const currentUser = rankedRows.find((row) => String(row.user_id) === String(userId)) || rankedRows[0] || null;
        const totalPoints = currentUser?.total_points || 0;
        const completedLessons = currentUser?.tasks_completed || 0;
        const currentDaily = currentUser?.daily_completed || 0;

        return NextResponse.json({
            topUsers,
            rows: rankedRows.slice(0, 8),
            me: currentUser,
            summary: {
                totalPoints,
                completedLessons,
                dailyCompleted: currentDaily,
            },
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
    }
}
