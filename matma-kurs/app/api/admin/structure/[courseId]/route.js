import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function GET(request, { params }) {
    const { courseId } = await params;
    const id = parseInt(courseId);

    try {
        const [rows] = await pool.query(`
            SELECT 
                c.chapter_id, c.title AS chapter_title, c.sort_order AS chapter_sort,
                t.topic_id, t.title AS topic_title, t.sort_order AS topic_sort,
                l.lesson_id, l.title AS lesson_title, l.sort_order AS lesson_sort,
                tg.task_group_id, tg.title AS group_title 
            FROM chapters c 
            LEFT JOIN topics t ON c.chapter_id = t.chapter_id 
            LEFT JOIN lessons l ON t.topic_id = l.topic_id 
            LEFT JOIN task_groups tg ON l.lesson_id = tg.lesson_id 
            WHERE c.course_id = ? 
            ORDER BY c.sort_order, t.sort_order, l.sort_order
        `, [id]);

        if (rows.length === 0) {
            return NextResponse.json([]);
        }

        const chapters = [];

        rows.forEach(row => {
            // ROZDZIAŁY
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

            // TEMATY
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

                // LEKCJE
                if (row.lesson_id && topic) {
                    let lesson = topic.children.find(l => l.id === row.lesson_id);
                    if (!lesson) {
                        lesson = {
                            id: row.lesson_id,
                            name: row.lesson_title || "Lekcja bez tytułu",
                            type: "lesson",
                            sort: row.lesson_sort || 0,
                            parentId: row.topic_id,
                            children: []
                        };
                        topic.children.push(lesson);
                    }

                    // GRUPY ZADAŃ
                    if (row.task_group_id && lesson) {
                        if (!lesson.children.find(g => g.id === row.task_group_id)) {
                            lesson.children.push({
                                id: row.task_group_id,
                                name: row.group_title || "Zestaw zadań",
                                type: "task_group",
                                parentId: row.lesson_id
                            });
                        }
                    }
                }
            }
        });

        return NextResponse.json(chapters);

    } catch (error) {
        console.error("BŁĄD W API:", error);
        return NextResponse.json({ error: 'Failed to fetch structure', detail: error.message }, { status: 500 });
    }
}