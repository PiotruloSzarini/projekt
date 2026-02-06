import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function POST(request) {
    const { type, id, newData } = await request.json();

    try {
        let query = "";
        let values = [];

        switch (type) {
            case 'chapter':
                query = "UPDATE chapters SET title = ?, sort_order = ? WHERE chapter_id = ?";
                values = [newData.name, newData.sort, id];
                break;
            case 'topic':
                query = "UPDATE topics SET title = ?, chapter_id = ?, sort_order = ? WHERE topic_id = ?";
                values = [newData.name, newData.parentId, newData.sort, id];
                break;
            case 'lesson':
                query = "UPDATE lessons SET slug = ?, topic_id = ?, sort_order = ? WHERE lesson_id = ?";
                values = [newData.name, newData.parentId, newData.sort, id];
                break;
            case 'task_group':
                query = "UPDATE task_groups SET title = ?, lesson_id = ? WHERE task_group_id = ?";
                values = [newData.name, newData.parentId, id];
                break;
        }

        await pool.query(query, values);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}