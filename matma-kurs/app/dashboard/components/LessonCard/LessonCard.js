import ProgressBar from '../ProgressBar/ProgressBar';
import styles from './LessonCard.module.css';
import Link from 'next/link';

export default function LessonCard({
    title,
    backgroundColor,
    progress,
    count
}) {
    const cardStyle = progress === 100
        ? { backgroundColor }
        : {};

    return (
        <div className={styles.lesson_card} style={cardStyle}>
            <div className={styles.lesson_title_div}>
                <p className={styles.lesson_title}>
                {count}. {title}
                </p>
            </div>

            <div className={styles.lesson_progress}>
                <ProgressBar progress={progress} />
                <p>Ukonczone: {progress}%</p>
            </div>
        </div>
    );
}