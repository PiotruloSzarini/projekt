export async function normalizeTaskGroup(connection, groupId) {
    if (!groupId) return;

    const [rows] = await connection.query(
        `SELECT task_id FROM tasks WHERE task_group_id = ? ORDER BY COALESCE(sort_order, 999999), task_id ASC`,
        [groupId]
    );

    for (let index = 0; index < rows.length; index++) {
        await connection.query(
            `UPDATE tasks SET sort_order = ? WHERE task_id = ?`,
            [index + 1, rows[index].task_id]
        );
    }
}

export async function placeTaskInGroup(connection, taskId, groupId, sortOrder) {
    if (!groupId) {
        await connection.query(
            `UPDATE tasks SET task_group_id = NULL, sort_order = NULL WHERE task_id = ?`,
            [taskId]
        );
        return;
    }

    const [groupTasks] = await connection.query(
        `SELECT task_id FROM tasks WHERE task_group_id = ? AND task_id <> ? ORDER BY COALESCE(sort_order, 999999), task_id ASC`,
        [groupId, taskId]
    );

    const maxPosition = groupTasks.length + 1;
    const desiredPosition = Math.min(Math.max(parseInt(sortOrder, 10) || maxPosition, 1), maxPosition);
    const orderedIds = groupTasks.map((t) => t.task_id);
    orderedIds.splice(desiredPosition - 1, 0, taskId);

    for (let index = 0; index < orderedIds.length; index++) {
        await connection.query(
            `UPDATE tasks SET task_group_id = ?, sort_order = ? WHERE task_id = ?`,
            [groupId, index + 1, orderedIds[index]]
        );
    }

    return desiredPosition;
}
