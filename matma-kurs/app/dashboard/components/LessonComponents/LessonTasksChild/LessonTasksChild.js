import styles from './LessonTasksChild.module.css';
import Link from 'next/link';
import Image from 'next/image';

export default function LessonTaskChild({ title, active, backgroundColor, fontColor, link }) {
    
        const cardStyle = active === true
            ? { backgroundColor, color: fontColor }
            : {};

        const imgSrc = active === true ? "/assets/img/task_icon.svg" : "/assets/img/task_icon_inactive.svg";


    return (
            <div className={styles.lessonTaskChild_main_div}>
                <div style={cardStyle} className={styles.lessonTaskChild_container}>
                    <Link className={styles.lessonTaskChild_link} href={link} style={{ textDecoration: 'none' }}>
                        <div className={styles.lessonTaskChild_inner}>
                            <div className={styles.lessonTaskChild_title}>
                                <p style={cardStyle}>{title}</p>
                            </div>
                            <div className={styles.lessonTaskChild_icon}>
                                <Image src={imgSrc} alt="task icon" width={16} height={16} />
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        
    );
}
