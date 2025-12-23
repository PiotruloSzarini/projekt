import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>dashboard</h1>
    
      <Link href="/dashboard">
        <button className={styles.button}>
          Przejdź do dashboardu
        </button>
      </Link>
    </main>
  );
}