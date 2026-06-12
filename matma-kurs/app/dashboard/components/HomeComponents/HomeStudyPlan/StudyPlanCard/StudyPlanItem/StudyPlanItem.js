import styles from './StudyPlanItem.module.css';
import Image from 'next/image';
import Link from 'next/link';

export default function StudyPlanItem({ task, onToggle }) {
    const content = (
        <>
            <div className={styles.item_left}>
                <div className={`${styles.checkbox} ${task.isCompleted ? styles.checked : ''}`}>
                    {task.isCompleted && (
                        <Image
                            src="/assets/img/home/studyplan/study-check-tick.svg"
                            alt="checked"
                            width={24}
                            height={24}
                            loading="eager"
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
        </>
    );

    if (task.href) {
        return (
            <Link href={task.href} className={`${styles.item} ${task.isCompleted ? styles.completed : ''}`}>
                {content}
            </Link>
        );
    }

    return (
        <div className={`${styles.item} ${task.isCompleted ? styles.completed : ''}`} onClick={() => onToggle(task.id)}>
            {content}
        </div>
    );
}
