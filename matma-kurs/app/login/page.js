'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Login.module.css';

export default function LoginPage() {
    const [userId, setUserId] = useState('');
    const [code, setCode] = useState('');
    const [step, setStep] = useState(1);
    const [generatedCode, setGeneratedCode] = useState(null);
    const [error, setError] = useState('');
    const router = useRouter();

    const sendCode = async () => {
        setError('');
        const res = await fetch('/api/auth/send-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        const data = await res.json();
        if (data.success) {
            setGeneratedCode(data.code);
            setStep(2);
        } else {
            setError(data.error);
        }
    };

    const verifyCode = async () => {
        setError('');
        const res = await fetch('/api/auth/verify-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, code })
        });
        const data = await res.json();
        if (data.success) {
            router.push('/dashboard');
            router.refresh();
        } else {
            setError(data.error);
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.card}>
                <h1>Logowanie</h1>
                {error && <p className={styles.error}>{error}</p>}
                
                {step === 1 ? (
                    <>
                        <input placeholder="Podaj Twoje ID" value={userId} onChange={e => setUserId(e.target.value)} />
                        <button onClick={sendCode}>Dalej</button>
                    </>
                ) : (
                    <>
                        <input placeholder="Wpisz kod" value={code} onChange={e => setCode(e.target.value)} />
                        <button onClick={verifyCode}>Zaloguj</button>
                        <p onClick={() => setStep(1)} className={styles.back}>Wróć</p>
                    </>
                )}

                {generatedCode && (
                    <div className={styles.debug}>
                        <p>Kod(dev): <strong>{generatedCode}</strong></p>
                    </div>
                )}
            </div>
        </div>
    );
}