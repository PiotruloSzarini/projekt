import { useState } from 'react';
import styles from './TaskTypeSingleInput.module.css';

export default function TaskTypeSingleInput({
    answer,
    setAnswer,
    courseColor,
    feedback = null,
}) {
    const [isFocused, setIsFocused] = useState(false);
    const statusClass = feedback?.status === 'correct'
        ? styles.correct
        : feedback?.status === 'incorrect'
            ? styles.incorrect
            : '';

    return (
        <div className={styles.button_div}>
            <div className={`${styles.input_shell} ${statusClass}`}>
                {feedback?.status && (
                    <span className={styles.status_mark}>
                        {feedback.status === 'correct' ? '\u2713' : '\u00d7'}
                    </span>
                )}
                <input
                    type="text"
                    placeholder="Tutaj wpisz swoją odpowiedź"
                    value={answer || ''}
                    onChange={(e) => setAnswer(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={styles.singleinput_button}
                    style={{
                        outlineColor: isFocused && !feedback ? courseColor : 'transparent',
                        outlineStyle: 'solid',
                    }}
                />
            </div>
        </div>
    );
}
