'use client';

import { useState } from 'react';
import styles from './TopBar.module.css';
import Image from 'next/image';

const SUBJECTS = [
    { name: 'Matematyka', icon: '/assets/img/topbar/matma-icon.svg' },
    { name: 'Chemia', icon: '/assets/img/topbar/chemia-icon.svg' },
    { name: 'Biologia', icon: '/assets/img/topbar/biologia-icon.svg' },
    { name: 'Fizyka', icon: '/assets/img/topbar/fizyka-icon.svg' },
];

export default function Topbar({ children }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);

    const handleSubjectChange = (subject) => {
        setSelectedSubject(subject);
        setIsDropdownOpen(false);
    };

    const sortedSubjects = [
        selectedSubject,
        ...SUBJECTS.filter(s => s.name !== selectedSubject.name)
    ];

    return (
        <div className={styles.wrapper}>
            <header className={styles.topbar}>
                <div 
                    className={`${styles.subject_selector} ${isDropdownOpen ? styles.hidden : ''}`} 
                    onClick={() => setIsDropdownOpen(true)}
                >
                    <div className={styles.dropdown_img_prefix}>
                        <Image
                        src={'/assets/img/topbar/up-icon.svg'}
                        alt="up icon"
                        width={32}
                        height={32}
                        />
                    </div>
                    
                    <Image
                        src={selectedSubject.icon}
                        alt="subject icon"
                        width={32}
                        height={32}
                    />
                    <span className={styles.subject_name}>{selectedSubject.name}</span>
                </div>

                <div className={styles.user_info}>
                    <div className={styles.stat_item}>
                        <Image src='/assets/img/topbar/points-icon.svg' alt="points" width={32} height={32} />
                        <span className={styles.stat_value}>1450</span>
                    </div>
                    <div className={styles.stat_item}>
                        <Image src='/assets/img/topbar/fire-icon.svg' alt="fire" width={32} height={32} />
                        <span className={styles.streak_value}>20</span>
                    </div>
                    <div className={styles.user_avatar}>
                        <Image src='/assets/img/topbar/user-icon.svg' alt="user" width={56} height={56} className={styles.avatar_image} />
                    </div>
                </div>
            </header>

            {isDropdownOpen && (
                <div className={styles.dropdown_overlay} onClick={() => setIsDropdownOpen(false)}>
                    <div className={styles.dropdown_card} onClick={(e) => e.stopPropagation()}>
                        {sortedSubjects.map((subject, index) => {
                            return (
                                <div 
                                    key={subject.name} 
                                    className={`${styles.dropdown_item} ${index === 0 ? styles.active_item : ''}`}
                                    onClick={() => handleSubjectChange(subject)}
                                >
                                    <div className={styles.item_prefix}>
                                        {index === 0 ? (
                                            <Image
                                                src='/assets/img/topbar/down-icon.svg'
                                                alt="down icon"
                                                width={32}
                                                height={32}
                                            />
                                        ) : (
                                            <div style={{ width: 32 }} />
                                        )}
                                    </div>
                                    <Image
                                        src={subject.icon}
                                        alt={`${subject.name} icon`}
                                        width={32}
                                        height={32}
                                    />
                                    <span className={styles.subject_name}>{subject.name}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className={styles.body}>
                <main className={styles.content}>
                    {children}
                </main>
            </div>
        </div>
    );
}