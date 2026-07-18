import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionFromCookies } from '@/app/lib/session';
import styles from './page.module.css';

export default async function HomePage() {
    const cookieStore = await cookies();
    const { userId, isAdmin } = await getSessionFromCookies(cookieStore);

    if (!userId) {
        redirect('/login');
    }

    if (!isAdmin) {
        redirect('/dashboard');
    }

    return (
        <main className={styles.container}>
            <div className={styles.panel}>
                <p className={styles.kicker}>Zalogowano jako administrator</p>
                <h1 className={styles.title}>Wybierz panel</h1>
                <p className={styles.subtitle}>Masz dostęp do dashboardu użytkownika i panelu administracyjnego.</p>

                <div className={styles.actions}>
                    <Link href="/dashboard" className={styles.button}>
                        Przejdź do dashboardu
                    </Link>
                    <Link href="/admin" className={`${styles.button} ${styles.button_secondary}`}>
                        Przejdź do admin panelu
                    </Link>
                </div>
            </div>
        </main>
    );
}
