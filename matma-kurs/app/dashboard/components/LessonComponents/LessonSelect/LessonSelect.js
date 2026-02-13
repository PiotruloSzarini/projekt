import styles from './LessonSelect.module.css';
import Link from 'next/link';

export default function LessonSelect({ count, active, backgroundColor, fontColor, link }) {
    
    const cardStyle = active === true
        ? { backgroundColor, color: fontColor }
        : {};

    return (
        <div className={styles.lesson_select_container} style={cardStyle}>
            <Link href={link} className={styles.lesson_select_link}>
                <p style={cardStyle}>Lekcja {count}</p>
            </Link>
        </div>
        
    );
}
