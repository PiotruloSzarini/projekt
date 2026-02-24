import styles from './layout.module.css';
import Link from 'next/link';
import Image from 'next/image';


export default function AdminLayout({ children }) {
    return (
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
                <div className={styles.sidebar_link}>
                    <Image
                        src="/assets/img/Kursy_logo.svg"
                        alt="test"
                        width={24}
                        height={24}
                    />
                    <Link href="/admin/dashboard/courses" className={styles.sidebar_link_link}>admin kursy</Link>
                </div>
                <div className={styles.sidebar_link}>
                    <Image
                        src="/assets/img/Kursy_logo.svg"
                        alt="test"
                        width={24}
                        height={24}
                    />
                    <Link href="/admin/dashboard/tasks" className={styles.sidebar_link_link}>admin baza zadan</Link>
                </div>
            
                <div className={styles.sidebar_link}>
                    <Image
                        src="/assets/img/Kursy_logo.svg"
                        alt="test"
                        width={24}
                        height={24}
                    />
                    <Link href="/admin/dashboard/mathdle" className={styles.sidebar_link_link}>admin mathdle</Link>
                </div>
            </div>
        </div>
        <div className={styles.wrapper}>
                <div className={styles.body}>
                    <main className={styles.content}>
                        {children}
                    </main>
                </div>
            </div>
    </div>
    );
}
