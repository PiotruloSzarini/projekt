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

async function findCredentialByLoginName(connection, loginName) {
    const [rows] = await connection.execute(
        `
        SELECT ac.*, u.user_id, u.name
        FROM auth_credentials ac
        JOIN users u ON u.user_id = ac.user_id
        WHERE LOWER(ac.login_name) = LOWER(?)
        LIMIT 1
        `,
        [loginName]
    );
    return rows[0] || null;
}

async function createAccount(connection, { loginName, password }) {
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(password, salt);
    const email = makePlaceholderEmail(loginName);

    const [userResult] = await connection.execute(
        'INSERT INTO users (name, email, avatar_url) VALUES (?, ?, ?)',
        [loginName, email, null]
    );
    const userId = userResult.insertId;

    await connection.execute(
        `INSERT INTO auth_credentials (user_id, login_name, password_salt, password_hash, is_admin)
         VALUES (?, ?, ?, ?, 0)`,
        [userId, loginName, salt, passwordHash]
    );

    await connection.execute(
        `INSERT INTO user_stats (user_id, total_points, tasks_completed, videos_watched, daily_completed, weak_points_completed, level)
         VALUES (?, 0, 0, 0, 0, 0, 1)
         ON DUPLICATE KEY UPDATE user_id = user_id`,
        [userId]
    );

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

        await connection.beginTransaction();

        let credential = await findCredentialByLoginName(connection, loginName);

        if (mode === 'register') {
            if (credential) {
                await connection.rollback();
                return NextResponse.json({ error: 'Taka nazwa jest już zajęta' }, { status: 409 });
            }

            await createAccount(connection, { loginName, password });
            credential = await findCredentialByLoginName(connection, loginName);
        } else {
            if (!credential) {
                await connection.rollback();
                return NextResponse.json(
                    { error: 'Nie znaleziono konta. Możesz utworzyć nowe.' },
                    { status: 404 }
                );
            }

            const expectedHash = hashPassword(password, credential.password_salt);
            if (expectedHash !== credential.password_hash) {
                await connection.rollback();
                return NextResponse.json({ error: 'Nieprawidłowe hasło' }, { status: 401 });
            }
        }
        // mock code generation
        const mockCode = crypto.randomInt(100000, 1000000).toString();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);

        await connection.execute(
            'INSERT INTO auth_tokens (user_id, token, expires_at, is_used) VALUES (?, ?, ?, ?)',
            [credential.user_id, mockCode, expiresAt, false]
        );

        await connection.commit();

        // TODO: docelowo wysyłać mockCode mailem zamiast zwracać go w froncie
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[DEV] Kod logowania dla "${loginName}": ${mockCode}`);
        }

        return NextResponse.json({
            success: true,
            userId: credential.user_id,
            isAdmin: Number(credential.is_admin) === 1,
            message: 'Kod wygenerowany pomyślnie',
            ...(process.env.NODE_ENV !== 'production' ? { code: mockCode } : {}),
        });
    } catch (error) {
        try {
            await connection.rollback();
        } catch (rollbackError) {
            console.error('Błąd rollback:', rollbackError);
        }
        console.error('SEND CODE ERROR:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    } finally {
        connection.release();
    }
}