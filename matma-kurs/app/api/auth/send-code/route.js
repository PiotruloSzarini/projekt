import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import pool from '../../../lib/db';

function normalizeLoginName(value) {
    return String(value ?? '').trim();
}

function makePlaceholderEmail(loginName) {
    const safeName = normalizeLoginName(loginName).toLowerCase().replace(/\s+/g, '.');
    return `${safeName || 'user'}@mathdle.local`;
}

function hashPassword(password, salt) {
    return crypto.scryptSync(String(password), salt, 64).toString('hex');
}

async function ensureAuthTables(connection) {
    await connection.execute(`
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

    await connection.execute(`
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
}

async function ensureUserStatsRow(connection, userId) {
    await connection.execute(
        `
        INSERT INTO user_stats (user_id, total_points, tasks_completed, videos_watched, daily_completed, weak_points_completed, level)
        VALUES (?, 0, 0, 0, 0, 0, 1)
        ON DUPLICATE KEY UPDATE user_id = user_id
        `,
        [userId]
    );
}

async function createCredentials(connection, { loginName, password, isAdmin = false }) {
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);
    const email = makePlaceholderEmail(loginName);

    const [userResult] = await connection.execute(
        'INSERT INTO users (name, email, avatar_url) VALUES (?, ?, ?)',
        [loginName, email, null]
    );

    const userId = userResult.insertId;

    await connection.execute(
        `
        INSERT INTO auth_credentials (user_id, login_name, password_salt, password_hash, is_admin)
        VALUES (?, ?, ?, ?, ?)
        `,
        [userId, loginName, salt, passwordHash, isAdmin ? 1 : 0]
    );

    await ensureUserStatsRow(connection, userId);

    return userId;
}

export async function POST(request) {
    const connection = await pool.getConnection();

    try {
        const body = await request.json();
        const loginName = normalizeLoginName(body.name ?? body.loginName ?? body.userId);
        const password = String(body.password ?? '').trim();
        const mode = String(body.mode ?? 'login').trim().toLowerCase();

        if (!loginName) {
            return NextResponse.json({ error: 'Podaj nazwę użytkownika' }, { status: 400 });
        }

        if (!password) {
            return NextResponse.json({ error: 'Podaj hasło' }, { status: 400 });
        }

        await ensureAuthTables(connection);

        let [credentialRows] = await connection.execute(
            `
            SELECT ac.*, u.user_id, u.name
            FROM auth_credentials ac
            JOIN users u ON u.user_id = ac.user_id
            WHERE ac.login_name = ?
            LIMIT 1
            `,
            [loginName]
        );

        let credential = credentialRows[0] || null;

        if (!credential && loginName.toLowerCase() === 'admin' && password === 'admin123') {
            const adminUserId = await createCredentials(connection, {
                loginName: 'admin',
                password: 'admin123',
                isAdmin: true,
            });

            [credentialRows] = await connection.execute(
                `
                SELECT ac.*, u.user_id, u.name
                FROM auth_credentials ac
                JOIN users u ON u.user_id = ac.user_id
                WHERE ac.user_id = ?
                LIMIT 1
                `,
                [adminUserId]
            );

            credential = credentialRows[0] || null;
        }

        if (!credential && loginName.toLowerCase() === 'test' && password === 'test123') {
            const testUserId = await createCredentials(connection, {
                loginName: 'test',
                password: 'test123',
                isAdmin: false,
            });

            [credentialRows] = await connection.execute(
                `
                SELECT ac.*, u.user_id, u.name
                FROM auth_credentials ac
                JOIN users u ON u.user_id = ac.user_id
                WHERE ac.user_id = ?
                LIMIT 1
                `,
                [testUserId]
            );

            credential = credentialRows[0] || null;
        }

        if (!credential && mode === 'register') {
            const [existingUsers] = await connection.execute(
                'SELECT user_id FROM users WHERE name = ? LIMIT 1',
                [loginName]
            );

            if (existingUsers.length > 0) {
                return NextResponse.json({ error: 'Taka nazwa jest już zajęta' }, { status: 409 });
            }

            const newUserId = await createCredentials(connection, {
                loginName,
                password,
                isAdmin: false,
            });

            [credentialRows] = await connection.execute(
                `
                SELECT ac.*, u.user_id, u.name
                FROM auth_credentials ac
                JOIN users u ON u.user_id = ac.user_id
                WHERE ac.user_id = ?
                LIMIT 1
                `,
                [newUserId]
            );

            credential = credentialRows[0] || null;
        }

        if (!credential) {
            return NextResponse.json({ error: 'Nie znaleziono konta. Możesz utworzyć nowe.' }, { status: 404 });
        }

        const expectedHash = hashPassword(password, credential.password_salt);
        const isPasswordValid = expectedHash === credential.password_hash;

        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Nieprawidłowe hasło' }, { status: 401 });
        }

        const mockCode = crypto.randomInt(100000, 1000000).toString();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);

        await connection.execute(
            'INSERT INTO auth_tokens (user_id, token, expires_at, is_used) VALUES (?, ?, ?, ?)',
            [credential.user_id, mockCode, expiresAt, false]
        );

        return NextResponse.json({
            success: true,
            code: mockCode,
            userId: credential.user_id,
            isAdmin: Number(credential.is_admin) === 1,
            message: 'Kod wygenerowany pomyślnie',
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        connection.release();
    }
}
