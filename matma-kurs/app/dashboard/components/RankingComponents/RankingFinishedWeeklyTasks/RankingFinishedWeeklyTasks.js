import styles from './RankingFinishedWeeklyTasks.module.css';
import Image from 'next/image';

export default function RankingFinishedWeeklyTasks({ task_number }) {
    return (
        <div className={styles.points_container}>
            <div className={styles.points}>
                <p className={styles.points_number}>{task_number}</p>
                <Image src="/assets/img/ranking/points-icon.svg" alt="Punkty" width={48} height={48} />
            </div>
            <div className={styles.points_text}>
                <p>Ukończone lekcje w tygodniu</p>
            </div> 
        </div>
    );
}
