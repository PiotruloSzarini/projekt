'use client';

import { useState, useEffect } from 'react';
import styles from './TimeCounter.module.css';

export default function TimeCounterTest({ int }) {
    const intString = String(int);
    const dynamicWidth = intString.length < 3 ? '70px' : undefined;

    const [currentVal, setCurrentVal] = useState(intString);
    const [nextVal, setNextVal] = useState(intString);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (intString !== currentVal) {
            setNextVal(intString);
            setIsAnimating(true);
        }
    }, [intString, currentVal]);

    const handleAnimationEnd = () => {
        setIsAnimating(false);
        setCurrentVal(nextVal);
    };

    return (
        <div className={styles.timeCounter_div_main} style={{ width: dynamicWidth }}>
            <div className={styles.timeCounter_div_top_upper} style={{ width: dynamicWidth }}></div>
            <div className={styles.timeCounter_div_bottom_upper} style={{ width: dynamicWidth }}></div>

            <div className={styles.timeCounter_div_top} style={{ width: dynamicWidth }}></div>
            <div className={styles.timeCounter_div_bottom} style={{ width: dynamicWidth }}></div>

            <div className={styles.timeCounter_div_int} style={{ clipPath: 'inset(0px 0px 50% 0px)' }}>
                {isAnimating ? nextVal : currentVal}
            </div>
            <div className={styles.timeCounter_div_int} style={{ clipPath: 'inset(50% 0px 0px 0px)' }}>
                {currentVal}
            </div>

            {isAnimating && (
                <div className={styles.flip_container} style={{ width: dynamicWidth }} onAnimationEnd={handleAnimationEnd}>
                    <div className={styles.face_front}>
                        <div className={styles.timeCounter_div_top} style={{ width: '100%', position: 'absolute', top: 0 }}></div>
                        <div className={styles.timeCounter_div_int} style={{ clipPath: 'inset(0px 0px 50% 0px)' }}>{currentVal}</div>
                    </div>

                    <div className={styles.face_back}>
                        <div className={styles.timeCounter_div_bottom} style={{ width: '100%', position: 'absolute', bottom: 0 }}></div>
                        <div className={styles.timeCounter_div_int} style={{ clipPath: 'inset(50% 0px 0px 0px)' }}>{nextVal}</div>
                    </div>
                </div>
            )}
        </div>
    );
}