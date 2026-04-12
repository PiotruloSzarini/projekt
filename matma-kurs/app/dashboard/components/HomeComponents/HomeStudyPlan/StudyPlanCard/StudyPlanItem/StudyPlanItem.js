import styles from './StudyPlanItem.module.css';
import Image from 'next/image';

export default function StudyPlanItem({ task, onToggle }) {
    return (
        <div className={styles.item} onClick={() => onToggle(task.id)}>
            <div className={styles.item_left}>
                <div className={`${styles.checkbox} ${task.isCompleted ? styles.checked : ''}`}>
                    {task.isCompleted && (
                        <Image 
                            src="/assets/img/home/studyplan/study-check-tick.svg"
                            alt="checked" 
                            width={16} 
                            height={16} 
                        />
                    )}
                </div>
                
                <div className={styles.item_text}>
                    <span className={styles.item_title}>{task.title}</span>
                    {task.category && (
                        <span className={styles.item_category}>/{task.category}</span>
                    )}
                </div>
            </div>

            <div className={styles.item_right}>
                <span className={styles.item_deadline}>{task.deadline}</span>
            </div>
        </div>
    );
}