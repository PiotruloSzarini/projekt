import { NextResponse } from "next/server";
import pool from "@/app/lib/db";

async function ensureTaskSortOrderColumn(connection) {
    const [columns] = await connection.query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'tasks'
          AND COLUMN_NAME = 'sort_order'
        LIMIT 1
    `);

    if (columns.length === 0) {
        await connection.query(`ALTER TABLE tasks ADD COLUMN sort_order INT NULL`);
    }
}

async function normalizeTaskGroup(connection, groupId) {
    if (!groupId) return;

    const [rows] = await connection.query(
        `SELECT task_id
         FROM tasks
         WHERE task_group_id = ?
         ORDER BY COALESCE(sort_order, 999999), task_id ASC`,
        [groupId]
    );

    for (let index = 0; index < rows.length; index += 1) {
        await connection.query(
            `UPDATE tasks SET sort_order = ? WHERE task_id = ?`,
            [index + 1, rows[index].task_id]
        );
    }
}

export async function POST(request) {
    const connection = await pool.getConnection();

    try {
        const { task_id, task_group_id, sort_order } = await request.json();

        if (!task_id) {
            return NextResponse.json({ error: "Brak ID zadania" }, { status: 400 });
        }

        await connection.beginTransaction();
        await ensureTaskSortOrderColumn(connection);

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
            await connection.query(
                `UPDATE tasks SET task_group_id = NULL, sort_order = NULL WHERE task_id = ?`,
                [task_id]
            );
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
        if (oldGroupId !== newGroupId) {
            await connection.query(
                `UPDATE tasks SET task_group_id = NULL, sort_order = NULL WHERE task_id = ?`,
                [task_id]
            );
        }
        await normalizeTaskGroup(connection, newGroupId);

        const [groupTasks] = await connection.query(
            `SELECT task_id
             FROM tasks
             WHERE task_group_id = ? AND task_id <> ?
             ORDER BY COALESCE(sort_order, 999999), task_id ASC`,
            [newGroupId, task_id]
        );

        const maxPosition = groupTasks.length + 1;
        const desiredPosition = Math.min(
            Math.max(parseInt(sort_order, 10) || maxPosition, 1),
            maxPosition
        );
        const orderedIds = groupTasks.map((task) => task.task_id);
        orderedIds.splice(desiredPosition - 1, 0, task_id);

        for (let index = 0; index < orderedIds.length; index += 1) {
            await connection.query(
                `UPDATE tasks SET task_group_id = ?, sort_order = ? WHERE task_id = ?`,
                [newGroupId, index + 1, orderedIds[index]]
            );
        }

        await connection.commit();

        return NextResponse.json({
            success: true,
            message: "Zadanie przypisane",
            task_group_id: newGroupId,
            sort_order: desiredPosition
        });
    } catch (error) {
        await connection.rollback();
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        connection.release();
    }
}
