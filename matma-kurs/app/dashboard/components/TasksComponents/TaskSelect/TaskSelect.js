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
        <div>
            <Link href={link} className={styles.taskSelect_link} style={{ textDecoration: 'none' }}>
                <div className={styles.taskSelect_main_div} style={activeStyle}>
                    <p className={styles.taskSelect_p}>{int}</p>
                </div>
            </Link>
        </div>
    );
}