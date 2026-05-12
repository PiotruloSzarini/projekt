'use client';

import { useState, useEffect } from 'react';
import styles from './DailyChallangeEntry.module.css';

export default function DailyChallangeEntry({ completed = 0 }) {
    const [timeLeft, setTimeLeft] = useState('');
    const levels = ['ŁATWE', 'ŚREDNIE', 'TRUDNE'];

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const midnight = new Date();
            
            // Ustawiamy cel na godzinę 24:00:00 dzisiejszego dnia
            midnight.setHours(24, 0, 0, 0);

            const diff = midnight - now;

            // Formatuje milisekundy na HH:mm:ss
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            // Dodajemy zero przed cyfrą, jeśli jest mniejsza od 10 (np. 09:05:01)
            const format = (num) => String(num).padStart(2, '0');

            return `${format(hours)}:${format(minutes)}:${format(seconds)}`;
        };

        // Inicjalizacja licznika od razu
        setTimeLeft(calculateTimeLeft());

        // Interwał aktualizujący czas co sekundę
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        // Czyścimy interwał, gdy komponent znika z ekranu
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
            <div className={styles.card_bottom}>
                <div className={styles.card_level_container}>
                    {levels.map((level, index) => {
                        const isDone = index < completed;
                        const isNext = index === completed;
                        
                        return (
                            <div 
                                key={level} 
                                className={`
                                    ${styles.card_level} 
                                    ${isDone ? styles.level_completed : ''} 
                                    ${isNext ? styles.next_level : ''}
                                `}
                            >
                                <p>{level}</p>
                            </div>
                        );
                    })}
                </div>
                
                <div className={styles.level_container_info}>
                    <div className={styles.level_info}>
                        <p>Ukończono: {completed}/3</p>
                    </div>
                    <div className={styles.level_time_left}>
                        {/* Tutaj wyświetlamy tykający zegar */}
                        <p>pozostało <span>{timeLeft}</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
}