import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import cloudinary from '@/app/lib/cloudinary';
import { requireAdmin } from '@/app/lib/session';

export async function DELETE(request) {
    const { response } = await requireAdmin(request);
    if (response) return response;

    let connection;

    try {
        const { searchParams } = new URL(request.url);
        const task_id = searchParams.get('task_id');

        if (!task_id) {
            return NextResponse.json({ error: 'Brak parametru task_id' }, { status: 400 });
        }

        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [taskData] = await connection.execute(
            'SELECT math_img FROM tasks WHERE task_id = ?',
            [task_id]
        );

        if (taskData.length === 0) {
            await connection.rollback();
            return NextResponse.json({ error: 'Zadanie nie istnieje.' }, { status: 404 });
        }

        const [imagesToDeleteRows] = await connection.execute(
            `
            SELECT left_photo_url AS url FROM task_matching_pairs_items
            WHERE task_pair_id IN (SELECT task_pair_id FROM task_matching_pairs WHERE task_id = ?)
            UNION ALL
            SELECT right_photo_url AS url FROM task_matching_pairs_items
            WHERE task_pair_id IN (SELECT task_pair_id FROM task_matching_pairs WHERE task_id = ?)
            `,
            [task_id, task_id]
        );

        const imagesToDelete = [];
        if (taskData[0].math_img) imagesToDelete.push(taskData[0].math_img);
        imagesToDeleteRows.forEach((row) => {
            if (row.url) imagesToDelete.push(row.url);
        });

        await connection.execute(
            'DELETE FROM task_explanation_steps WHERE explanation_id IN (SELECT explanation_id FROM task_explanation WHERE task_id = ?)',
            [task_id]
        );
        await connection.execute('DELETE FROM task_explanation WHERE task_id = ?', [task_id]);

        await connection.execute('DELETE FROM task_hints WHERE task_id = ?', [task_id]);

        await connection.execute(
            'DELETE FROM task_step_by_step_steps WHERE task_step_by_step_id IN (SELECT task_step_by_step_id FROM task_step_by_step WHERE task_id = ?)',
            [task_id]
        );
        await connection.execute('DELETE FROM task_step_by_step WHERE task_id = ?', [task_id]);

        await connection.execute(
            'DELETE FROM task_matching_pairs_items WHERE task_pair_id IN (SELECT task_pair_id FROM task_matching_pairs WHERE task_id = ?)',
            [task_id]
        );
        await connection.execute('DELETE FROM task_matching_pairs WHERE task_id = ?', [task_id]);

        await connection.execute(
            'DELETE FROM task_multiple_choice_answers WHERE task_multiple_id IN (SELECT task_multiple_id FROM task_multiple_choice WHERE task_id = ?)',
            [task_id]
        );
        await connection.execute('DELETE FROM task_multiple_choice WHERE task_id = ?', [task_id]);

        await connection.execute('DELETE FROM task_single_input WHERE task_id = ?', [task_id]);
        await connection.execute('DELETE FROM daily_assignments WHERE task_id = ?', [task_id]);
        await connection.execute('DELETE FROM tasks WHERE task_id = ?', [task_id]);

        await connection.commit();
        connection.release();

        const deleteFromCloudinary = async (url) => {
            try {
                // Extract public_id from Cloudinary URL, preserving folder path.
                // URL format: .../upload/v1234567/folder/filename.ext
                // public_id = everything after /upload/(vNNNN/)  without the extension
                const uploadIdx = url.indexOf('/upload/');
                if (uploadIdx === -1) return;
                let publicId = url.slice(uploadIdx + '/upload/'.length);
                publicId = publicId.replace(/^v\d+\//, '');
                publicId = publicId.replace(/\.[^/.]+$/, '');
                await cloudinary.uploader.destroy(publicId);
            } catch (err) {
                console.error('Błąd podczas usuwania pliku z Cloudinary:', url, err);
            }
        };

        if (imagesToDelete.length > 0) {
            Promise.all(imagesToDelete.map((url) => deleteFromCloudinary(url)));
        }

        return NextResponse.json({
            success: true,
            message: `Zadanie ID:${task_id} oraz powiązane pliki graficzne zostały usunięte.`,
        });
    } catch (error) {
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error('Błąd rollback:', rollbackError);
            }
            connection.release();
        }

        console.error('DELETE TASK ERROR:', error);

        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
            return NextResponse.json(
                { error: 'Element zawiera dane (podelementy). Usuń je najpierw, aby móc usunąć ten poziom.' },
                { status: 409 }
            );
        }

        console.error(error);
        return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
    }
}
