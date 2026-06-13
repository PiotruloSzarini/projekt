import { NextResponse } from 'next/server';
import pool from '../../lib/db';

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
    const requestedUserId = searchParams.get('userId');
    const sessionUserId = getSessionUserId(request);
    const userId = requestedUserId || sessionUserId;

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
            avatar_url: normalizeAvatarUrl(row.avatar_url, row.name, row.user_id),
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
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
