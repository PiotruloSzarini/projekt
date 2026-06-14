import { cookies } from 'next/headers';
import styles from './layout.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { UserProvider } from '@/app/context/UserContext';
import { CourseProvider } from '@/app/context/CourseContext';
import AdminDashboardWrapper from './layoutWrapper';

const ADMIN_LINKS = [
    { href: '/admin/dashboard/courses', label: 'admin kursy', icon: '/assets/img/dashboardLayoutIcons/kursy.svg' },
    { href: '/admin/dashboard/mathdle', label: 'admin mathdle', icon: '/assets/img/dashboardLayoutIcons/daily-challange.svg' },
    { href: '/admin/dashboard/tasks', label: 'admin baza danych', icon: '/assets/img/dashboardLayoutIcons/baza-zadan.svg' },
];

export default async function AdminLayout({ children }) {
    const cookieStore = await cookies();
    const userId = cookieStore.get('session_user_id')?.value;
    const userRole = cookieStore.get('session_user_role')?.value || 'user';

    return (
        <UserProvider userId={userId}>
            <CourseProvider initialUserId={userId} initialUserRole={userRole}>
                <AdminDashboardWrapper>
                    <div className={styles.container}>
                        <aside className={styles.sidebar}>
                            <div className={styles.logo}>
                                <Image
                                    src="/assets/img/OMM_LOGO.svg"
                                    alt="Logo"
                                    width={120}
                                    height={60}
                                    priority
                                />
                            </div>

                            <nav className={styles.sidebar_links_div}>
                                {ADMIN_LINKS.map((link) => (
                                    <Link key={link.href} href={link.href} className={styles.sidebar_link}>
                                        <Image src={link.icon} alt="" width={24} height={24} />
                                        <span className={styles.sidebar_link_link}>{link.label}</span>
                                    </Link>
                                ))}
                            </nav>
                        </aside>

                        <div className={styles.wrapper}>
                            {children}
                        </div>
                    </div>
                </AdminDashboardWrapper>
            </CourseProvider>
        </UserProvider>
    );
}
