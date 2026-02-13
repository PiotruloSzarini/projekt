import styles from './RozdzialInfo.module.css';
import Link from 'next/link';

export default function RozdzialInfo({
    courseName,
    progress,
    link,
    backgroundColor
}) {
    return (
        <div className={styles.rozdzialInfo_div_main} style={{backgroundColor: backgroundColor}}>
            <div className={styles.rozdzialInfo_div_info}>
                <div className={styles.rozdzialInfo_div_info_text}>
                    <h1>{courseName}</h1>
                    <p>Postęp ukonczenia kursu:</p>
                </div>
                <div className={styles.rozdzialInfo_div_info_continue}>
                    <Link href={link} className={styles.rozdzialInfo_div_info_continue_link}>
                        <p>Kontynuuj naukę</p>
                    </Link>
                </div>
                
            </div>
            <div className={styles.rozdzialInfo_div_progress}>
                {progress}%
            </div>
        </div>
    );
}