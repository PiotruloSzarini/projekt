import { text } from 'node:stream/consumers';
import styles from './TaskSelect.module.css';
import Link from 'next/link';

export default function TaskSelect({
    int,
    backgroundColor,
    link,
    active
}) {
    let activeStyle = {};
    if (active) {
        activeStyle.backgroundColor = backgroundColor;
        activeStyle.color = 'white';
        activeStyle.border = `1px solid ${backgroundColor}`;
    }
    return (
        <div className={styles.taskSelect_main_div} style={activeStyle}>
            <Link href={link} className={styles.taskSelect_link} style={{ textDecoration: 'none' }}>
                <p className={styles.taskSelect_p}>{int}</p>
            </Link>
        </div>
    );
}