import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function POST(request) {
    try {
        // Zmieniono na task_id i task_group_id, aby pasowało do fetch
        const { task_id, task_group_id } = await request.json();

        if (!task_id) {
            return NextResponse.json({ error: "Brak ID zadania" }, { status: 400 });
        }
        
        const query = "UPDATE tasks SET task_group_id = ? WHERE task_id = ?";
        // Używamy zmienionych nazw zmiennych
        const [result] = await pool.query(query, [task_group_id || null, task_id]);

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: "Nie znaleziono zadania o podanym ID" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Zadanie przypisane" });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}