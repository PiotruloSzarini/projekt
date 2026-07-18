import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/session";

export async function GET(request) {
    const { response } = await requireAdmin(request);
    if (response) return response;

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');

    if (!lessonId) return NextResponse.json({ error: "Missing lessonId" }, { status: 400 });

    try {
        const [videos] = await pool.query(
            "SELECT video_id, title, url FROM videos WHERE lesson_id = ?",
            [lessonId]
        );

        const [groups] = await pool.query(
            "SELECT task_group_id, title FROM task_groups WHERE lesson_id = ?",
            [lessonId]
        );

        const [tasks] = await pool.query(
                `SELECT task_id, question, task_group_id, task_type_id, points 
                FROM tasks 
                WHERE task_group_id = (SELECT task_group_id FROM task_groups WHERE lesson_id = ?)`,
            [lessonId]
        );

        return NextResponse.json({
            video: videos[0] || null,
            taskGroup: groups[0] || null,
            tasks: tasks || []
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
    }
}