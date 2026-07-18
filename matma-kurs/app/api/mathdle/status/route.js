import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/app/lib/session';
import { getTodayDailyChallengeStatus } from '@/app/lib/services/mathdle';

export async function GET(request) {
    try {
        const userId = await getSessionUserId(request);
        const status = await getTodayDailyChallengeStatus(userId);

        return NextResponse.json(status);
    } catch (error) {
        console.error('Błąd pobierania statusu daily challenge:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
