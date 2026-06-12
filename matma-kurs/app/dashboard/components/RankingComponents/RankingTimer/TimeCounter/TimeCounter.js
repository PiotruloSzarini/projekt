import styles from './TimeCounter.module.css';

export default function TimeCounter({ int }) {
    const intString = String(int).padStart(2, '0');
    const dynamicWidth = intString.length < 3 ? '56px' : undefined;

    return (
        <div className={styles.timeCounter_div_main} style={{ width: dynamicWidth }}>
            <div className={styles.timeCounter_div_top_upper} style={{ width: dynamicWidth }}></div>
            <div className={styles.timeCounter_div_bottom_upper} style={{ width: dynamicWidth }}></div>

            <div className={styles.timeCounter_div_top} style={{ width: dynamicWidth }}></div>
            <div className={styles.timeCounter_div_bottom} style={{ width: dynamicWidth }}></div>

            <div className={styles.timeCounter_div_int}>{intString}</div>
        </div>
    );
}
