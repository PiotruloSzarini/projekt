import styles from './layout.module.css';
import Link from 'next/link';

export default function DashboardLayout({ children }) {
    return (
    <div className={styles.container}>
        <div className={styles.sidebar}>
            <ul>
                <li>
                    <Link href="/dashboard">Mój postęp</Link>
                </li>
                <li>
                    <Link href="/dashboard/kursy">Kursy</Link>
                </li>
                <li>
                    <Link href="/dashboard/egzaminy">Egzaminy</Link>
                </li>
                <li>
                    <Link href="/dashboard/ranking">Ranking</Link>
                </li>
                <li>
                    <Link href="/dashboard/daily-challange">Daily Challange</Link>
                </li>
                <li>
                    <Link href="/dashboard/plan-nauki">Plan Nauki</Link>
                </li>
                <li>
                    <Link href="/dashboard/baza-zadan">Baza zadań</Link>
                </li>
                <li>
                    <Link href="/dashboard/slabe-punkty">Słabe punkty</Link>
                </li>
                <li>
                    <Link href="/dashboard/testy-zadan">Testy zadan</Link>
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
    
    );
}
