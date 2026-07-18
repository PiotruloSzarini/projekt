import { NextResponse } from 'next/server';
import pool from '../../../lib/db';
import { getSessionUserId } from '@/app/lib/session';
import { normalizeAvatarUrl } from '@/app/lib/avatar';
import { validateString, validateUrl, ValidationError } from '@/app/lib/validation';
import { checkRateLimit } from '@/app/lib/rateLimiter';

export async function GET(request) {
    const userId = await getSessionUserId(request);

    if (!userId) {
        return NextResponse.json({ error: 'Brak aktywnej sesji' }, { status: 401 });
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

        const user = rows[0];

        return NextResponse.json({
            ...user,
            avatar_url: normalizeAvatarUrl(user.avatar_url, user.user_id),
        });
    } catch (error) {
        console.error('GET /api/user/profile error:', error);
        return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
    }
}

export async function PATCH(request) {
    const sessionUserId = await getSessionUserId(request);

    if (!sessionUserId) {
        return NextResponse.json({ error: 'Brak aktywnej sesji' }, { status: 401 });
    }

    const { limited, retryAfterSec } = checkRateLimit(`profile-patch:${sessionUserId}`, {
        maxAttempts: 10,
        windowMs: 60 * 1000,
    });
    if (limited) {
        return NextResponse.json(
            { error: `Zbyt wiele prób. Poczekaj ${retryAfterSec}s.` },
            { status: 429 }
        );
    }

    try {
        const body = await request.json();

        let nextName, nextAvatarUrl;
        try {
            nextName = validateString(body.name, { field: 'Nazwa użytkownika', min: 1, max: 100 });
            nextAvatarUrl = validateUrl(body.avatar_url, { field: 'Adres zdjęcia', max: 500, required: false });
        } catch (err) {
            if (err instanceof ValidationError) {
                return NextResponse.json({ error: err.message }, { status: 400 });
            }
            throw err;
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

        const user = rows[0];

        return NextResponse.json({
            success: true,
            user: {
                ...user,
                avatar_url: normalizeAvatarUrl(user.avatar_url, user.user_id),
            },
        });
    } catch (error) {
        console.error('PATCH /api/user/profile error:', error);
        return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
    }
}
