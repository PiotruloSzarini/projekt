import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

function getSessionUserId(request) {
    return request.cookies.get('session_user_id')?.value || null;
}

function getFallbackAvatar(userId) {
    const avatarIndex = Math.abs(Number(userId) || 0) % 5 + 1;
    return `/assets/img/avatars/avatar-${avatarIndex}.svg`;
}

function isTrustedRemoteAvatar(url) {
    try {
        const parsed = new URL(url);
        return parsed.hostname === 'res.cloudinary.com';
    } catch {
        return false;
    }
}

function normalizeAvatarUrl(avatarUrl, name, userId) {
    const raw = typeof avatarUrl === 'string' ? avatarUrl.trim() : '';

    if (raw) {
        const markdownMatch = raw.match(/\((https?:\/\/[^)\s]+)\)/i);
        if (markdownMatch?.[1]) {
            return isTrustedRemoteAvatar(markdownMatch[1]) ? markdownMatch[1] : getFallbackAvatar(userId);
        }

        const urlMatch = raw.match(/https?:\/\/[^\s)]+/i);
        if (urlMatch?.[0]) {
            const cleanedUrl = urlMatch[0].replace(/[\])]+$/g, '');
            return isTrustedRemoteAvatar(cleanedUrl) ? cleanedUrl : getFallbackAvatar(userId);
        }

        if (raw.startsWith('/')) {
            return raw;
        }

        try {
            const parsed = new URL(raw);
            if ((parsed.protocol === 'http:' || parsed.protocol === 'https:') && isTrustedRemoteAvatar(raw)) {
                return raw;
            }
        } catch {
            // fall back below
        }
    }

    return getFallbackAvatar(userId);
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

        const user = rows[0];

        return NextResponse.json({
            ...user,
            avatar_url: normalizeAvatarUrl(user.avatar_url, user.name, user.user_id),
        });
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

        const user = rows[0];

        return NextResponse.json({
            success: true,
            user: {
                ...user,
                avatar_url: normalizeAvatarUrl(user.avatar_url, user.name, user.user_id),
            },
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
