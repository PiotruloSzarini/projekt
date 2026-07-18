import { NextResponse } from 'next/server';
import pool from '../../lib/db';
import { getSessionUserId } from '@/app/lib/session';
import { normalizeAvatarUrl } from '@/app/lib/avatar';

export async function GET(request) {
    const userId = await getSessionUserId(request);

    try {
        // LIMIT 8 w SQL — ranking pokazuje tylko top 8 + 'me'.
        // Sortowanie po points i tasks_completed jest wewnętrzne — do klienta idą tylko wybrane pola.
        const [topRows] = await pool.execute(
            `
            SELECT
                u.user_id,
                u.name,
                u.avatar_url,
                COALESCE(s.total_points, 0) AS total_points
            FROM users u
            LEFT JOIN user_stats s ON u.user_id = s.user_id
            ORDER BY total_points DESC, u.name ASC
            LIMIT 8
            `,
            []
        );

        const rankedRows = topRows.map((row, index) => ({
            name: row.name,
            avatar_url: normalizeAvatarUrl(row.avatar_url, row.user_id),
            total_points: row.total_points,
            rank: index + 1,
            active: userId ? Number(row.user_id) === Number(userId) : false,
        }));

        // Top 3 do "podium" — te same okrojone pola
        const topUsers = rankedRows.slice(0, 3).map((row, index) => ({
            icon: row.avatar_url,
            name: row.name,
            points: row.total_points,
            isFirst: index === 0,
        }));

        // 'me' tylko dla zalogowanych. Osobne query, bo user może być poza top 8.
        // rank liczymy jako: ile osób ma więcej punktów + 1.
        let me = null;
        if (userId) {
            const [meRows] = await pool.execute(
                `
                SELECT
                    u.name,
                    u.avatar_url,
                    COALESCE(s.total_points, 0) AS total_points,
                    COALESCE(s.tasks_completed, 0) AS tasks_completed,
                    COALESCE(s.daily_completed, 0) AS daily_completed,
                    (
                        SELECT COUNT(*) + 1
                        FROM user_stats s2
                        WHERE COALESCE(s2.total_points, 0) > COALESCE(s.total_points, 0)
                    ) AS rank_position
                FROM users u
                LEFT JOIN user_stats s ON u.user_id = s.user_id
                WHERE u.user_id = ?
                LIMIT 1
                `,
                [userId]
            );

            if (meRows.length) {
                me = {
                    name: meRows[0].name,
                    avatar_url: normalizeAvatarUrl(meRows[0].avatar_url, userId),
                    total_points: meRows[0].total_points,
                    tasks_completed: meRows[0].tasks_completed,
                    daily_completed: meRows[0].daily_completed,
                    rank: Number(meRows[0].rank_position),
                };
            }
        }

        return NextResponse.json({
            topUsers,
            rows: rankedRows,
            me,
            summary: {
                totalPoints: me?.total_points || 0,
                completedLessons: me?.tasks_completed || 0,
                dailyCompleted: me?.daily_completed || 0,
            },
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
    }
}
