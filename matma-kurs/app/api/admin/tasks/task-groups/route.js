import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function GET(request) {
    try {
        const [rows] = await pool.query(`
            SELECT 
                tg.task_group_id, 
                tg.title as name, 
                l.title as lesson_title
            FROM task_groups tg
            JOIN lessons l ON tg.lesson_id = l.lesson_id
            ORDER BY l.title ASC, tg.title ASC
        `);

        return NextResponse.json(rows);
        
    } catch (error) {
        console.error("Błąd pobierania grup:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}