"use server";

import db from '@/app/lib/db'; // Twój prawidłowy import bazy

// 1. POBIERANIE ZADAŃ
export async function fetchTasksFromDB(userId) {
    let connection;
    try {
        connection = await db.getConnection(); //
        const [rows] = await connection.query(
            'SELECT id, title, DATE_FORMAT(task_date, "%Y-%m-%d") as task_date, is_completed FROM user_task_plan WHERE user_id = ?', 
            [userId]
        );
        return JSON.parse(JSON.stringify(rows)); // Bezpieczne parsowanie dla komponentu Client
    } catch (error) {
        console.error("Błąd pobierania zadań:", error);
        return [];
    } finally {
        if (connection) connection.release();
    }
}

// 2. DODAWANIE ZADANIA
export async function addTaskToDB(userId, title, date) {
    let connection;
    try {
        connection = await db.getConnection(); //
        const [result] = await connection.query(
            'INSERT INTO user_task_plan (user_id, task_date, title, is_completed) VALUES (?, ?, ?, 0)',
            [userId, date, title]
        );
        return {
            id: result.insertId,
            user_id: userId,
            task_date: date,
            title: title,
            is_completed: 0
        };
    } catch (error) {
        console.error("Błąd dodawania zadania:", error);
        return null;
    } finally {
        if (connection) connection.release();
    }
}

// 3. ZMIANA STATUSU (CHECKBOX)
export async function toggleTaskInDB(userId, taskId) {
    let connection;
    try {
        connection = await db.getConnection(); //
        const [rows] = await connection.query(
            'SELECT is_completed FROM user_task_plan WHERE id = ? AND user_id = ?', 
            [taskId, userId]
        );
        if (rows.length === 0) return;

        const newStatus = rows[0].is_completed === 1 ? 0 : 1;
        await connection.query(
            'UPDATE user_task_plan SET is_completed = ? WHERE id = ? AND user_id = ?', 
            [newStatus, taskId, userId]
        );
    } catch (error) {
        console.error("Błąd zmiany statusu:", error);
    } finally {
        if (connection) connection.release();
    }
}

// 4. USUWANIE ZADANIA
export async function deleteTaskFromDB(userId, taskId) {
    let connection;
    try {
        connection = await db.getConnection(); //
        await connection.query(
            'DELETE FROM user_task_plan WHERE id = ? AND user_id = ?', 
            [taskId, userId]
        );
    } catch (error) {
        console.error("Błąd usuwania zadania:", error);
    } finally {
        if (connection) connection.release();
    }
}