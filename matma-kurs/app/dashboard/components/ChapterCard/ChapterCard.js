import ProgressBar from '../ProgressBar/ProgressBar';
import styles from './ChapterCard.module.css';
import Image from 'next/image';
import Link from 'next/link';

export default function ChapterCard({
    count,
    title,
    backgroundColor,
    tasksCount,
    videosCount,
    progress,
    blocked
}) {
    const cardStyle = progress === 100 ? { backgroundColor } : {};
    
    const isBlocked = blocked === true ? { pointerEvents: 'none' } : {};

    return (
        <div style={isBlocked} className={styles.wrapper}>
            <div className={styles.chapter_card} style={{...cardStyle, ...isBlocked}}>
                <div className={styles.chapter_order_div}>
                    <p className={styles.chapter_order}>Rozdział: {count}</p>
                </div>
                <div className={styles.chapter_title_div}>
                    <p className={styles.chapter_title}>{title}</p>
                </div>

                <div className={styles.chapter_task_video}>
                    <div className={styles.videosCount_div}>
                        <Image src="/assets/img/video_icon_inactive.svg" alt="video icon" width={12} height={9} />
                        <p>{videosCount}</p>
                    </div>
                    <div className={styles.tasksCount_div}>
                        <Image src="/assets/img/task_icon_inactive.svg" alt="task icon" width={16} height={16} />
                        <p>{tasksCount}</p>
                    </div>
                </div>
                <div className={styles.chapter_progress}>
                    <ProgressBar progress={progress} />
                    <p>Ukonczone: {progress}%</p>
                </div>

                {blocked && (
                    <div className={styles.locked_overlay}>
                        <Image src="/assets/img/lock_icon.svg" alt="lock icon" width={40} height={40} />
                        <p>Zawartość zablokowana</p>
                    </div>
                )}
            </div>
        </div>
    );
}