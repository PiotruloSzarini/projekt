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
    blocked,
    finished
}) {
    let pointsText = "punkt";
    switch (points) {
        case 1:
            pointsText = "punkt";
            break;
        case 3:
            pointsText = "punkty";
            break;
        case 5:
            pointsText = "punktów";
            break;
        default:
            pointsText = "punktów";
    }
    

    return (
        <div className={styles.card}>
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
                <div className={styles.card_info_button}>
                    <Link href={link} className={styles.button}>Rozpocznij</Link>
                </div>
            </div>
        </div>
    );
}