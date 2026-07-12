import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';
import { getCoursesForUser } from '@/app/lib/services/courses';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const session = getSession(request);
    const userId = searchParams.get('userId') || session.userId;

    try {
        const query = `
            SELECT 
                c.*, 
                CASE WHEN uc.user_id IS NOT NULL THEN 1 ELSE 0 END as owned,
                COALESCE(up.progress_percent, 0) as progress,
                (SELECT COUNT(*) FROM videos v
                    JOIN lessons l ON v.lesson_id = l.lesson_id
                    JOIN topics t ON l.topic_id = t.topic_id
                    JOIN chapters ch ON t.chapter_id = ch.chapter_id
                    WHERE ch.course_id = c.course_id) as total_videos,
                (SELECT COUNT(*) FROM tasks t
                    JOIN task_groups tg ON t.task_group_id = tg.task_group_id
                    JOIN lessons l ON tg.lesson_id = l.lesson_id
                    JOIN topics tp ON l.topic_id = tp.topic_id
                    JOIN chapters ch ON tp.chapter_id = ch.chapter_id
                    WHERE ch.course_id = c.course_id) as total_tasks
            FROM courses c
            LEFT JOIN user_courses uc ON c.course_id = uc.course_id AND uc.user_id = ?
            LEFT JOIN user_progress up ON c.course_id = up.entity_id 
                AND up.entity_type = 'COURSE' 
                AND up.user_id = ?
            ORDER BY c.course_id ASC
        `;

        const [rows] = await pool.execute(query, [userId || null, userId || null]);
        const normalizedRows = rows.map((row) => ({
            ...row,
            owned: isAdmin ? 1 : Number(row.owned || 0),
        }));

        return NextResponse.json(normalizedRows);
    } catch (error) {
        console.error('PEŁNY BŁĄD SQL:', error.message);
        return NextResponse.json({
            error: 'Błąd struktury bazy danych',
            details: error.message
        }, { status: 500 });
    }
}
