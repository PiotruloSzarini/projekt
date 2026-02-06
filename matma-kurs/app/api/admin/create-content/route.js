import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

const slugify = (text) => {
    if (!text) return `item-${Date.now()}`;
    return text.toString().toLowerCase().trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '').replace(/-+$/, '');
};

export async function POST(request) {
    try {
        const { courseId, type, newData } = await request.json();
        if (!newData?.name) return NextResponse.json({ error: "Nazwa jest wymagana" }, { status: 400 });

        let query = "";
        let values = [];

        switch (type) {
            case 'chapter':
                const chapterSlug = slugify(newData.name);
                query = "INSERT INTO chapters (course_id, title, slug, sort_order) VALUES (?, ?, ?, ?)";
                values = [courseId, newData.name, chapterSlug, newData.sort || 0];
                break;
            case 'topic':
                query = "INSERT INTO topics (chapter_id, title, slug, sort_order) VALUES (?, ?, ?, ?)";
                values = [newData.parentId, newData.name, slugify(newData.name), newData.sort || 0];
                break;
            case 'lesson':
                query = "INSERT INTO lessons (topic_id, title, slug, sort_order) VALUES (?, ?, ?, ?)";
                values = [newData.parentId, newData.name, slugify(newData.name), newData.sort || 0];
                break;
            case 'task_group':
                query = "INSERT INTO task_groups (lesson_id, title) VALUES (?, ?)";
                values = [newData.parentId, newData.name];
                break;
            default:
                return NextResponse.json({ error: "Nieznany typ" }, { status: 400 });
        }

        const [result] = await pool.query(query, values);
        return NextResponse.json({ success: true, id: result.insertId });
    } catch (error) {
        console.error("Database Error:", error);
        return NextResponse.json({ error: error.message, sqlMessage: error.sqlMessage }, { status: 500 });
    }
}