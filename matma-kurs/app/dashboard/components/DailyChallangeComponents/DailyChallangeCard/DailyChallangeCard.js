import styles from './DailyChallangeCard.module.css';
import Link from 'next/link';
import Image from 'next/image';

export default function DailyChallangeCard({
    title,
    type,
    points,
    img,
    link,
    count,
    completed = 0
}) {
    const taskIndex = count - 1;

    const isFinished = taskIndex < completed;
    
    const isOverlayBlocked = isFinished;  

    const isButtonDisabled = taskIndex > completed;

    let pointsText = "punkt";
    switch (points) {
        case 1: pointsText = "punkt"; break;
        case 3: pointsText = "punkty"; break;
        default: pointsText = "punktów";
    }

    return (
        <div className={styles.card}>
            {isOverlayBlocked && (
                <div className={styles.card_overlay}>
                    <Image 
                        src="/assets/img/dailyChallangeTypes/blocked_img.svg" 
                        alt="Zablokowane" 
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
                <Image src={img} alt={type} width={196} height={196} />
            </div>
            <div className={styles.card_info}>
                <div className={styles.card_info_top}>
                    <p>Zadanie {count}: {title}</p>
                </div>
                <div className={styles.card_info_bottom}>
                    <p>{points} {pointsText}</p>
                </div>
                <div className={styles.card_info_button} style={isButtonDisabled ? { backgroundColor: '#03232740', pointerEvents: 'none', cursor: 'not-allowed' } : {}}>
                    <Link 
                        href={isButtonDisabled || isOverlayBlocked ? "#" : link} 
                        className={styles.button}
                        style={isButtonDisabled ? { pointerEvents: 'none', cursor: 'not-allowed', userSelect: 'none' } : {}}
                    >
                        {isFinished ? "Ukończono" : "Rozpocznij"}
                    </Link>
                </div>
            </div>
        </div>
    );
}