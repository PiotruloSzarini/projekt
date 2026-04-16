`use client`;

import StudyPlanItem from './StudyPlanItem/StudyPlanItem';
import styles from './StudyPlanCard.module.css';

export default function StudyPlanCard({ tasks, onTaskToggle }) {
    return (
        <div className={styles.card}>
            <h3 className={styles.card_title}>Mój plan nauki:</h3>
            
            <div className={styles.items_list}>
                {tasks.map((task) => (
                    <StudyPlanItem 
                        key={task.id} 
                        task={task} 
                        onToggle={onTaskToggle} 
                    />
                ))}
            </div>
        </div>
    );
}