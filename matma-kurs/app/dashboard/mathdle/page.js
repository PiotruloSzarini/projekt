"use client";
import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function MathdleUserPage() {
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState("");
    const [completedCount, setCompletedCount] = useState(0);

    // --- STANY DLA ODPOWIEDZI ---
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 1. Pobieranie danych i licznik
    useEffect(() => {
        // Pobieranie zadań na dziś
        fetch('/api/admin/mathdle/today')
            .then(res => res.json())
            .then(data => {
                const tasksData = Array.isArray(data) ? data : [];
                setTasks(tasksData);
                setLoading(false);
            })
            .catch(err => {
                console.error("Błąd pobierania zadań:", err);
                setLoading(false);
            });

        // Opcjonalne: Pobieranie postępu (jeśli masz już to API)
        // fetch('/api/admin/mathdle/progress?userId=1')
        //     .then(res => res.json())
        //     .then(data => setCompletedCount(data.count || 0));

        const timer = setInterval(() => {
            const now = new Date();
            const tomorrow = new Date();
            tomorrow.setHours(24, 0, 0, 0);
            const diff = tomorrow - now;

            if (diff <= 0) {
                setTimeLeft("00:00:00");
                return;
            }

            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            const format = (num) => String(num).padStart(2, '0');
            setTimeLeft(`${format(hours)}:${format(minutes)}:${format(seconds)}`);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

  
    const handleSubmit = async () => {
        if (!userAnswer.trim()) return;
        
        setIsSubmitting(true);
        setFeedback(null);

        try {
            const response = await fetch('/api/admin/mathdle/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 1, 
                    taskId: selectedTask.task_id,
                    difficulty: selectedTask.difficulty,
                    userAnswer: userAnswer
                })
            });

            const result = await response.json();
            setFeedback(result);

            // Jeśli poprawnie, zwiększ licznik lokalnie (do czasu odświeżenia)
            if (result.isCorrect) {
                setCompletedCount(prev => prev + 1);
            }
        } catch (error) {
            setFeedback({ isCorrect: false, message: "Błąd serwera. Spróbuj później." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeModal = () => {
        setSelectedTask(null);
        setFeedback(null);
        setUserAnswer('');
    };

    if (loading) return <div className={styles.loader}>Wczytywanie wyzwań...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.content_wrapper}>
                {/* BANER GÓRNY */}
                <div className={styles.banner}>
                    <h1 className={styles.banner_title}>Daily challenge</h1>
                    <p className={styles.banner_desc}>
                        Rozwiązuj zadania matematyczne i rywalizuj z innymi! Wykonuj codzienne zadania, zgarniaj punkty i pnij się w rankingu. 
                        Poniżej Twoja dzisiejsza dawka matematycznych zagwozdek:
                    </p>
                    
                    <div className={styles.filter_bar}>
                        <div className={styles.filter_item}>ŁATWE</div>
                        <div className={styles.filter_item}>ŚREDNIE</div>
                        <div className={styles.filter_item}>TRUDNE</div>
                    </div>

                    <div className={styles.stats_row}>
                        <span>Ukończono {completedCount}/{tasks.length}</span>
                        <span>pozostało {timeLeft}</span>
                    </div>
                </div>

                {/* GRID Z KAFELKAMI */}
                <div className={styles.card_grid}>
                    {tasks.length > 0 ? (
                        tasks.sort((a, b) => a.difficulty - b.difficulty).map((task, index) => (
                            <div key={task.task_id} className={styles.card}>
                                <div className={styles.icon_wrapper}>
                                    <img 
                                        src={
                                            task.difficulty === 1 ? "/assets/img/dashboardLayoutIcons/calc.svg" : 
                                            task.difficulty === 2 ? "/assets/img/dashboardLayoutIcons/geo.svg" : 
                                            "/assets/img/dashboardLayoutIcons/func.svg"
                                        } 
                                        alt="ikona" 
                                        className={styles.card_icon}
                                    />
                                </div>
                                <div className={styles.card_info}>
                                    <h3>Zadanie {index + 1}: {task.difficulty === 1 ? 'Łatwe' : task.difficulty === 2 ? 'Średnie' : 'Trudne'}</h3>
                                    <p className={styles.points_label}>
                                        {task.difficulty === 1 ? '1 punkt' : 
                                         task.difficulty === 2 ? '2 punkty' : 
                                         '3 punkty'}
                                    </p>
                                </div>
                                <button 
                                    className={styles.start_btn} 
                                    onClick={() => setSelectedTask(task)}
                                >
                                    Rozpocznij
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className={styles.empty_state}>
                            <h2>📭 Brak zadań na dziś</h2>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL Z TREŚCIĄ ZADANIA */}
            {selectedTask && (
                <div className={styles.modal_overlay} onClick={closeModal}>
                    <div className={styles.modal_content} onClick={e => e.stopPropagation()}>
                        <button className={styles.close_btn_top} onClick={closeModal}>&times;</button>
                        
                        <div className={styles.modal_body}>
                            <h2 className={styles.modal_task_id}>Zadanie #{selectedTask.task_id}</h2>
                            <p className={styles.question_text}>{selectedTask.question}</p>
                            
                            <input 
                                type="text" 
                                className={styles.answer_input} 
                                placeholder="Wpisz wynik..." 
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                disabled={isSubmitting || feedback?.isCorrect}
                                autoFocus
                            />

                            {feedback && (
                                <div className={feedback.isCorrect ? styles.feedback_success : styles.feedback_error}>
                                    {feedback.message}
                                </div>
                            )}

                            {!feedback?.isCorrect ? (
                                <button 
                                    className={styles.modal_submit_btn} 
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !userAnswer.trim()}
                                >
                                    {isSubmitting ? "Sprawdzanie..." : "Sprawdź odpowiedź"}
                                </button>
                            ) : (
                                <button className={styles.modal_close_final} onClick={closeModal}>
                                    Zamknij i odbierz nagrodę
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
