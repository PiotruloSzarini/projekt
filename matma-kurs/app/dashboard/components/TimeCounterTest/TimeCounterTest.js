import styles from './TimeCounterTest.module.css';

export default function TimeCounterTest({
    int
}) {
    return (
        <div className={styles.timeCounter_div_main}>
            <div className={styles.timeCounter_div_top_upper}></div>
            <div className={styles.timeCounter_div_bottom_upper}></div>


            <div className={styles.timeCounter_div_top}></div>
            <div className={styles.timeCounter_div_int}>
                {int}
            </div>
            <div className={styles.timeCounter_div_bottom}></div>
        </div>
    );
}