"use client";
import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function MathdleUserPage() {
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- NOWE STANY DLA ODPOWIEDZI ---
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState(null); // Przechowuje wynik sprawdzania
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetch('/api/admin/mathdle/today')
            .then(res => res.json())
            .then(data => {
                setTasks(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Błąd pobierania zadań:", err);
                setLoading(false);
            });
    }, []);

    // --- FUNKCJA WYSYŁANIA ODPOWIEDZI ---
    const handleSubmit = async () => {
        if (!userAnswer.trim()) return;
        
        setIsSubmitting(true);
        setFeedback(null);

        try {
            const response = await fetch('/api/admin/mathdle/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 1, // Tymczasowo na sztywno 1, dopóki nie masz sesji
                    taskId: selectedTask.task_id,
                    difficulty: selectedTask.difficulty,
                    userAnswer: userAnswer
                })
            });

            const result = await response.json();
            setFeedback(result);
        } catch (error) {
            setFeedback({ isCorrect: false, message: "Błąd serwera. Spróbuj później." });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Resetuj formularz przy zamykaniu modala
    const closeModal = () => {
        setSelectedTask(null);
        setFeedback(null);
        setUserAnswer('');
    };

    if (loading) return <div className={styles.loader}>Wczytywanie wyzwań...</div>;
    
    if (tasks.length === 0) {
        return (
            <div className={styles.empty_state}>
                <h2>📭 Brak zadań na dziś</h2>
                <p>Wróć jutro po nowe wyzwania!</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Mathdle Daily</h1>
            </header>

            <div className={styles.card_grid}>
                {tasks.sort((a, b) => a.difficulty - b.difficulty).map((task) => (
                    <div 
                        key={task.task_id} 
                        className={`${styles.card} ${styles[`level_${task.difficulty}`]}`}
                        onClick={() => setSelectedTask(task)}
                    >
                        <div className={styles.card_content}>
                            <span className={styles.diff_label}>
                                {task.difficulty === 1 ? 'Łatwy' : task.difficulty === 2 ? 'Średni' : 'Trudny'}
                            </span>
                            <div className={styles.points}>{task.points} PKT</div>
                        </div>
                        <button className={styles.start_btn}>Rozpocznij</button>
                    </div>
                ))}
            </div>

            {selectedTask && (
                <div className={styles.modal_overlay} onClick={closeModal}>
                    <div className={styles.modal_content} onClick={e => e.stopPropagation()}>
                        <button className={styles.close_btn} onClick={closeModal}>&times;</button>
                        
                        <div className={styles.modal_header}>
                            <span>Zadanie #{selectedTask.task_id}</span>
                        </div>

                        <div className={styles.modal_body}>
                            <p className={styles.question_text}>{selectedTask.question}</p>
                            
                            <input 
                                type="text" 
                                className={styles.answer_input} 
                                placeholder="Wpisz wynik..." 
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                disabled={isSubmitting || feedback?.isCorrect}
                            />

                            {feedback && (
                                <div className={feedback.isCorrect ? styles.feedback_success : styles.feedback_error}>
                                    {feedback.message}
                                </div>
                            )}

                            {!feedback?.isCorrect ? (
                                <button 
                                    className={styles.check_btn} 
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !userAnswer.trim()}
                                >
                                    {isSubmitting ? "Sprawdzanie..." : "Sprawdź odpowiedź"}
                                </button>
                            ) : (
                                <button className={styles.check_btn} style={{backgroundColor: '#444'}} onClick={closeModal}>
                                    Zamknij zadanie
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}