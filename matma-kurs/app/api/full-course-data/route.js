import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';
import { getFullCourseData } from '@/app/lib/services/courses';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const session = getSession(request);
    const userId = searchParams.get('userId') || session.userId;

    if (!courseId) {
        return NextResponse.json({ error: 'Brak ID kursu' }, { status: 400 });
    }

    try {
        const courseData = await getFullCourseData({ courseId, userId, isAdmin: session.isAdmin });
        return NextResponse.json(courseData);
    } catch (error) {
        console.error('Błąd preloadu:', error);
        return NextResponse.json({ error: 'Błąd serwera podczas pobierania danych' }, { status: 500 });
    }
}
