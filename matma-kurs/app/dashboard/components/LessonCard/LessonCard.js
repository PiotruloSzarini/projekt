import ProgressBar from '../ProgressBar/ProgressBar';
import styles from './LessonCard.module.css';
import Link from 'next/link';
import Image from 'next/image';

export default function LessonCard({
    title,
    backgroundColor,
    progress,
    count,
    blocked
}) {
    const cardStyle = progress === 100
        ? { backgroundColor }
        : {};

    return (
        <div className={styles.card_wrapper} style={blocked ? { pointerEvents: 'none' } : {}}>
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