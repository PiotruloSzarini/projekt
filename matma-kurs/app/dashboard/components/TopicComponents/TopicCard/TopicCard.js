import ProgressBar from '../../ProgressBar/ProgressBar';
import styles from './TopicCard.module.css';
import Link from 'next/link';
import Image from 'next/image';

export default function TopicCard({
    title,
    backgroundColor,
    progress,
    count,
    blocked
}) {
    const isBlocked = blocked === true ? { pointerEvents: 'none', userSelect: 'none' } : {};

    const cardStyle = progress === 100 ? { backgroundColor, color: '#FEFFFF', border: 'none' } : { };

    const fontColorStyle = progress === 100 ? { color: "#FEFFFF80" } : {};

    let progressBarColor;
    if (progress === 100) {
        progressBarColor  = "#FEFFFF";
    } else if (progress !== 100) {
        progressBarColor = "#032327";
    }

    return (
        <div className={styles.card_wrapper} style={isBlocked}>
            <div className={styles.lesson_card} style={cardStyle}>
                <div className={styles.lesson_title_div}>
                    <p style={cardStyle} className={styles.lesson_title}>
                        {count}. {title}
                    </p>
                </div>

                <div className={styles.lesson_progress}>
                    <ProgressBar progress={progress} progressBarColor={progressBarColor} />
                    <p style={fontColorStyle}>Ukonczono: {progress}%</p>
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