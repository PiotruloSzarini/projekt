// app/dashboard/layout.js
import { cookies } from 'next/headers';
import { CourseProvider } from '@/app/context/CourseContext';
import { UserProvider } from '@/app/context/UserContext';
import DashboardClientWrapper from './layoutDashboardWrapper';

export default async function DashboardLayout({ children }) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('session_user_id')?.value;

    return (
        <UserProvider userId={userId}>
            <CourseProvider initialUserId={userId}>
                <DashboardClientWrapper>
                    {children}
                </DashboardClientWrapper>
            </CourseProvider>
        </UserProvider>
    );
}