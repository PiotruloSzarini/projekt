import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/session";

export async function POST(request) {
    const { response } = requireAdmin(request);
    if (response) return response;

    try {
        const { type, id, newData } = await request.json();

        if (!id) {
            return NextResponse.json({ error: "Brak ID elementu" }, { status: 400 });
        }

        let query = "";
        let values = [];

        // Mapujemy name/title tak, aby obsłużyć obie wersje z frontendu
        const incomingName = newData.name || newData.title;

        switch (type) {
            case 'chapter':
                query = "UPDATE chapters SET title = ?, sort_order = ? WHERE chapter_id = ?";
                values = [incomingName, newData.sort || 0, id];
                break;
            case 'topic':
                query = "UPDATE topics SET title = ?, chapter_id = ?, sort_order = ? WHERE topic_id = ?";
                values = [incomingName, newData.parentId, newData.sort || 0, id];
                break;
            case 'lesson':
                query = "UPDATE lessons SET title = ?, topic_id = ?, sort_order = ? WHERE lesson_id = ?";
                values = [incomingName, newData.parentId, newData.sort || 0, id];
                break;
            
            case 'video':
                // Dynamiczne budowanie zapytania, żeby nie nadpisywać pustymi danymi
                const videoFields = [];
                if (newData.title !== undefined) { videoFields.push("title = ?"); values.push(newData.title); }
                if (newData.url !== undefined) { videoFields.push("url = ?"); values.push(newData.url); }
                if (newData.duration !== undefined) { videoFields.push("duration_seconds = ?"); values.push(newData.duration); }
                
                if (videoFields.length === 0) return NextResponse.json({ error: "Brak danych do zmiany" });
                
                query = `UPDATE videos SET ${videoFields.join(", ")} WHERE video_id = ?`;
                values.push(id);
                break;

            case 'task_group':
                query = "UPDATE task_groups SET title = ? WHERE task_group_id = ?";
                values = [incomingName, id];
                break;

            default:
                return NextResponse.json({ error: "Nieobsługiwany typ" }, { status: 400 });
        }

        const [result] = await pool.query(query, values);

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: "Nie znaleziono rekordu o podanym ID" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
        
    } catch (error) {
        console.error("Update Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}