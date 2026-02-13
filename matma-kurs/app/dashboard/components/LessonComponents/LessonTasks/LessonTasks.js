import styles from './LessonTasks.module.css';
import Link from 'next/link';

export default function LessonTask({ count, active, backgroundColor, fontColor, link }) {
    
    const cardStyle = active === true
        ? { backgroundColor, color: fontColor }
        : {};

    return (
        <div style={cardStyle}>

        </div>
    );
}
