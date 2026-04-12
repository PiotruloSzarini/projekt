import styles from './HomeEntryCard.module.css';
import Image from 'next/image';

export default function HomeEntryCard( { name, continueLink } ) {
    return (
        <div className={styles.card}>
            <div className={styles.card_info}>
                <div className={styles.card_greeting}>
                    <h1>Witaj, {name}!</h1>
                    <p>Dobrze Cię znów widzieć. Tak trzymaj!<br/> Czekają na Ciebie kolejne lekcje.</p>
                </div>
                <div className={styles.card_continue}>
                    <a href={continueLink}>KONTYNUUJ NAUKĘ</a>
                    <Image src="/assets/img/home/home-continue-arrow.svg" alt="Home Continue Arrow" width={16} height={16} />
                </div>
            </div>
            <div className={styles.card_image}>
                <Image src="/assets/img/home/home-entry-card-image.svg" alt="Home Entry Card Image" width={175} height={128} loading="eager"/>
            </div>
        </div>
    );
}
