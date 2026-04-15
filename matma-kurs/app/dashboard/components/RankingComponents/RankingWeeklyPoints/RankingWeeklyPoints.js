import styles from './RankingWeeklyPoints.module.css';
import Image from 'next/image';

export default function RankingWeeklyPoints({ points }) {
    return (
        <div className={styles.points_container}>
            <div className={styles.points}>
                <p className={styles.points_number}>{points}</p>
                <Image src="/assets/img/ranking/points-icon.svg" alt="Punkty" width={48} height={48} />
            </div>
            <div className={styles.points_text}>
                <p>Zdobyte punkty w tygodniu</p>
            </div> 
        </div>
    );
}
