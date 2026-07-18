import pool from './db';

async function runMigrations() {
    const connection = await pool.getConnection();
    try {
        // 1. tasks.sort_order
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

        // 2. daily_challenge_completions
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

        // 3. auth_credentials + auth_tokens
        await connection.query(`
            CREATE TABLE IF NOT EXISTS auth_credentials (
                credential_id INT NOT NULL AUTO_INCREMENT,
                user_id INT NOT NULL,
                login_name VARCHAR(191) NOT NULL,
                password_salt VARCHAR(191) NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                is_admin TINYINT(1) NOT NULL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (credential_id),
                UNIQUE KEY uniq_login_name (login_name),
                UNIQUE KEY uniq_credential_user (user_id),
                CONSTRAINT fk_auth_credentials_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS auth_tokens (
                token_id INT NOT NULL AUTO_INCREMENT,
                user_id INT NOT NULL,
                token VARCHAR(20) NOT NULL,
                expires_at DATETIME NOT NULL,
                is_used TINYINT(1) NOT NULL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (token_id),
                KEY idx_auth_tokens_user (user_id),
                CONSTRAINT fk_auth_tokens_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
            )
        `);

        // 4. task_completions
        await connection.query(`
            CREATE TABLE IF NOT EXISTS task_completions (
                completion_id INT NOT NULL AUTO_INCREMENT,
                user_id INT NOT NULL,
                task_id INT NOT NULL,
                points_awarded INT NOT NULL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (completion_id),
                UNIQUE KEY uniq_task_completion (user_id, task_id),
                KEY idx_task_completion_user (user_id),
                CONSTRAINT fk_task_completion_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                CONSTRAINT fk_task_completion_task FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
            )
        `);

        // tu dodamy wszystkie schematy zeby ulatwic migracje w przyszlosci
        
    } finally {
        connection.release();
    }
}
