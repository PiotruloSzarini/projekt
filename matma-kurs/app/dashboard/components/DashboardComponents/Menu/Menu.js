'use client';

import styles from './Menu.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCourseData } from '@/app/context/CourseContext';

export default function Menu({ isCollapsed = false, onToggle }) {
    const pathname = usePathname();

    const MENU_LINKS = [
        { href: '/dashboard', label: 'Home', icon: '/assets/img/menu/home-icon.svg' },
        { href: '/dashboard/egzaminy', label: 'Egzaminy', icon: '/assets/img/menu/exam-icon.svg' },
        { href: '/dashboard/ranking', label: 'Ranking', icon: '/assets/img/menu/rank-icon.svg' },
        { href: '/dashboard/mathdle', label: 'Daily Challenge', icon: '/assets/img/menu/game-icon.svg' },
        { href: '/dashboard/plan-nauki', label: 'Plan Nauki', icon: '/assets/img/menu/calendar-icon.svg' },
    ];
    const { userId } = useCourseData();
    console.log("Zalogowany użytkownik to:", userId);

    return (
        <div className={styles.container}>
            <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
                
                <div className={styles.logo}>
                    <Link href="/dashboard">
                    <Image
                        src="/assets/img/OMM_LOGO.svg"
                        alt="Logo"
                        width={94}
                        height={32}
                        priority
                    /> 
                    </Link>
                </div>

                <div className={styles.sidebar_links_div}>
                    {MENU_LINKS.map((link) => {
                        const isActive = link.href === '/dashboard' 
                            ? pathname === '/dashboard' 
                            : pathname.startsWith(link.href);

                        return (
                            <div 
                                key={link.href} 
                                className={`${styles.sidebar_link} ${isActive ? styles.sidebar_active : ''}`}
                            >
                                <Link href={link.href} className={styles.sidebar_link_link}>
                                    <Image
                                        src={link.icon}
                                        alt={`${link.label} icon`}
                                        width={32}
                                        height={32}
                                    />
                                    <span className={styles.sidebar_link_text}>
                                        {link.label}
                                    </span>
                                </Link>
                            </div>
                        );
                    })}
                </div>
                <div className={styles.sidebar_collapse_container}>
                    <button 
                        className={`${styles.collapse_button} ${isCollapsed ? styles.rotate : ''}`}
                        onClick={onToggle}
                        aria-label={isCollapsed ? "Rozwiń menu" : "Zwiń menu"}
                    >
                        <Image
                            src={isCollapsed ? "/assets/img/menu/unfold-icon.svg" : "/assets/img/menu/fold-icon.svg"}
                            alt={isCollapsed ? "Rozwiń menu" : "Zwiń menu"}
                            className={styles.collapse_icon}
                            width={40}
                            height={40}
                        />
                    </button>
                </div>

                {!isCollapsed && (
                    <ul className={styles.extra_links}>
                        <li><Link href="/dashboard/testing">Testy komponentów</Link></li>
                        <p>Id uzytkownika: {userId}</p>
                    </ul>
                )}
            </div>
        </div>
    );
}
