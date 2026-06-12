import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

function getSessionUserId(request) {
    return request.cookies.get('session_user_id')?.value || null;
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || getSessionUserId(request);

    if (!userId) {
        return NextResponse.json({ error: 'Brak ID użytkownika' }, { status: 400 });
    }

    try {
        const [rows] = await pool.execute(
            `
            SELECT 
                u.user_id,
                u.name,
                u.avatar_url,
                s.total_points,
                s.tasks_completed,
                s.videos_watched,
                s.daily_completed,
                s.weak_points_completed,
                s.level,
                str.current_streak,
                rp.rank_position as global_rank
            FROM users u
            LEFT JOIN user_stats s ON u.user_id = s.user_id
            LEFT JOIN user_streak str ON u.user_id = str.user_id
            LEFT JOIN ranking_position rp ON u.user_id = rp.user_id AND rp.ranking_type = 'GLOBAL'
            WHERE u.user_id = ?
            `,
            [userId]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Użytkownik nie istnieje' }, { status: 404 });
        }

        return NextResponse.json(rows[0]);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request) {
    const sessionUserId = getSessionUserId(request);

    if (!sessionUserId) {
        return NextResponse.json({ error: 'Brak aktywnej sesji' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const nextName = typeof body.name === 'string' ? body.name.trim() : '';
        const nextAvatarUrl = typeof body.avatar_url === 'string' ? body.avatar_url.trim() : '';

        if (!nextName) {
            return NextResponse.json({ error: 'Nazwa użytkownika jest wymagana' }, { status: 400 });
        }

        await pool.execute(
            `
            UPDATE users
            SET name = ?, avatar_url = ?
            WHERE user_id = ?
            `,
            [nextName, nextAvatarUrl || null, sessionUserId]
        );

        const [rows] = await pool.execute(
            `
            SELECT user_id, name, avatar_url
            FROM users
            WHERE user_id = ?
            `,
            [sessionUserId]
        );

        return NextResponse.json({ success: true, user: rows[0] });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
