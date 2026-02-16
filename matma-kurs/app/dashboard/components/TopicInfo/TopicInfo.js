'use client';
import { useEffect } from 'react';
import styles from './TopicInfo.module.css';
import Link from 'next/link';

export default function TopicInfo({
    chapterName,
    progress,
    link,
    backgroundColor,
    count,
    children
}) {

    useEffect(() => {
            import('js-circle-progress');
        }, []);


    return (
        <div className={styles.topicInfo_div_main}>
            <div className={styles.topicInfo_div_main_top} style={{backgroundColor: backgroundColor}}>
                <div className={styles.topicInfo_div_info}>
                    <div className={styles.topicInfo_div_info_chapter}>
                        <p>Rozdział {count}</p>
                    </div>
                    <div className={styles.topicInfo_div_info_text}>
                        <h1>{chapterName}</h1>
                    </div>
                    <div className={styles.topicInfo_div_info_continue}>
                        <Link href={link} className={styles.topicInfo_div_info_continue_link}>
                            <p>Kontynuuj naukę</p>
                        </Link>
                    </div>
                </div>
                <div className={styles.topicInfo_div_progress}>
                    <circle-progress 
                        value={progress} 
                        max="100"
                        text-format="percent"
                        className={styles.customCircle}
                    ></circle-progress>
                </div>

            </div>
            <div className={styles.topicInfo_div_main_bottom}>
                {children}
            </div>
        </div>
    );
}