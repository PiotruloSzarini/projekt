import ProgressBar from '../ProgressBar/ProgressBar';
import styles from './ChapterCard.module.css';
import Image from 'next/image';
import Link from 'next/link';

export default function ChapterCard({
    count,
    title,
    backgroundColor,
    fontColor,
    tasksCount,
    videosCount,
    progress,
    blocked
}) {
    const cardStyle = progress === 100 ? { backgroundColor, color: fontColor } : { };

    const fontColorStyle = progress === 100 ? { color: "#FEFFFF80" } : {};

    const borderColorStyle = progress === 100 ? { borderRight: "1px solid #FEFFFF80" } : {};

    let progressBarColor;
    if (progress === 100) {
        progressBarColor  = "#FEFFFF40";
    } else if (progress !== 100) {
        progressBarColor = "#032327";
    }

    let imgSrcTasks, imgSrcVideos;
    if (progress === 100) {
        imgSrcTasks = "/assets/img/chapterCard/chapter_task_icon_progress100.svg";
        imgSrcVideos = "/assets/img/chapterCard/chapter_video_icon_progress100.svg";
    } else {
        imgSrcTasks = "/assets/img/chapterCard/chapter_task_icon.svg";
        imgSrcVideos = "/assets/img/chapterCard/chapter_video_icon.svg";
    }
    
    const isBlocked = blocked === true ? { pointerEvents: 'none', userSelect: 'none' } : {};

    return (
        <div style={isBlocked} className={styles.wrapper}>
            <div className={styles.chapter_card} style={{...cardStyle, ...isBlocked}}>
                <div className={styles.chapter_order_div}>
                    <p className={styles.chapter_order} style={fontColorStyle}>Rozdział: {count}</p>
                </div>
                <div className={styles.chapter_title_div}>
                    <p className={styles.chapter_title} style={cardStyle}>{title}</p>
                </div>

                <div className={styles.chapter_task_video}>
                    <div className={styles.videosCount_div} style={borderColorStyle}>
                        <Image src={imgSrcVideos} alt="video icon" width={12} height={9} />
                        <p style={fontColorStyle}>{videosCount}</p>
                    </div>
                    <div className={styles.tasksCount_div}>
                        <Image src={imgSrcTasks} alt="task icon" width={16} height={16} />
                        <p style={fontColorStyle}>{tasksCount}</p>
                    </div>
                </div>
                <div className={styles.chapter_progress}>
                    <ProgressBar progress={progress} progressBarColor={progressBarColor} />
                    <p style={fontColorStyle}>Ukonczone: {progress}%</p>
                </div>

                {blocked && (
                    <div className={styles.locked_overlay}>
                        <Image src="/assets/img/lock_icon.svg" alt="lock icon" width={40} height={40} />
                        <p>Zawartość zablokowana</p>
                    </div>
                )}
            </div>
        </div>
    );
}