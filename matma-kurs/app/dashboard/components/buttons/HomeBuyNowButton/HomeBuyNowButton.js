import styles from './HomeBuyNowButton.module.css';
import Image from 'next/image';

export default function HomeBuyNowButton({ }) {
    return (
        <div className={styles.buynow_button}>
            <p>KUP KURS</p>
            <Image src="/assets/img/home/home-buy-arrow.svg" alt="arrow right" width={16} height={16} />
        </div>
    );
}
