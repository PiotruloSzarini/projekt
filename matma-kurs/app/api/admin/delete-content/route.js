import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/session";
import { logAdminAction } from "@/app/lib/audit";

export async function POST(request) {
    const { session, response } = await requireAdmin(request);
    if (response) return response;

    const config = {
        'chapter': { table: 'chapters', pk: 'chapter_id', parentField: 'course_id' },
        'topic': { table: 'topics', pk: 'topic_id', parentField: 'chapter_id' },
        'lesson': { table: 'lessons', pk: 'lesson_id', parentField: 'topic_id' },
        'task_group': { table: 'task_groups', pk: 'task_group_id', parentField: 'lesson_id' },
        'video': { table: 'videos', pk: 'video_id', parentField: 'lesson_id' }
    };

    let connection;
    try {
        const { type, id } = await request.json();

        if (!id || !type) {
            return NextResponse.json({ error: "Brak ID lub typu" }, { status: 400 });
        }

        const target = config[type];
        if (!target) {
            return NextResponse.json({ error: `Nieobsługiwany typ: ${type}` }, { status: 400 });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. SELECT ... FOR UPDATE — blokada wiersza do końca transakcji,
        //    żeby inny admin nie usunął go równolegle.
        const [rows] = await connection.query(
            `SELECT ${target.parentField}, sort_order FROM ${target.table} WHERE ${target.pk} = ? FOR UPDATE`,
            [id]
        );

        if (rows.length === 0) {
            await connection.rollback();
            return NextResponse.json({ error: "Nie znaleziono elementu w bazie" }, { status: 404 });
        }

        const { [target.parentField]: parentIdValue, sort_order: sortValue } = rows[0];

        // 2. DELETE + 3. UPDATE sort_order — atomowo w transakcji
        const [result] = await connection.query(
            `DELETE FROM ${target.table} WHERE ${target.pk} = ?`,
            [id]
        );

        if (result.affectedRows > 0) {
            // <=> zamiast = obsługuje NULL w parentIdValue (chapters mają course_id, ale np. gdyby był NULL)
            await connection.query(
                `UPDATE ${target.table}
                 SET sort_order = sort_order - 1
                 WHERE ${target.parentField} <=> ? AND sort_order > ?`,
                [parentIdValue, sortValue]
            );
        }

        await connection.commit();

        logAdminAction(request, session.userId, `${type}.delete`, {
            entityType: type,
            entityId: Number(id),
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        if (connection) {
            try { await connection.rollback(); } catch {}
        }
        console.error("DELETE ERROR:", error);

        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
            return NextResponse.json({
                error: "Element zawiera dane (podelementy). Usuń je najpierw, aby móc usunąć ten poziom."
            }, { status: 409 });
        }

        return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
    } finally {
        if (connection) connection.release();
    }
}