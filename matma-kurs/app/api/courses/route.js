import { NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';
import { getCoursesForUser } from '@/app/lib/services/courses';

export async function GET(request) {
    const session = getSession(request);

    try {
        const courses = await getCoursesForUser({ userId: session.userId, isAdmin: session.isAdmin });
        return NextResponse.json(courses);
    } catch (error) {
        console.error('GET /api/courses error:', error);
        return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
    }
}
