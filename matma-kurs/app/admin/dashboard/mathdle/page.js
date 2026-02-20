'use client';
import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { pl } from 'date-fns/locale';
import styles from './page.module.css';

export default function MathdlePage() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [mounted, setMounted] = useState(false);

    // --- NOWE STANY ---
    const [monthStatus, setMonthStatus] = useState({}); // format: { '2026-02-20': [1, 1, 0] } (1-obsadzone, 0-brak)
    const [allTasks, setAllTasks] = useState([]); 
    const [selectedDayTasks, setSelectedDayTasks] = useState({ 1: '', 2: '', 3: '' }); 
    const [previewTask, setPreviewTask] = useState(null); 
    const [loading, setLoading] = useState(false);

    const months = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];

    useEffect(() => { 
        setMounted(true); 
        loadAllTasks();
    }, []);

    useEffect(() => {
    if (mounted) {
        loadMonthStatus();
        loadDayAssignments(); // Wczytaj zadania dla aktualnie wybranego dnia na starcie
    }
}, [currentMonth, selectedDate, mounted]);

const loadMonthStatus = async () => {
    const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
    // API powinno zwrócić listę dni i informację o slotach
    const res = await fetch(`/api/admin/mathdle/month-status?start=${start}&end=${end}`);
    const data = await res.json();
    setMonthStatus(data); 
};

    const loadAllTasks = async () => {
        try {
            const res = await fetch('/api/admin/task-structure');
            const data = await res.json();
            setAllTasks(data);
        } catch (err) { console.error("Błąd ładowania zadań:", err); }
    };

    const loadDayAssignments = async (date) => {
    try {
        const dateStr = format(date, 'yyyy-MM-dd');
        const res = await fetch(`/api/admin/mathdle/assignments?date=${dateStr}`);
        const data = await res.json();
        
        // Resetujemy sloty
        const newSlots = { 1: '', 2: '', 3: '' };
        
        // Wypełniamy tym co przyszło z bazy
        if (data && data.length > 0) {
            data.forEach(asg => {
                newSlots[asg.difficulty] = asg.task_id.toString();
            });
        }
        
        setSelectedDayTasks(newSlots);
    } catch (err) {
        console.error("Błąd ładowania dnia:", err);
    }
};

    const handleSlotChange = (difficulty, taskId) => {
        setSelectedDayTasks(prev => ({ ...prev, [difficulty]: taskId }));
        const taskDetails = allTasks.find(t => t.task_id === parseInt(taskId));
        setPreviewTask(taskDetails);
    };
    const handleDateClick = (date) => {
    setSelectedDate(date);
    // Po zmianie daty od razu ładujemy przypisania z bazy
    loadDayAssignments(date); 
};

    // Wewnątrz page.js w dashboard/mathdle
const handleSave = async () => {
    setLoading(true);
    // ... twój kod przygotowujący assignments ...

    try {
        const res = await fetch('/api/admin/mathdle/assign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: dateStr, assignments })
        });

        if (res.ok) {
            alert("Zapisano!");
            // KLUCZOWE: Wywołaj funkcję, która pobiera statusy dni (kropki)
            await loadMonthStatus(); 
        }
    } catch (err) {
        console.log(err);
    } finally {
        setLoading(false);
    }
};

    // --- DEFINICJA RENDER DAYS (MUSI BYĆ TUTAJ) ---
    const renderDays = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

        const calendarDays = [];
        let day = startDate;

        while (day <= endDate) {
            calendarDays.push(day);
            day = addDays(day, 1);
        }

        return (
        <div className={styles.calendar_grid}>
            {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map(d => (
                <div key={d} className={styles.weekday_label}>{d}</div>
            ))}
            {calendarDays.map((d, i) => {
                const dateKey = format(d, 'yyyy-MM-dd');
                const dayData = monthStatus[dateKey] || [0, 0, 0]; // np. [1, 0, 1]
                const filledCount = dayData.filter(s => s === 1).length;
                
                // Logika koloru kropki:
                // Jeśli 3/3 -> zielony
                // Jeśli 1/3 lub 2/3 -> czerwony
                // Jeśli 0/3 -> szary
                const getDotColor = () => {
                    if (filledCount === 3) return '#4caf50'; // Zielony
                    if (filledCount > 0) return '#f44336';   // Czerwony (niekompletne)
                    return '#ccc';                           // Szary
                };

                return (
                    <div
                        key={i}
                        className={`${styles.day_tile} ${
                            !isSameMonth(d, monthStart) ? styles.disabled : 
                            isSameDay(d, selectedDate) ? styles.selected : ""
                        }`}
                        onClick={() => setSelectedDate(d)}
                    >
                        {format(d, 'd')}
                        <div className={styles.dot_container}>
                            {dayData.map((slot, idx) => (
                                <div 
                                    key={idx} 
                                    className={styles.dot} 
                                    style={{ backgroundColor: slot === 1 ? getDotColor() : '#ccc' }}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

    if (!mounted) return null;

    return (
        <div className={styles.admin_wrapper}>
            {/* LEWA STRONA: KALENDARZ */}
            <div className={styles.calendar_section}>
                <div className={styles.header}>
                    <button className={styles.nav_button} onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>

                    <div className={styles.month_selector} onClick={() => setShowMonthPicker(!showMonthPicker)}>
                        <span className={styles.current_month_text}>
                            {format(currentMonth, 'MMMM yyyy', { locale: pl })}
                        </span>
                        {showMonthPicker && (
                            <div className={styles.month_dropdown}>
                                {months.map((m, idx) => (
                                    <div key={m} className={styles.month_item} onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentMonth(new Date(currentMonth.getFullYear(), idx, 1));
                                        setShowMonthPicker(false);
                                    }}>
                                        {m.substring(0, 3)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button className={styles.nav_button} onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
                {renderDays()}
            </div>

            {/* ŚRODKOWA STRONA: WYBÓR SLOTÓW */}
            <div className={styles.edit_panel}>
                <h2 className={styles.panel_title}>Plan na: {format(selectedDate, 'dd.MM.yyyy')}</h2>
                <div className={styles.task_setup}>
                    {[1, 2, 3].map((diff) => (
                        <div key={diff} className={styles.slot}>
                            <label>
                                {diff === 1 ? '🟢 Poziom Easy' : diff === 2 ? '🟡 Poziom Medium' : '🔴 Poziom Hard'}
                            </label>
                            <select 
                                className={styles.task_select}
                                value={selectedDayTasks[diff]}
                                onChange={(e) => handleSlotChange(diff, e.target.value)}
                            >
                                <option value="">Wybierz zadanie...</option>
                                {allTasks
                                    .filter(t => t.difficulty === diff)
                                    .map(t => (
                                        <option key={t.task_id} value={t.task_id}>
                                            ID: {t.task_id} | {t.question.substring(0, 30)}...
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                    ))}
                    <button className={styles.save_button} onClick={handleSave} disabled={loading}>
                        {loading ? "Zapisywanie..." : "Zatwierdź Trio w bazie"}
                    </button>
                </div>
            </div>

            {/* PRAWA STRONA: PODGLĄD */}
            <div className={styles.preview_panel}>
                <h3 className={styles.preview_title}>Podgląd zadania</h3>
                {previewTask ? (
                    <div className={styles.preview_content}>
                        <div className={styles.preview_id}>ID: {previewTask.task_id}</div>
                        <div className={styles.preview_question}>
                            <strong>Pytanie:</strong>
                            <p>{previewTask.question}</p>
                        </div>
                        <div className={styles.preview_meta}>
                            Typ: {previewTask.task_type_code} | Punkty: {previewTask.points}
                        </div>
                        <hr />
                        {/* Tu możesz dodać szybki podgląd odpowiedzi/hintów jeśli chcesz */}
                    </div>
                ) : (
                    <div className={styles.preview_placeholder}>
                        Wybierz zadanie ze slotu, aby zobaczyć treść.
                    </div>
                )}
            </div>
        </div>
    );
}