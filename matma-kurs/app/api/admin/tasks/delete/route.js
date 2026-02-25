import { NextResponse } from "next/server";
import pool from "@/app/lib/db";
import cloudinary from "@/app/lib/cloudinary"; // Importujemy naszą konfigurację

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const task_id = searchParams.get('task_id');

        if (!task_id) {
            return NextResponse.json({ error: "Brak parametru task_id" }, { status: 400 });
        }

        // 1. POBIERAMY URL-E ZDJĘĆ ZANIM USUNIEMY REKORDY
        // Musimy sprawdzić math_img w tasks oraz zdjęcia w parach
        const [taskData] = await pool.execute(
            `SELECT math_img FROM tasks WHERE task_id = ?`, [task_id]
        );
        
        const [pairImages] = await pool.execute(
            `SELECT left_photo_url, right_photo_url FROM task_matching_pairs_items 
             WHERE task_pair_id IN (SELECT task_pair_id FROM task_matching_pairs WHERE task_id = ?)`,
            [task_id]
        );

        if (taskData.length === 0) {
            return NextResponse.json({ error: "Zadanie nie istnieje." }, { status: 404 });
        }

        // Zbierz wszystkie URL-e do usunięcia
        const imagesToDelete = [];
        if (taskData[0].math_img) imagesToDelete.push(taskData[0].math_img);
        
        pairImages.forEach(img => {
            if (img.left_photo_url) imagesToDelete.push(img.left_photo_url);
            if (img.right_photo_url) imagesToDelete.push(img.right_photo_url);
        });

        // 2. FUNKCJA POMOCNICZA DO USUWANIA Z CLOUDINARY
        const deleteFromCloudinary = async (url) => {
            try {
                // Wyciągamy public_id z URL (Cloudinary tego potrzebuje do usunięcia)
                // Przykład: https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg -> sample
                const parts = url.split('/');
                const fileName = parts[parts.length - 1].split('.')[0]; 
                // Jeśli masz foldery, musisz dodać folder do public_id
                await cloudinary.uploader.destroy(fileName);
            } catch (err) {
                console.error("Błąd podczas usuwania pliku z Cloudinary:", url, err);
            }
        };

        // 3. USUNIĘCIE Z BAZY DANYCH
        // ON DELETE CASCADE zajmie się resztą tabel
        await pool.execute(`DELETE FROM tasks WHERE task_id = ?`, [task_id]);

        // 4. USUNIĘCIE Z CLOUDINARY (po udanym usunięciu z bazy)
        // Robimy to asynchronicznie, żeby nie blokować odpowiedzi dla użytkownika
        if (imagesToDelete.length > 0) {
            Promise.all(imagesToDelete.map(url => deleteFromCloudinary(url)));
        }

        return NextResponse.json({ 
            success: true, 
            message: `Zadanie ID:${task_id} oraz powiązane pliki graficzne zostały usunięte.` 
        });

    } catch (error) {
        console.error("DELETE TASK ERROR:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}