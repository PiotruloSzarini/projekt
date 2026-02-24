import styles from './LessonTasks.module.css';
import Link from 'next/link';
import Image from 'next/image';

export default function LessonTask({ title, active, backgroundColor, fontColor, link, children, hasActiveChild }) {
    
    let cardStyle = {};

    if (active) {
        if (hasActiveChild) {
            cardStyle = { 
                border: `1px solid ${backgroundColor}`, 
                backgroundColor: 'white', 
                color: '#03232740'
            };
        } else {
            cardStyle = { backgroundColor, color: fontColor };
        }
    }

    const imgSrc = (active === true && !hasActiveChild) 
        ? "/assets/img/video_icon.svg" 
        : "/assets/img/video_icon_inactive.svg";

    return (
        <div className={styles.lessonTask_main_div}>
            <Link className={styles.lessonTask_link} href={link} style={{ textDecoration: 'none' }}>
            <div style={cardStyle} className={styles.lessonTask_container}>
                    <div className={styles.lessonTask_inner}>
                        <div className={styles.lessonTask_title}>
                            <p style={{ color: cardStyle.color }}>{title}</p>
                        </div>
                        <div className={styles.lessonTask_icon}>
                            <Image src={imgSrc} alt="video icon" width={16} height={16} />
                        </div>
                    </div>
            </div>
            </Link>
            <div className={styles.lessonTask_children}>
                {children}
            </div>
        </div>
    );
}
