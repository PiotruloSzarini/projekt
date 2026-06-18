import styles from './TaskSelect.module.css';

export default function TaskSelect({
    int,
    backgroundColor,
    active,
    status,
    onClick
}) {
    let activeStyle = {};
    if (status === 'correct') {
        activeStyle.backgroundColor = '#12c642';
        activeStyle.color = 'white';
        activeStyle.border = '1px solid #12c642';
    } else if (status === 'incorrect') {
        activeStyle.backgroundColor = '#e71920';
        activeStyle.color = 'white';
        activeStyle.border = '1px solid #e71920';
    } else if (active) {
        activeStyle.backgroundColor = backgroundColor;
        activeStyle.color = 'white';
        activeStyle.border = `1px solid ${backgroundColor}`;
    }
    return (
        <div onClick={onClick} style={{ cursor: 'pointer' }}> {/* Dodaj onClick tutaj */}
                <div className={styles.taskSelect_main_div} style={activeStyle}>
                    <p className={styles.taskSelect_p}>{int}</p>
                </div>
        </div>
    );
}
