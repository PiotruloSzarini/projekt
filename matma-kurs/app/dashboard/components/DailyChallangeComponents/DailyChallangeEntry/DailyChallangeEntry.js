'use client';

import { useEffect, useState } from 'react';
import styles from './DailyChallangeEntry.module.css';

const LEVELS = ['ŁATWE', 'ŚREDNIE', 'TRUDNE'];

function formatTimeLeft() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);

    const diff = midnight - now;
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    const format = (num) => String(num).padStart(2, '0');

    return `${format(hours)}:${format(minutes)}:${format(seconds)}`;
}

export default function DailyChallangeEntry({ completed = 0, total = 3 }) {
    const [timeLeft, setTimeLeft] = useState(formatTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(formatTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className={styles.card}>
            <div className={styles.card_top}>
                <h1>Daily challenge</h1>
                <p>
                    Rozwiązuj zadania matematyczne i rywalizuj z innymi! Wykonuj codzienne zadania, zgarniaj punkty i pnij się w rankingu.
                    <br />Poniżej Twoja dzisiejsza dawka matematycznych zagwozdek:
                </p>
            </div>

            <div className={styles.level_progress}>
                {LEVELS.map((level, index) => (
                    <div
                        key={level}
                        className={`${styles.level_segment} ${index < completed ? styles.level_completed : ''}`}
                    >
                        <span>{level}</span>
                    </div>
                ))}
            </div>

            <div className={styles.level_labels}>
                <span>Ukończono {completed}/{total}</span>
                <span>pozostało {timeLeft}</span>
            </div>
        </div>
    );
}
