import styles from './RankingRow.module.css';
import Image from 'next/image';

export default function RankingRow({ rank, name, points, avatar, isCurrentUser }) {
    return (
        <div className={`${styles.row} ${isCurrentUser ? styles.active_row : ''}`}>
            <div className={styles.row_left}>
                <span className={styles.rank_number}>{rank}.</span>
                <div className={styles.avatar_circle}>
                    <Image className={styles.avatar} src={avatar} alt={name} width={24} height={24} />
                </div>
                <span className={styles.user_name}>{name}</span>
            </div>
            <div className={styles.row_right}>
                <span className={styles.points}>{points}</span>
                <Image className={styles.points_icon} src="/assets/img/topbar/points-icon.svg" alt="pts" width={24} height={24} />
            </div>
        </div>
    );
}