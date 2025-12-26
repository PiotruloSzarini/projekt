import styles from './CourseCard.module.css';

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
                <p>+-*/</p>
            </div>
            <div className={styles.card_title}>
                <p className={styles.title}>
                {title}
                </p>
            </div>
            <div className={styles.card_task_video}>
                <div className={styles.tasksCount_div}>
                    <p>{tasksCount}</p>
                </div>
                <div className={styles.videosCount_div}>
                    <p>{videosCount}</p>
                </div>
            </div>
            <div className={styles.card_progress}>
                <p>*progress bar*</p>
                <p>Ukonczone: {progress}%</p>
            </div>
        </div>
    );
}