import ProgressBar from '../ProgressBar/ProgressBar';
import styles from './ChapterCard.module.css';
import Link from 'next/link';

export default function ChapterCard({
    count,
    title,
    backgroundColor,
    tasksCount,
    videosCount,
    progress,
}) {
    const cardStyle = progress === 100
        ? { backgroundColor }
        : {};

    return (
        <div className={styles.chapter_card} style={cardStyle}>
            <div className={styles.chapter_order_div}>
                <p className={styles.chapter_order}>Rozdział: {count}</p>
            </div>
            <div className={styles.chapter_title_div}>
                <p className={styles.chapter_title}>
                {title}
                </p>
            </div>

            <div className={styles.chapter_task_video}>
                <div className={styles.tasksCount_div}>
                    <p>{tasksCount}</p>
                </div>
                <div className={styles.videosCount_div}>
                    <p>{videosCount}</p>
                </div>
            </div>
            <div className={styles.chapter_progress}>
                <ProgressBar progress={progress} />
                <p>Ukonczone: {progress}%</p>
            </div>
        </div>
    );
}