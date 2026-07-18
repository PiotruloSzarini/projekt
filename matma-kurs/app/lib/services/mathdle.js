import db from '@/app/lib/db';

export function getWarsawDateString(date = new Date()) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Warsaw',
    }).format(date);
}

export async function getTodayDailyChallengeStatus(userId) {
    let connection;

    try {
        connection = await db.getConnection();

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
