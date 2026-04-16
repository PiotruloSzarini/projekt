import { useState } from 'react';
import styles from './TaskTypeSingleInput.module.css';

export default function TaskTypeSingleInput({ answer, setAnswer, courseColor }) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className={styles.button_div}>
            <input 
                type="text" 
                placeholder="Tutaj wpisz swoją odpowiedź"
                value={answer || ""}
                onChange={(e) => setAnswer(e.target.value)} 
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={styles.singleinput_button}
                style={{ 
                    outlineColor: isFocused ? courseColor : 'transparent',
                    outlineStyle: 'solid' 
                }}
            />
        </div>
    );
}