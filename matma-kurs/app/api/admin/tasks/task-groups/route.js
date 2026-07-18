import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/session";

export async function GET(request) {
    const { response } = requireAdmin(request);
    if (response) return response;

    try {
        const [rows] = await pool.query(`
            SELECT 
                tg.task_group_id, 
                tg.title as name, 
                tg.lesson_id,
                l.title as lesson_title,
                l.sort_order as lesson_sort,
                t.topic_id,
                t.title as topic_title,
                t.sort_order as topic_sort,
                ch.chapter_id,
                ch.title as chapter_title,
                ch.sort_order as chapter_sort,
                c.course_id,
                c.title as course_title,
                COUNT(ts.task_id) as tasks_count
            FROM task_groups tg
            JOIN lessons l ON tg.lesson_id = l.lesson_id
            JOIN topics t ON l.topic_id = t.topic_id
            JOIN chapters ch ON t.chapter_id = ch.chapter_id
            JOIN courses c ON ch.course_id = c.course_id
            LEFT JOIN tasks ts ON ts.task_group_id = tg.task_group_id
            GROUP BY 
                tg.task_group_id, tg.title, tg.lesson_id,
                l.title, l.sort_order,
                t.topic_id, t.title, t.sort_order,
                ch.chapter_id, ch.title, ch.sort_order,
                c.course_id, c.title
            ORDER BY c.course_id ASC, ch.sort_order ASC, t.sort_order ASC, l.sort_order ASC, tg.title ASC
        `);

        return NextResponse.json(rows);
        
    } catch (error) {
        console.error("Błąd pobierania grup:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
