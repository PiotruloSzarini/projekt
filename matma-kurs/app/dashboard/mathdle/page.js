"use client";
import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function MathdleUserPage() {
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState("");
    const [completedCount, setCompletedCount] = useState(0);
    const [completedTaskIds, setCompletedTaskIds] = useState([]);

    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetch('/api/admin/mathdle/today')
            .then(res => res.json())
            .then(data => {
                const tasksData = Array.isArray(data) ? data : [];
                setTasks(tasksData.sort((a, b) => a.difficulty - b.difficulty));
                setLoading(false);
            })
            .catch(err => {
                console.error("Błąd pobierania zadań:", err);
                setLoading(false);
            });

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

    // OBLICZANIE POSTĘPU (Zdefiniowane tutaj, aby pasek u góry je widział)
    const progressPercent = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

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
            if (result.isCorrect) {
                setCompletedCount(prev => prev + 1);
                setCompletedTaskIds(prev => [...prev, selectedTask.task_id]);
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
                <div className={styles.banner}>
                    <h1 className={styles.banner_title}>Daily challenge</h1>
                    <p className={styles.banner_desc}>
                        Rozwiązuj zadania matematyczne i rywalizuj z innymi! Wykonuj codzienne zadania, zgarniaj punkty i pnij się w rankingu. 
                        Poniżej Twoja dzisiejsza dawka matematycznych zagwozdek:
                    </p>
                    
                    <div className={styles.filter_bar}>
                    {/* Białe wypełnienie paska */}
                    <div 
                        className={styles.progress_fill} 
                        style={{ width: `${progressPercent}%` }}
                    ></div>

                    {/* Dynamiczne podświetlanie elementów */}
                        <div className={styles.item_container}>
                            <div className={`${styles.filter_item} ${completedCount === 0 ? styles.active_filter : ""}`}>
                                ŁATWE
                            </div>
                            <div className={`${styles.filter_item} ${completedCount === 1 ? styles.active_filter : ""}`}>
                                ŚREDNIE
                            </div>
                            <div className={`${styles.filter_item} ${completedCount === 2 ? styles.active_filter : ""}`}>
                                TRUDNE
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.card_grid}>
                    {tasks.map((task, index) => {
                        const isDone = completedTaskIds.includes(task.task_id);
                        const isLocked = index > 0 && !completedTaskIds.includes(tasks[index - 1].task_id);
                        
                        return (
                            <div 
                                key={task.task_id} 
                                className={`${styles.card} ${isLocked ? styles.card_locked : ""} ${isDone ? styles.card_done : ""}`}
                            >
                                {isDone && (
                                    <div className={styles.done_overlay}>
                                        <svg width="150" height="113" viewBox="0 0 150 113" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M126.285 4.87412C128.513 2.1775 131.705 0.456958 135.183 0.0787463C138.66 -0.299466 142.148 0.69452 144.904 2.84912C146.257 3.89713 147.386 5.20579 148.225 6.69775C149.064 8.1897 149.595 9.83467 149.787 11.5354C149.98 13.2362 149.829 14.9583 149.345 16.5998C148.86 18.2414 148.051 19.7692 146.966 21.0929L76.4661 107.718C75.2862 109.149 73.8222 110.32 72.1665 111.156C70.5109 111.993 68.6997 112.477 66.8475 112.577C64.9953 112.677 63.1425 112.392 61.4061 111.74C59.6697 111.088 58.0876 110.082 56.7598 108.787L3.88484 56.8491L2.9661 55.8741C-1.2714 50.7741 -0.971408 43.2554 3.88484 38.4929C8.74109 33.7304 16.4098 33.4304 21.6036 37.5929L22.5973 38.4929L65.1598 80.1179L126.472 4.93037L126.285 4.87412Z" fill="#FEFFFF"/>
                                        </svg>

                                    </div>
                                )}

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
                                    onClick={() => !isLocked && !isDone && setSelectedTask(task)}
                                    disabled={isLocked || isDone}
                                >
                                    {isDone ? "Ukończono" : isLocked ? "Zablokowane" : "Rozpocznij"}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

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