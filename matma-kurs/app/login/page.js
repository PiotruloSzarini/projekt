'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Login.module.css';

export default function LoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState('login');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [step, setStep] = useState(1);
    const [pendingUserId, setPendingUserId] = useState(null);
    const [generatedCode, setGeneratedCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');

    const startAuth = async () => {
        setError('');
        setInfo('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/send-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    password,
                    mode,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Nie udało się rozpocząć logowania.');
                return;
            }

            setPendingUserId(data.userId);
            setGeneratedCode(data.code || '');
            setStep(2);
            setInfo(mode === 'register' ? 'Konto zostało utworzone. Teraz wpisz kod.' : 'Kod został wygenerowany. Wpisz go poniżej.');
        } catch (err) {
            setError(err.message || 'Błąd sieci.');
        } finally {
            setLoading(false);
        }
    };

    const verifyAuth = async () => {
        setError('');
        setInfo('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: pendingUserId,
                    code,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Nieprawidłowy kod.');
                return;
            }

            router.push(data.redirectTo || (data.isAdmin ? '/' : '/dashboard'));
            router.refresh();
        } catch (err) {
            setError(err.message || 'Błąd sieci.');
        } finally {
            setLoading(false);
        }
    };

    const resetStep = () => {
        setStep(1);
        setPendingUserId(null);
        setGeneratedCode('');
        setCode('');
        setInfo('');
        setError('');
    };

    return (
        <main className={styles.wrapper}>
            <section className={styles.card}>
                <div className={styles.badge}>Mathdle</div>
                <h1>{step === 1 ? 'Zaloguj się' : 'Weryfikacja kodem'}</h1>
                <p className={styles.subtitle}>
                    {step === 1
                        ? 'Wpisz nazwę i hasło. Kod 2FA do celów testowych wyswietli sie na kolejnej stronie. Docelowo będzie wysyłany on na maila.'
                        : 'Wpisz kod, żeby dokończyć logowanie.'}
                </p>

                <div className={styles.switcher}>
                    <button
                        type="button"
                        className={`${styles.switch_button} ${mode === 'login' ? styles.switch_active : ''}`}
                        onClick={() => setMode('login')}
                    >
                        Logowanie
                    </button>
                    <button
                        type="button"
                        className={`${styles.switch_button} ${mode === 'register' ? styles.switch_active : ''}`}
                        onClick={() => setMode('register')}
                    >
                        Załóż konto
                    </button>
                </div>

                {error && <div className={styles.error}>{error}</div>}
                {info && <div className={styles.info}>{info}</div>}

                {step === 1 ? (
                    <div className={styles.form}>
                        <label className={styles.label}>
                            Nazwa
                            <input
                                className={styles.input}
                                placeholder="np. jan_kowalski"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoComplete="username"
                            />
                        </label>

                        <label className={styles.label}>
                            Hasło
                            <input
                                className={styles.input}
                                type="password"
                                placeholder="Twoje hasło"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                            />
                        </label>

                        <button className={styles.primary_button} onClick={startAuth} disabled={loading || !name.trim() || !password.trim()}>
                            {loading ? 'Sprawdzanie...' : mode === 'register' ? 'Utwórz konto' : 'Dalej'}
                        </button>
                    </div>
                ) : (
                    <div className={styles.form}>
                        <label className={styles.label}>
                            Kod weryfikacyjny
                            <input
                                className={styles.input}
                                placeholder="Wpisz kod"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                inputMode="numeric"
                            />
                        </label>

                        <button className={styles.primary_button} onClick={verifyAuth} disabled={loading || !code.trim()}>
                            {loading ? 'Weryfikacja...' : 'Zaloguj'}
                        </button>

                        <button type="button" className={styles.secondary_button} onClick={resetStep}>
                            Wróć
                        </button>
                    </div>
                )}

                {step === 2 && generatedCode && (
                    <div className={styles.code_box}>
                        <span>Kod testowy</span>
                        <strong>{generatedCode}</strong>
                    </div>
                )}

                <p className={styles.footer_note}>
                    Admin po zalogowaniu wraca do wyboru panelu. Zwykły użytkownik trafia od razu do dashboardu.
                </p>
            </section>
        </main>
    );
}
