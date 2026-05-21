import styles from './HomeCourseCard.module.css';
import ProgressBar from '../../ProgressBar/ProgressBar';
import Link from 'next/link';
import Image from 'next/image';

export default function HomeCourseCard({
    title,
    backgroundColor,
    tasksCount,
    videosCount,
    progress,
    owned
}) {
    return (
        <div 
            className={`${styles.card} ${!owned ? styles.locked : ''}`} 
            style={{ backgroundColor: backgroundColor }}
        >
            <div className={styles.card_header}>
                <div className={styles.card_title}>
                    {!owned && (
                        <Image 
                            src="/assets/img/home/home-lock-icon.svg" 
                            alt="lock icon" 
                            width={24} 
                            height={24} 
                        />
                    )}
                    <p className={styles.title}>
                        {title}
                    </p>
                </div>
                <div className={styles.card_owned}>
                    {owned ? (
                        <p>Posiadane</p> ) : (
                        <p>Zablokowane</p>
                    )}
                </div>
            </div>
            
            <div className={styles.card_task_video}>
                <div className={styles.tasksCount_div}>
                    <Image src="/assets/img/home/home-video-icon.svg" alt="video icon" width={16} height={16} />
                    <p>{videosCount}</p>
                </div>
                <div className={styles.videosCount_div}>
                    <Image src="/assets/img/home/home-task-icon.svg" alt="task icon" width={16} height={16} />
                    <p>{tasksCount}</p>
                </div>
            </div>
            <div className={styles.card_progress}>
                <ProgressBar progress={progress} progressBarColor="#FEFFFF" progressBarBackgroundColor="#FEFFFF80" />
                <p>Ukonczone: {progress}%</p>
            </div>
        </div>
    );
}