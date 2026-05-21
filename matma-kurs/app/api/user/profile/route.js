import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) return NextResponse.json({ error: 'Brak ID użytkownika' }, { status: 400 });

    try {
        const [rows] = await pool.execute(`
            SELECT 
                u.name, u.avatar_url,
                s.total_points, s.tasks_completed, s.videos_watched, s.daily_completed, s.weak_points_completed, s.level,
                str.current_streak,
                rp.rank_position as global_rank
            FROM users u
            LEFT JOIN user_stats s ON u.user_id = s.user_id
            LEFT JOIN user_streak str ON u.user_id = str.user_id
            LEFT JOIN ranking_position rp ON u.user_id = rp.user_id AND rp.ranking_type = 'GLOBAL'
            WHERE u.user_id = ?
        `, [userId]);

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Użytkownik nie istnieje' }, { status: 404 });
        }

        return NextResponse.json(rows[0]);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}