import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/session";

export async function GET(request, { params }) {
    const { response } = requireAdmin(request);
    if (response) return response;

    const { courseId } = await params;
    const id = parseInt(courseId);

    try {
        // Upraszczamy JOIN - nie potrzebujemy już wyciągać task_groups do drzewa
        const [rows] = await pool.query(`
            SELECT 
                c.chapter_id, c.title AS chapter_title, c.sort_order AS chapter_sort,
                t.topic_id, t.title AS topic_title, t.sort_order AS topic_sort,
                l.lesson_id, l.title AS lesson_title, l.sort_order AS lesson_sort
            FROM chapters c 
            LEFT JOIN topics t ON c.chapter_id = t.chapter_id 
            LEFT JOIN lessons l ON t.topic_id = l.topic_id 
            WHERE c.course_id = ? 
            ORDER BY c.sort_order, t.sort_order, l.sort_order
        `, [id]);

        if (rows.length === 0) {
            return NextResponse.json([]);
        }

        const chapters = [];

        rows.forEach(row => {
            // 1. ROZDZIAŁY
            let chapter = chapters.find(c => c.id === row.chapter_id);
            if (!chapter && row.chapter_id) {
                chapter = {
                    id: row.chapter_id,
                    name: row.chapter_title || "Rozdział bez tytułu",
                    type: "chapter",
                    sort: row.chapter_sort || 0,
                    children: []
                };
                chapters.push(chapter);
            }

            // 2. TEMATY
            if (row.topic_id && chapter) {
                let topic = chapter.children.find(t => t.id === row.topic_id);
                if (!topic) {
                    topic = {
                        id: row.topic_id,
                        name: row.topic_title || "Temat bez tytułu",
                        type: "topic",
                        sort: row.topic_sort || 0,
                        parentId: row.chapter_id,
                        children: []
                    };
                    chapter.children.push(topic);
                }

                // 3. LEKCJE
                if (row.lesson_id && topic) {
                    let lesson = topic.children.find(l => l.id === row.lesson_id);
                    if (!lesson) {
                        lesson = {
                            id: row.lesson_id,
                            name: row.lesson_title || "Lekcja bez tytułu",
                            type: "lesson",
                            sort: row.lesson_sort || 0,
                            parentId: row.topic_id,
                            children: [] // Puste children, bo video i task_groups obsługujemy wewnątrz lekcji
                        };
                        topic.children.push(lesson);
                    }
                }
            }
        });

        return NextResponse.json(chapters);

    } catch (error) {
        console.error("BŁĄD W API STRUCTURE:", error);
        return NextResponse.json({ error: 'Failed to fetch structure', detail: error.message }, { status: 500 });
    }
}