import styles from './DailyChallangeCard.module.css';
import Image from 'next/image';

export default function DailyChallangeCard({
    title,
    type,
    points,
    img,
    count,
    completed = false,
    locked = false,
    onOpen,
}) {
    let pointsText = 'punktów';
    switch (points) {
        case 1:
            pointsText = 'punkt';
            break;
        case 2:
            pointsText = 'punkty';
            break;
        default:
            pointsText = 'punktów';
    }

    const statusLabel = completed ? 'Ukończono' : locked ? 'Zablokowane' : 'Rozpocznij';

    return (
        <button
            type="button"
            className={`${styles.card} ${completed ? styles.card_completed : ''} ${locked ? styles.card_locked : ''}`}
            onClick={() => {
                if (!completed && !locked) onOpen?.();
            }}
            disabled={completed || locked}
        >
            {completed && (
                <div className={styles.card_overlay}>
                    <Image
                        src="/assets/img/dailyChallangeTypes/blocked_img.svg"
                        alt="Ukończone"
                        width={225}
                        height={225}
                        className={styles.card_blocked_img}
                    />
                </div>
            )}

            <div className={styles.card_fakediv}>
                <span></span>
            </div>
            <div className={styles.card_type_img}>
                <Image src={img} alt={type} width={196} height={196} className={styles.card_icon} />
            </div>
            <div className={styles.card_info}>
                <div className={styles.card_info_top}>
                    <p>Zadanie {count}: {title}</p>
                </div>
                <div className={styles.card_info_bottom}>
                    <p>{points} {pointsText}</p>
                </div>
                <div className={styles.card_info_button}>
                    <span className={styles.button}>{statusLabel}</span>
                </div>
            </div>
        </button>
    );
}
