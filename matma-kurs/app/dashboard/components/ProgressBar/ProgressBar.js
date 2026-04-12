import styles from './ProgressBar.module.css';

export default function ProgressBar({ progress, progressBarColor, progressBarBackgroundColor }) {
    return (
        <div className={styles.progress_bar} style={{ backgroundColor: progressBarBackgroundColor }}>
            <div
                className={styles.progress_fill}
                style={{ width: `${progress}%`, backgroundColor: progressBarColor }}
            />
        </div>
    );
}
