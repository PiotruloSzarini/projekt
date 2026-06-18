import RankingRow from './RankingRow/RankingRow';
import styles from './HomeRanking.module.css';
import Image from 'next/image';

export default function HomeRanking({ users }) {
    return (
        <div className={styles.card}>
            <h1 className={styles.title}>Ogólne statystyki:</h1>
            
            <div className={styles.rank_header}>
                <Image src="/assets/img/home/ranking/buggy-silver.svg" alt="rank" width={96} height={96} />
                <p className={styles.rank_name}>srebrny Buggi</p>
            </div>

            <div className={styles.list}>
                {users.map((user) => (
                    <RankingRow 
                        key={user.id} 
                        {...user}
                    />
                ))}
            </div>
        </div>
    );
}
