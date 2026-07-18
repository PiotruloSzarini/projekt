// app/dashboard/layout.js
import { cookies } from 'next/headers';
import { CourseProvider } from '@/app/context/CourseContext';
import { UserProvider } from '@/app/context/UserContext';
import { getSessionFromCookies } from '@/app/lib/session';
import DashboardClientWrapper from './layoutDashboardWrapper';

export default async function DashboardLayout({ children }) {
    const cookieStore = await cookies();
    const { userId, isAdmin } = await getSessionFromCookies(cookieStore);
    const userRole = isAdmin ? 'admin' : 'user';

    return (
        <UserProvider userId={userId}>
            <CourseProvider initialUserId={userId} initialUserRole={userRole}>
                <DashboardClientWrapper>
                    {children}
                </DashboardClientWrapper>
            </CourseProvider>
        </UserProvider>
    );
}
