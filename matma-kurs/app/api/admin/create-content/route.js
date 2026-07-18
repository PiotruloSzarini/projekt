import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/session";

const slugify = (text) => {
    if (!text) return `item-${Date.now()}`;
    return text.toString().toLowerCase().trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '').replace(/-+$/, '');
};

export async function POST(request) {
    const { response } = await requireAdmin(request);
    if (response) return response;

    let connection;
    try {
        const { courseId, type, newData } = await request.json();
        if (!newData?.name) return NextResponse.json({ error: "Nazwa jest wymagana" }, { status: 400 });

        connection = await pool.getConnection();
        await connection.beginTransaction();

        let resultId;

        switch (type) {
            case 'chapter':
                const [chapRes] = await connection.query(
                    "INSERT INTO chapters (course_id, title, slug, sort_order) VALUES (?, ?, ?, ?)",
                    [courseId, newData.name, slugify(newData.name), newData.sort || 0]
                );
                resultId = chapRes.insertId;
                break;

            case 'topic':
                const [topRes] = await connection.query(
                    "INSERT INTO topics (chapter_id, title, slug, sort_order) VALUES (?, ?, ?, ?)",
                    [newData.parentId, newData.name, slugify(newData.name), newData.sort || 0]
                );
                resultId = topRes.insertId;
                break;

            case 'lesson':
                const [lessRes] = await connection.query(
                    "INSERT INTO lessons (topic_id, title, slug, sort_order) VALUES (?, ?, ?, ?)",
                    [newData.parentId, newData.name, slugify(newData.name), newData.sort || 0]
                );
                const newLessonId = lessRes.insertId;
                resultId = newLessonId;

                await connection.query(
                    "INSERT INTO videos (lesson_id, title, url, sort_order) VALUES (?, ?, ?, ?)",
                    [newLessonId, `Wideo: ${newData.name}`, '', 0]
                );

                await connection.query(
                    "INSERT INTO task_groups (lesson_id, title) VALUES (?, ?)",
                    [newLessonId, `Zadania: ${newData.name}`]
                );
                break;

            default:
                await connection.rollback();
                return NextResponse.json({ error: "Nieznany typ" }, { status: 400 });
        }

        await connection.commit();
        return NextResponse.json({ success: true, id: resultId });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Database Error:", error);
        console.error(error);
        return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}