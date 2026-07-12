import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';
import { getCoursesForUser } from '@/app/lib/services/courses';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const session = getSession(request);
    const userId = searchParams.get('userId') || session.userId;

    try {
        const courses = await getCoursesForUser({ userId, isAdmin: session.isAdmin });
        return NextResponse.json(courses);
    } catch (error) {
        console.error('PEŁNY BŁĄD SQL:', error.message);
        return NextResponse.json({
            error: 'Błąd struktury bazy danych',
            details: error.message
        }, { status: 500 });
    }
}
