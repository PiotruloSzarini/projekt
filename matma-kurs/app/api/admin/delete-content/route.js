import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

export async function POST(request) {
    try {
        const { type, id } = await request.json();

        if (!id || !type) {
            return NextResponse.json({ error: "Brak ID lub typu" }, { status: 400 });
        }

        const config = {
            'chapter': { table: 'chapters', pk: 'chapter_id', parentField: 'course_id' },
            'topic': { table: 'topics', pk: 'topic_id', parentField: 'chapter_id' },
            'lesson': { table: 'lessons', pk: 'lesson_id', parentField: 'topic_id' }, 
            'task_group': { table: 'task_groups', pk: 'task_group_id', parentField: 'lesson_id' },
            'video': { table: 'videos', pk: 'video_id', parentField: 'lesson_id' }
        };

        const target = config[type];

        if (!target) {
            return NextResponse.json({ error: `Nieobsługiwany typ: ${type}` }, { status: 400 });
        }

        // 1. POBIERZ DANE ELEMENTU PRZED USUNIĘCIEM (potrzebne do przesunięcia reszty)
        // Zakładam, że kolumna w bazie to sort_order
        const [rows] = await pool.query(
            `SELECT ${target.parentField}, sort_order FROM ${target.table} WHERE ${target.pk} = ?`, 
            [id]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: "Nie znaleziono elementu w bazie" }, { status: 404 });
        }

        const itemToDelete = rows[0];
        const parentIdValue = itemToDelete[target.parentField];
        const sortValue = itemToDelete.sort_order;

        // 2. USUNIĘCIE ELEMENTU
        const deleteQuery = `DELETE FROM ${target.table} WHERE ${target.pk} = ?`;
        const [result] = await pool.query(deleteQuery, [id]);

        // 3. AUTOMATYCZNA POPRAWA SORTOWANIA DLA RODZEŃSTWA
        // Zmniejszamy sort_order o 1 dla wszystkich, którzy byli "dalej" w kolejce
        if (result.affectedRows > 0) {
            const updateSortQuery = `
                UPDATE ${target.table} 
                SET sort_order = sort_order - 1 
                WHERE ${target.parentField} <=> ? 
                AND sort_order > ?
            `;
            // Używamy <=> zamiast =, na wypadek gdyby parentIdValue był nullem (np. dla chapters)
            await pool.query(updateSortQuery, [parentIdValue, sortValue]);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("DELETE ERROR:", error);

        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
            return NextResponse.json({ 
                error: "Element zawiera dane (podelementy). Usuń je najpierw, aby móc usunąć ten poziom." 
            }, { status: 409 });
        }

        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}