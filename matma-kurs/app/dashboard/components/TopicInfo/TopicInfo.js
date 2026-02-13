import styles from './TopicInfo.module.css';
import Link from 'next/link';

export default function TopicInfo({
    chapterName,
    progress,
    link,
    backgroundColor,
    children
}) {
    return (
        <div className={styles.topicInfo_div_main}>
            <div className={styles.topicInfo_div_main_top} style={{backgroundColor: backgroundColor}}>
                <div className={styles.topicInfo_div_info}>
                    <div className={styles.topicInfo_div_info_text}>
                        <h1>{chapterName}</h1>
                        <p>Postęp ukonczenia kursu:</p>
                    </div>
                    <div className={styles.topicInfo_div_info_continue}>
                        <Link href={link} className={styles.topicInfo_div_info_continue_link}>
                            <p>Kontynuuj naukę</p>
                        </Link>
                    </div>
                </div>
                <div className={styles.topicInfo_div_progress}>
                    {progress}%
                </div>

            </div>
            <div className={styles.topicInfo_div_main_bottom}>
                {children}
            </div>
        </div>
    );
}