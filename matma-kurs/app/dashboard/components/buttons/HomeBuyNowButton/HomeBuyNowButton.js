import styles from './HomeBuyNowButton.module.css';
import Image from 'next/image';
import Link from 'next/link';

export default function HomeBuyNowButton({ link }) {
    return (
        <div>
            <Link href={link || '/dashboard/sklep'} className={styles.button_wrapper}>
                <div className={styles.buynow_button}>
                    <p>KUP KURS</p>
                    <Image src="/assets/img/home/home-buy-arrow.svg" alt="arrow right" width={16} height={16} />
                </div>
            </Link>
        </div>
        
    );
}
