import StatRow from './StatRow';
import styles from './HomeStats.module.css';

export default function HomeStats({ stats }) {
    if (!stats) return null;

    return (
        <div className={styles.card}>
            <div className={styles.stats_list}>
                {stats.map((stat) => (
                    <StatRow 
                        key={stat.id} 
                        icon={stat.icon} 
                        label={stat.label} 
                        value={stat.value} 
                    />
                ))}
            </div>
        </div>
    );
}