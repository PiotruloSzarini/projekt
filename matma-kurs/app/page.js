import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import styles from './page.module.css';

export default async function HomePage() {
    const cookieStore = await cookies();
    const session = cookieStore.get('session_user_id')?.value;
    const role = cookieStore.get('session_user_role')?.value || 'user';

    if (!session) {
        redirect('/login');
    }

    if (role !== 'admin') {
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
