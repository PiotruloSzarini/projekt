import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import { requireAdmin } from "@/app/lib/session";
import { normalizeTaskGroup, placeTaskInGroup } from "@/app/lib/taskOrdering";

export async function POST(request) {
    const { response } = requireAdmin(request);
    if (response) return response;

    const connection = await pool.getConnection();

    try {
        const { task_id, task_group_id, sort_order } = await request.json();

        if (!task_id) {
            return NextResponse.json({ error: "Brak ID zadania" }, { status: 400 });
        }

        await connection.beginTransaction();

        const [taskRows] = await connection.query(
            `SELECT task_group_id FROM tasks WHERE task_id = ? FOR UPDATE`,
            [task_id]
        );

        if (taskRows.length === 0) {
            await connection.rollback();
            return NextResponse.json({ error: "Nie znaleziono zadania o podanym ID" }, { status: 404 });
        }

        const oldGroupId = taskRows[0].task_group_id;
        const newGroupId = task_group_id ? parseInt(task_group_id, 10) : null;

        if (!newGroupId) {
            await placeTaskInGroup(connection, task_id, null, null);
            await normalizeTaskGroup(connection, oldGroupId);
            await connection.commit();
            return NextResponse.json({ success: true, message: "Zadanie odpięte od grupy" });
        }

        const [groupRows] = await connection.query(
            `SELECT task_group_id FROM task_groups WHERE task_group_id = ?`,
            [newGroupId]
        );

        if (groupRows.length === 0) {
            await connection.rollback();
            return NextResponse.json({ error: "Nie znaleziono grupy zadań" }, { status: 404 });
        }

        await normalizeTaskGroup(connection, oldGroupId);
        const desiredPosition = await placeTaskInGroup(connection, task_id, newGroupId, sort_order);

        await connection.commit();

        return NextResponse.json({
            success: true,
            message: "Zadanie przypisane",
            task_group_id: newGroupId,
            sort_order: desiredPosition,
        });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
    } finally {
        connection.release();
    }
}
