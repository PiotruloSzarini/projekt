'use client';

import { useEffect } from 'react';
import styles from './ChapterInfo.module.css';
import Link from 'next/link';


export default function ChapterInfo({
    courseName,
    progress,
    link,
    backgroundColor,
    children
}) {
    
    useEffect(() => {
        import('js-circle-progress');
    }, []);

    return (
        <div className={styles.rozdzialInfo_div_container}>
            <div className={styles.rozdzialInfo_div_main} style={{backgroundColor: backgroundColor}}>
                <div className={styles.rozdzialInfo_div_info}>
                    <div className={styles.rozdzialInfo_div_info_text}>
                        <h1>{courseName}</h1>
                        <p>Postęp ukończenia kursu:</p>
                    </div>
                    <div className={styles.rozdzialInfo_div_info_continue}>
                        <Link href={link} className={styles.rozdzialInfo_div_info_continue_link}>
                            <p>Kontynuuj naukę</p>
                        </Link>
                    </div>
                </div>
                <div className={styles.rozdzialInfo_div_progress}>
                    <circle-progress 
                        value={progress} 
                        max="100"
                        text-format="percent"
                        className={styles.customCircle}
                    ></circle-progress>
                </div>
            </div>
            <div className={styles.rozdzialInfo_div_chapters}>
                {children}
            </div>
        </div>
    );
}