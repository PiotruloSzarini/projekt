import styles from './layout.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { CourseProvider } from '@/app/context/CourseContext';


export default function DashboardLayout({ children }) {
    return (
    <CourseProvider>
    <div className={styles.container}>
        <div className={styles.sidebar}>
            <div className={styles.logo}>
                <Image
                    src="/assets/img/OMM_LOGO.svg"
                    alt="Logo"
                    width={120}
                    height={60}
                    priority
                /> 
            </div>

            <div className={styles.sidebar_links_div}>
                <div className={`${styles.sidebar_link} ${styles.sidebar_active}`}>
                    <Image
                        src="/assets/img/Kursy_logo.svg"
                        alt="test"
                        width={24}
                        height={24}
                    />
                    <Link href="/dashboard" className={styles.sidebar_link_link}>Mój postęp</Link>
                </div>

                <div className={styles.sidebar_link}>
                    <Image
                        src="/assets/img/Kursy_logo.svg"
                        alt="test"
                        width={24}
                        height={24}
                    />
                    <Link href="/dashboard/kursy" className={styles.sidebar_link_link}>Kursy</Link>
                </div>

                <div className={styles.sidebar_link}>
                    <Image
                        src="/assets/img/Kursy_logo.svg"
                        alt="test"
                        width={24}
                        height={24}
                    />
                    <Link href="/dashboard/egzaminy" className={styles.sidebar_link_link}>Egzaminy</Link>
                </div>

                <div className={styles.sidebar_link}>
                    <Image
                        src="/assets/img/Kursy_logo.svg"
                        alt="test"
                        width={24}
                        height={24}
                    />
                    <Link href="/dashboard/ranking" className={styles.sidebar_link_link}>Ranking</Link>
                </div>

                <div className={styles.sidebar_link}>
                    <Image
                        src="/assets/img/Kursy_logo.svg"
                        alt="test"
                        width={24}
                        height={24}
                    />
                    <Link href="/dashboard/mathdle" className={styles.sidebar_link_link}>mathdle</Link>
                </div>

                <div className={styles.sidebar_link}>
                    <Image
                        src="/assets/img/Kursy_logo.svg"
                        alt="test"
                        width={24}
                        height={24}
                    />
                    <Link href="/dashboard/plan-nauki" className={styles.sidebar_link_link}>Plan Nauki</Link>
                </div>

                <div className={styles.sidebar_link}>
                    <Image
                        src="/assets/img/Kursy_logo.svg"
                        alt="test"
                        width={24}
                        height={24}
                    />
                    <Link href="/dashboard/baza-zadan" className={styles.sidebar_link_link}>Baza zadań</Link>
                </div>

                <div className={styles.sidebar_link}>
                    <Image
                        src="/assets/img/Kursy_logo.svg"
                        alt="test"
                        width={24}
                        height={24}
                    />
                    <Link href="/dashboard/slabe-punkty" className={styles.sidebar_link_link}>Słabe punkty</Link>
                </div>
            </div>



            <ul>
                <li>
                    <Link href="/dashboard/testy-zadan">Testy zadan</Link>
                </li>
                <li>
                    <Link href="/dashboard/testing">Testy komponentnow</Link>
                </li>
            </ul>
        </div>
        <div className={styles.wrapper}>
            <header className={styles.topbar}>
                <input
                    type="text"
                    placeholder="Szukaj..."
                    className={styles.search}
                />
                <div className={styles.userIcon}>ikonka</div>
            </header>
            <div className={styles.body}>
                
                <main className={styles.content}>
                    {children}
                </main>
            </div>
        </div>
    </div>
    </CourseProvider>
    );
}
