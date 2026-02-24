import styles from './CourseCard.module.css';
import ProgressBar from '../../ProgressBar/ProgressBar';
import Link from 'next/link';
import Image from 'next/image';

export default function CourseCard({
    title,
    backgroundColor,
    tasksCount,
    videosCount,
    progress,
    owned
}) {
    return (
        <div className={styles.card}>
            <div className={styles.card_background}
            style={{ backgroundColor }}>
                <Image src="/assets/img/math_symbols_icon_blue.svg" alt="course icon" width={84} height={84} />
            </div>
            <div className={styles.card_title}>
                <p className={styles.title}>
                {title}
                </p>
            </div>
            <div className={styles.card_task_video}>
                <div className={styles.videosCount_div}>
                    <Image src="/assets/img/video_icon_inactive.svg" alt="video icon" width={12} height={9} />
                    <p>{videosCount}</p>
                </div>
                <div className={styles.tasksCount_div}>
                    <Image src="/assets/img/task_icon_inactive.svg" alt="task icon" width={10} height={13} />
                    <p>{tasksCount}</p>
                </div>
            </div>
            <div className={styles.card_progress}>
                <ProgressBar progress={progress} />
                <p>Ukonczone: {progress}%</p>
            </div>
        </div>
    );
}