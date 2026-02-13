import Link from 'next/link';
import styles from './page.module.css';

export default function AdminPage() {
    return (
    <main className={styles.container}>
        <h1 className={styles.title}>admin panel</h1>
    
        <Link href="/admin/dashboard">
            <button className={styles.button}>
            Przejdź do admin panel
            </button>
        </Link>
    </main>
    );
}