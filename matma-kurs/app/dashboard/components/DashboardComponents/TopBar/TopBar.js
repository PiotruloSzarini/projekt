'use client';
/* eslint-disable @next/next/no-img-element */

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './TopBar.module.css';
import { useUser } from '@/app/context/UserContext';
import { useCourseData } from '@/app/context/CourseContext';

const SUBJECTS = [
    { name: 'Matematyka', icon: '/assets/img/topbar/matma-icon.svg' },
    { name: 'Chemia', icon: '/assets/img/topbar/chemia-icon.svg' },
    { name: 'Biologia', icon: '/assets/img/topbar/biologia-icon.svg' },
    { name: 'Fizyka', icon: '/assets/img/topbar/fizyka-icon.svg' },
];

export default function Topbar({ children }) {
    const router = useRouter();
    const { user, loading } = useUser();
    const { isAdmin } = useCourseData();
    const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);

    const handleSubjectChange = (subject) => {
        setSelectedSubject(subject);
        setIsSubjectDropdownOpen(false);
        setIsProfileMenuOpen(false);
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        setIsProfileMenuOpen(false);
        router.push('/login');
        router.refresh();
    };

    const sortedSubjects = [
        selectedSubject,
        ...SUBJECTS.filter((subject) => subject.name !== selectedSubject.name),
    ];

    const avatarSrc = user?.avatar_url || '/assets/img/topbar/user-icon.svg';
    const displayName = user?.name || 'Mój profil';

    return (
        <div className={styles.wrapper}>
            <header className={styles.topbar}>
                <div
                    className={`${styles.subject_selector} ${isSubjectDropdownOpen ? styles.hidden : ''}`}
                    onClick={() => {
                        setIsProfileMenuOpen(false);
                        setIsSubjectDropdownOpen(true);
                    }}
                    role="button"
                    tabIndex={0}
                >
                    <div className={styles.dropdown_img_prefix}>
                        <Image src="/assets/img/topbar/up-icon.svg" alt="up icon" width={32} height={32} />
                    </div>

                    <Image src={selectedSubject.icon} alt="subject icon" width={32} height={32} />
                    <span className={styles.subject_name}>{selectedSubject.name}</span>
                </div>

                <div className={styles.user_info}>
                    <div className={styles.stat_item}>
                        <Image src="/assets/img/topbar/points-icon.svg" alt="points" width={32} height={32} />
                        <span className={styles.stat_value}>{loading ? '...' : user?.total_points ?? 0}</span>
                    </div>
                    <div className={styles.stat_item}>
                        <Image src="/assets/img/topbar/fire-icon.svg" alt="fire" width={32} height={32} />
                        <span className={styles.streak_value}>{loading ? '...' : user?.current_streak ?? 0}</span>
                    </div>

                    {user ? (
                        <button
                            type="button"
                            className={styles.avatar_button}
                            onClick={() => {
                                setIsSubjectDropdownOpen(false);
                                setIsProfileMenuOpen((value) => !value);
                            }}
                            aria-label="Otwórz menu użytkownika"
                        >
                            <span className={styles.avatar_frame}>
                                <img src={avatarSrc} alt="avatar użytkownika" className={styles.avatar_image} />
                            </span>
                        </button>
                    ) : (
                        <Link href="/login" className={styles.login_button}>
                            Logowanie
                        </Link>
                    )}
                </div>
            </header>

            {isSubjectDropdownOpen && (
                <div className={styles.dropdown_overlay} onClick={() => setIsSubjectDropdownOpen(false)}>
                    <div className={styles.dropdown_card} onClick={(event) => event.stopPropagation()}>
                        {sortedSubjects.map((subject, index) => (
                            <div
                                key={subject.name}
                                className={`${styles.dropdown_item} ${index === 0 ? styles.active_item : ''}`}
                                onClick={() => handleSubjectChange(subject)}
                            >
                                <div className={styles.item_prefix}>
                                    {index === 0 ? (
                                        <Image
                                            src="/assets/img/topbar/down-icon.svg"
                                            alt="down icon"
                                            width={32}
                                            height={32}
                                        />
                                    ) : (
                                        <div style={{ width: 32 }} />
                                    )}
                                </div>
                                <Image src={subject.icon} alt={`${subject.name} icon`} width={32} height={32} />
                                <span className={styles.subject_name}>{subject.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {isProfileMenuOpen && (
                <div className={styles.profile_overlay} onClick={() => setIsProfileMenuOpen(false)}>
                    <div className={styles.profile_card} onClick={(event) => event.stopPropagation()}>
                        <div className={styles.profile_head}>
                            <span className={styles.profile_avatar_frame}>
                                <img src={avatarSrc} alt="avatar użytkownika" className={styles.avatar_image} />
                            </span>
                            <div>
                                <div className={styles.profile_name}>{displayName}</div>
                                <div className={styles.profile_meta}>Poziom {user?.level ?? 1} • ID {user?.user_id ?? '-'}</div>
                            </div>
                        </div>

                        <nav className={styles.profile_menu}>
                            {isAdmin && (
                                <div className={styles.admin_switcher}>
                                    <Link href="/dashboard" className={styles.switcher_item} onClick={() => setIsProfileMenuOpen(false)}>
                                        <span>Panel użytkownika</span>
                                    </Link>
                                    <Link href="/admin/dashboard" className={`${styles.switcher_item} ${styles.switcher_admin}`} onClick={() => setIsProfileMenuOpen(false)}>
                                        <span>Panel admina</span>
                                    </Link>
                                </div>
                            )}

                            <Link href="/dashboard/profil" className={styles.profile_menu_item} onClick={() => setIsProfileMenuOpen(false)}>
                                Mój profil
                            </Link>
                            <Link href="/dashboard/kursy" className={styles.profile_menu_item} onClick={() => setIsProfileMenuOpen(false)}>
                                Kupione kursy
                            </Link>
                            <Link href="/dashboard" className={styles.profile_menu_item} onClick={() => setIsProfileMenuOpen(false)}>
                                Panel główny
                            </Link>
                        </nav>

                        <button type="button" className={styles.logout_button} onClick={handleLogout}>
                            Wyloguj się
                        </button>
                    </div>
                </div>
            )}

            <div className={styles.body}>
                <main className={styles.content}>{children}</main>
            </div>
        </div>
    );
}
