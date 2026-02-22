"use client";
import { useState, useEffect } from 'react';
import styles from './page.module.css';

export default function MathdleUserPage() {
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/mathdle/today')
            .then(res => res.json())
            .then(data => {
                // API zwraca tablicę zadań na dziś
                setTasks(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error("Błąd pobierania zadań:", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className={styles.loader}>Wczytywanie wyzwań...</div>;
    
    if (tasks.length === 0) {
        return (
            <div className={styles.empty_state}>
                <h2>📭 Brak zadań na dziś</h2>
                <p>Administrator nie zaplanował jeszcze wyzwań. Wróć później!</p>
            </div>
        );
    }

    const isSpecial = tasks[0]?.special_event;

    return (
        <div className={`${styles.container} ${isSpecial ? styles.special_theme : ''}`}>
            <header className={styles.header}>
                <h1 className={styles.title}>Mathdle Daily</h1>
                <p className={styles.date}>{new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                {isSpecial && <div className={styles.special_badge}>🌟 WYDARZENIE SPECJALNE: 2x PKT</div>}
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

            {/* MODAL ZADANIA */}
            {selectedTask && (
                <div className={styles.modal_overlay} onClick={() => setSelectedTask(null)}>
                    <div className={styles.modal_content} onClick={e => e.stopPropagation()}>
                        <button className={styles.close_btn} onClick={() => setSelectedTask(null)}>&times;</button>
                        
                        <div className={styles.modal_header}>
                            <span>Zadanie ID: #{selectedTask.task_id}</span>
                            <span className={styles.modal_points}>{selectedTask.points} PKT</span>
                        </div>

                        <div className={styles.modal_body}>
                            <p className={styles.question_text}>{selectedTask.question}</p>
                            
                            {/* Prosty input na start - potem go rozbudujemy */}
                            <input type="text" className={styles.answer_input} placeholder="Wpisz wynik..." />
                            <button className={styles.check_btn}>Sprawdź odpowiedź</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}