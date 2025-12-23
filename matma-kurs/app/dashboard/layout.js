import styles from './layout.module.css';

export default function DashboardLayout({ children }) {
    return (
    <div className={styles.container}>
        <div className={styles.sidebar}>
            <h3>Menu</h3>
            <ul>
                <li>Dashboard</li>
                <li>Kursy</li>
                <li>Matematyka podstawowa</li>
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
