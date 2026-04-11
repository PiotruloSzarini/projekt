'use client';

import styles from './Menu.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Menu({ isCollapsed = false }) {
    const pathname = usePathname();

    const MENU_LINKS = [
        { href: '/dashboard', label: 'Home', icon: '/assets/img/menu/home-icon.svg' },
        { href: '/dashboard/egzaminy', label: 'Egzaminy', icon: '/assets/img/menu/exam-icon.svg' },
        { href: '/dashboard/ranking', label: 'Ranking', icon: '/assets/img/menu/rank-icon.svg' },
        { href: '/dashboard/mathdle', label: 'Daily Challenge', icon: '/assets/img/menu/game-icon.svg' },
        { href: '/dashboard/plan-nauki', label: 'Plan Nauki', icon: '/assets/img/menu/calendar-icon.svg' },
        { href: '/dashboard/slabe-punkty', label: 'Słabe punkty', icon: '/assets/img/menu/weak-icon.svg' },
    ];

    return (
        <div className={styles.container}>
            <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
                
                <div className={styles.logo}>
                    <Image
                        src="/assets/img/OMM_LOGO.svg"
                        alt="Logo"
                        width={94}
                        height={32}
                        priority
                    /> 
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

                {!isCollapsed && (
                    <ul className={styles.extra_links}>
                        <li><Link href="/dashboard/testy-zadan">Testy zadań</Link></li>
                        <li><Link href="/dashboard/testing">Testy komponentów</Link></li>
                    </ul>
                )}
            </div>
        </div>
    );
}