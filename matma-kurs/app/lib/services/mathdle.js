import db from '@/app/lib/db';

export function getWarsawDateString(date = new Date()) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Warsaw',
    }).format(date);
}

export async function ensureDailyCompletionTable(connection) {
    await connection.query(`
        CREATE TABLE IF NOT EXISTS daily_challenge_completions (
            completion_id INT NOT NULL AUTO_INCREMENT,
            user_id INT NOT NULL,
            assignment_date DATE NOT NULL,
            task_id INT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (completion_id),
            UNIQUE KEY uniq_daily_completion (user_id, assignment_date, task_id),
            KEY idx_daily_completion_user_date (user_id, assignment_date),
            CONSTRAINT fk_daily_completion_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
            CONSTRAINT fk_daily_completion_task FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
        )
    `);
}

export async function getTodayDailyChallengeStatus(userId) {
    let connection;

    try {
        connection = await db.getConnection();
        await ensureDailyCompletionTable(connection);

        const today = getWarsawDateString();
        const [[totalRow]] = await connection.query(
            `
            SELECT COUNT(*) AS totalCount
            FROM daily_assignments
            WHERE assignment_date = ?
            `,
            [today]
        );

        let completedTaskIds = [];

        if (userId) {
            const [completionRows] = await connection.query(
                `
                SELECT dc.task_id
                FROM daily_challenge_completions dc
                JOIN daily_assignments da
                    ON da.task_id = dc.task_id
                    AND da.assignment_date = dc.assignment_date
                WHERE dc.user_id = ?
                    AND dc.assignment_date = ?
                ORDER BY dc.created_at ASC
                `,
                [userId, today]
            );

            completedTaskIds = completionRows.map((row) => row.task_id);
        }

        return {
            date: today,
            completedTaskIds,
            completedCount: completedTaskIds.length,
            totalCount: Number(totalRow?.totalCount || 0),
        };
    } finally {
        if (connection) connection.release();
    }
}
