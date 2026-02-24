import styles from './ProgressBar.module.css';

export default function ProgressBar({ progress, progressBarColor }) {
    return (
        <div className={styles.progress_bar}>
            <div
                className={styles.progress_fill}
                style={{ width: `${progress}%`, backgroundColor: progressBarColor }}
            />
        </div>
    );
}
