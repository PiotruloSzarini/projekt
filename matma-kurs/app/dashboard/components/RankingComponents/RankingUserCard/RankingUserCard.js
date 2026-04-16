import styles from './RankingUserCard.module.css';
import Image from 'next/image';

export default function RankingUserCard({icon, name, nick, points, tasks, daily_challange, isFirst}) {
    return (
        <div className={`${styles.user_card} ${isFirst ? styles.first_place : ''}`}>
            
            {isFirst && (
                <div className={styles.medal_wrapper}>
                    <Image src="/assets/img/ranking/ranking-first-place-icon.svg" alt="1st" width={82} height={82} />
                </div>
            )}

            <div className={styles.user_info}>
                <Image src={icon} alt="Profile Picture" width={72} height={72} className={styles.profile_picture} />
                <div className={styles.user_details}>
                    <h1 className={styles.user_name} title={name}>{name}</h1>
                    <p className={styles.user_nick}>{nick}</p>
                </div>
            </div>
            
            <div className={styles.user_stats}>
                <div className={styles.user_stats_row}>
                    <h1 className={styles.user_points}>{points}</h1>
                    <p className={styles.user_points_text}>Zdobyte<br/>punkty</p>
                </div>
                <div className={styles.user_stats_row}>
                    <h1 className={styles.user_tasks}>{tasks}</h1>
                    <p className={styles.user_tasks_text}>Ukończone<br/>lekcje</p>
                </div>
                <div className={styles.user_stats_row}>
                    <h1 className={styles.user_daily_challenge}>{daily_challange}</h1>
                    <p className={styles.user_daily_challenge_text}>Daily<br/>Challenge</p>
                </div>
            </div>
        </div>
    );
}