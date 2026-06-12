'use client';

import { useState, useEffect } from 'react';
import styles from './RankingTimer.module.css';
import TimeCounter from './TimeCounter/TimeCounter';

export default function RankingTimer({ datetime }) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const calculateTime = () => {
            const targetDate = datetime
                ? new Date(datetime).getTime()
                : getNextMidnight().getTime();
            const now = new Date().getTime();
            const difference = targetDate - now;

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        calculateTime();

        const timer = setInterval(calculateTime, 1000);

        return () => clearInterval(timer);
    }, [datetime]);

    return (
        <div className={styles.timer_container}>
            <div className={styles.timer_text}>
                <p>Do zamknięcia<br></br>rankingu pozostało:</p>
            </div>
            <div className={styles.timer}>
                <div className={styles.counter_group}>
                    <TimeCounter int={timeLeft.days} />
                    <span>dni</span>
                </div>
                <div className={styles.counter_group}>
                    <TimeCounter int={timeLeft.hours} />
                    <span>godz</span>
                </div>
                <div className={styles.counter_group}>
                    <TimeCounter int={timeLeft.minutes} />
                    <span>min</span>
                </div>
                <div className={styles.counter_group}>
                    <TimeCounter int={timeLeft.seconds} />
                    <span>sek</span>
                </div>
            </div>
        </div>
    );
} 

function getNextMidnight() {
    const nextMidnight = new Date();
    nextMidnight.setHours(24, 0, 0, 0);
    return nextMidnight;
}
