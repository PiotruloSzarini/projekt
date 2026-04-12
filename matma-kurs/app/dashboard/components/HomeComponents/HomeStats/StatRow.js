import styles from './HomeStats.module.css';
import Image from 'next/image';

export default function StatRow({ icon, label, value }) {
    return (
        <div className={styles.stat_row}>
            <div className={styles.stat_left}>
                <div className={styles.icon_wrapper}>
                    <Image 
                        src={icon} 
                        alt={label} 
                        width={24} 
                        height={24} 
                    />
                </div>
                <span className={styles.stat_label}>{label}</span>
            </div>
            <span className={styles.stat_value}>{value}</span>
        </div>
    );
}