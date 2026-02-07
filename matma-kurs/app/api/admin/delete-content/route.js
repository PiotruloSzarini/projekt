import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function POST(request) {
    try {
        const { type, id } = await request.json();

        if (!id || !type) {
            return NextResponse.json({ error: "Brak ID lub typu" }, { status: 400 });
        }

        // MAPOWANIE: tabela oraz jej unikalny klucz główny
        const config = {
            'chapter': { table: 'chapters', pk: 'chapter_id' },
            'topic': { table: 'topics', pk: 'topic_id' },
            'lesson': { table: 'lessons', pk: 'lesson_id' }, 
            'task_group': { table: 'task_groups', pk: 'task_group_id' }
        };

        const target = config[type];

        if (!target) {
            return NextResponse.json({ error: `Nieobsługiwany typ: ${type}` }, { status: 400 });
        }

        // Budujemy zapytanie z poprawną nazwą kolumny (np. WHERE lesson_id = ?)
        const query = `DELETE FROM ${target.table} WHERE ${target.pk} = ?`;
        
        console.log("SQL EXECUTE:", query, "ID:", id);

        const [result] = await pool.query(query, [id]);

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: "Nie znaleziono elementu w bazie" }, { status: 404 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("DELETE ERROR:", error);

        // Obsługa braku pustego elementu (FK constraint)
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
            return NextResponse.json({ 
                error: "Element zawiera dane. Usuń najpierw podelementy." 
            }, { status: 409 });
        }

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}