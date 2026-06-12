'use client';

/**
 * MATHDLE ADMIN DASHBOARD
 * Ten komponent zarządza kalendarzem zadań Mathdle.
 * Naprawiono: Hydration Error, JSON Parsing Error, API 404 handling.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
    format, 
    startOfMonth, 
    endOfMonth, 
    startOfWeek, 
    endOfWeek, 
    addDays, 
    isSameMonth, 
    isSameDay, 
    addMonths, 
    subMonths 
} from 'date-fns';
import { pl } from 'date-fns/locale';
import styles from './page.module.css';

export default function MathdlePage() {
    // --- STAN KOMPONENTU ---
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSpecialEvent, setIsSpecialEvent] = useState(false);

    // --- STAN DANYCH ---
    const [monthStatus, setMonthStatus] = useState({}); 
    const [allTasks, setAllTasks] = useState([]); 
    const [selectedDayTasks, setSelectedDayTasks] = useState({ 1: '', 2: '', 3: '' }); 
    const [previewTask, setPreviewTask] = useState(null); 

    const months = [
        'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 
        'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
    ];

    /**
     * Bezpieczne pobieranie JSON.
     * Zapobiega błędowi "Unexpected token <", sprawdzając czy odpowiedź to faktycznie JSON,
     * a nie strona błędu HTML 404.
     */
    const safeFetch = async (url, options = {}) => {
        try {
            const res = await fetch(url, options);
            const contentType = res.headers.get("content-type");

            if (!res.ok) {
                console.warn(`Serwer zwrócił status ${res.status} dla: ${url}`);
                return null;
            }

            if (!contentType || !contentType.includes("application/json")) {
                console.error(`Oczekiwano JSON, otrzymano: ${contentType}. Sprawdź czy plik API istnieje.`);
                return null;
            }

            return await res.json();
        } catch (err) {
            console.error(`Błąd sieci/fetch dla ${url}:`, err);
            return null;
        }
    };

    // 1. Inicjalizacja komponentu (Mounting)
    useEffect(() => { 
        setMounted(true); 
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        await loadAllTasks();
        const now = new Date();
        await loadMonthStatus(now);
        await loadDayAssignments(now);
    };

    // 2. Automatyczne odświeżanie kropek przy zmianie miesiąca
    useEffect(() => {
        if (mounted) {
            loadMonthStatus(currentMonth);
        }
    }, [currentMonth, mounted]);

    // --- FUNKCJE API ---

    const loadMonthStatus = async (month) => {
        const start = format(startOfMonth(month), 'yyyy-MM-dd');
        const end = format(endOfMonth(month), 'yyyy-MM-dd');
        const data = await safeFetch(`/api/admin/mathdle/month-status?start=${start}&end=${end}`);
        if (data) setMonthStatus(data);
    };

    const loadAllTasks = async () => {
        const data = await safeFetch('/api/admin/task-structure');
        if (data) setAllTasks(data);
    };

    const loadDayAssignments = async (date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const data = await safeFetch(`/api/admin/mathdle/assignments?date=${dateStr}`);
        
        const newSlots = { 1: '', 2: '', 3: '' };
        if (data && Array.isArray(data)) {
            data.forEach(asg => {
                newSlots[asg.difficulty] = asg.task_id.toString();
            });
        }
        setSelectedDayTasks(newSlots);
        setPreviewTask(null);
    };

    // --- OBSŁUGA ZDARZEŃ ---

    const handleSlotChange = (difficulty, taskId) => {
        setSelectedDayTasks(prev => ({ ...prev, [difficulty]: taskId }));
        const taskDetails = allTasks.find(t => t.task_id === parseInt(taskId));
        if (taskDetails) setPreviewTask(taskDetails);
    };

    const handleDateClick = (date) => {
        setSelectedDate(date);
        loadDayAssignments(date); 
    };

    const handleSave = async () => {
    setLoading(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    // 1. Wyciągamy wybrane ID zadań
    const assignments = Object.entries(selectedDayTasks)
        .filter(([_, id]) => id !== '' && id !== null)
        .map(([diff, id]) => ({
            assignment_date: dateStr,
            task_id: parseInt(id),
            difficulty: parseInt(diff),
            special_event: isSpecialEvent 
        }));

    // 2. Obsługa usuwania: Jeśli tablica jest pusta, pytamy o wyczyszczenie dnia
    if (assignments.length === 0) {
        const confirmClear = window.confirm("Nie wybrano żadnych zadań. Czy chcesz całkowicie wyczyścić ten dzień?");
        if (!confirmClear) {
            setLoading(false);
            return;
        }
    }

    // 3. Walidacja lokalna: Czy nie ma dwóch takich samych zadań w jednym dniu
    const selectedIds = assignments.map(a => a.task_id);
    const hasDuplicatesToday = new Set(selectedIds).size !== selectedIds.length;
    
    if (hasDuplicatesToday) {
        alert("❌ Błąd: Wybrałeś to samo zadanie dla różnych poziomów trudności!");
        setLoading(false);
        return;
    }

    // 4. Wysyłka do API
    const response = await fetch('/api/admin/mathdle/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr, assignments })
    });

    const result = await response.json(); // Pobieramy body odpowiedzi

    // 5. Obsługa odpowiedzi
    if (response.ok) { // Sprawdza czy status to 200-299
        alert(assignments.length > 0 ? "✅ Zapisano pomyślnie!" : "🗑️ Wyczyszczono dzień!");
        await loadMonthStatus(currentMonth); 
        setIsSpecialEvent(false); 
    } else {
        // Wyświetla konkretny błąd z serwera przekazany w JSON
        alert(`❌ Błąd: ${result.error || "Nie udało się zapisać zmian."}`);
    }
    setLoading(false);
};
    // --- RENDEROWANIE KALENDARZA ---

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
                    // Pobieramy dane [easy, medium, hard, isSpecial]
                    const dayData = monthStatus[dateKey] || [0, 0, 0, false];
                    
                    const filledCount = dayData.slice(0, 3).filter(s => s === 1).length;
                    const isDaySpecial = dayData[3] === true || dayData[3] === 1;
                    
                    const getDotColor = (isFilled) => {
                        if (!isFilled) return '#e0e0e0'; // Szary dla pustych
                        if (isDaySpecial) return '#9b59b6'; // Fioletowy dla Special Event
                        return filledCount === 3 ? '#4caf50' : '#ff9800'; // Zielony/Pomarańczowy
                    };

                    return (
                        <div
                            key={i}
                            className={`${styles.day_tile} ${
                                !isSameMonth(d, monthStart) ? styles.disabled : 
                                isSameDay(d, selectedDate) ? styles.selected : ""
                            }`}
                            onClick={() => handleDateClick(d)}
                        >
                            <span className={styles.day_number}>{format(d, 'd')}</span>
                            <div className={styles.dot_container}>
                                {[0, 1, 2].map((idx) => (
                                    <div 
                                        key={idx} 
                                        className={`${styles.dot} ${isDaySpecial && dayData[idx] === 1 ? styles.dot_special : ''}`} 
                                        style={{ backgroundColor: getDotColor(dayData[idx] === 1) }}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    if (!mounted) return <div className={styles.loader}>Ładowanie panelu...</div>;

    return (
        <div className={styles.admin_wrapper}>
            {/* SEKCOJA LEWA: KALENDARZ I NAWIGACJA */}
            <div className={styles.calendar_section}>
                <div className={styles.header}>
                    <button className={styles.nav_button} onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
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
                                        {m}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button className={styles.nav_button} onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                </div>
                
                <div className={styles.calendar_container}>
                    {renderDays()}
                </div>
            </div>

            {/* SEKCJA ŚRODKOWA: PANEL EDYCJI */}
            <div className={styles.edit_panel}>
                <div className={styles.panel_header}>
                    <h2 className={styles.panel_title}>📅 Edytujesz: {format(selectedDate, 'd MMMM yyyy', { locale: pl })}</h2>
                </div>

                <div className={styles.task_setup}>
                    {[1, 2, 3].map((diff) => (
                        <div key={diff} className={styles.slot_box}>
                            <label className={styles.slot_label}>
                                {diff === 1 ? '🟢 Poziom Łatwy' : diff === 2 ? '🟡 Poziom Średni' : '🔴 Poziom Trudny'}
                            </label>
                            <select 
                                className={styles.task_select}
                                value={selectedDayTasks[diff] || ""}
                                onChange={(e) => handleSlotChange(diff, e.target.value)}
                            >
                                <option value="">--- Wybierz zadanie ---</option>
                                {allTasks
                                    .filter(t => Number(t.difficulty) === diff)
                                    .map(t => (
                                        <option key={t.task_id} value={t.task_id}>
                                            ID: {t.task_id} | [{t.task_type_code}] {t.question.substring(0, 40)}...
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                    ))}
                    <div className={styles.special_event_control}>
    <label className={styles.checkbox_label}>
        <input 
            type="checkbox" 
            checked={isSpecialEvent} 
            onChange={(e) => setIsSpecialEvent(e.target.checked)} 
        />
        <span>🌟 Wydarzenie specjalne</span>
    </label>
</div>
                    <div className={styles.actions}>
                        <button 
                            className={styles.save_button} 
                            onClick={handleSave} 
                            disabled={loading}
                        >
                            
                            {loading ? "Przetwarzanie..." : "Zapisz plan dnia"}
                        </button>
                    </div>
                </div>
            </div>

            {/* SEKCJA PRAWA: PODGLĄD TREŚCI ZADANIA */}
      {/* SEKCJA PRAWA: PODGLĄD TREŚCI ZADANIA */}
            <div className={styles.preview_panel}>
                <h3 className={styles.preview_title}>🔍 Szczegóły wybranego zadania</h3>
                {previewTask ? (
                    <div className={styles.preview_card}>
                        <div className={styles.preview_row}>
                            <span className={styles.badge}>ID: {previewTask.task_id}</span>
                            <span className={styles.badge_type}>{previewTask.task_type_code}</span>
                            <span className={styles.badge_pts}>{previewTask.points} PKT</span>
                        </div>
                        
                        <div className={styles.preview_body}>
                            <p className={styles.question_text}>{previewTask.question}</p>

                            {/* OPCJE DLA MULTIPLE CHOICE */}
                            {previewTask.data?.multiple_choice?.answers && (
                                <div className={styles.options_preview}>
                                    <strong>Opcje wyboru:</strong>
                                    <ul>
                                        {previewTask.data.multiple_choice.answers.map((a, idx) => (
                                            <li key={idx} style={{ color: a.is_correct ? '#2e7d32' : 'inherit', fontWeight: a.is_correct ? 'bold' : 'normal' }}>
                                                {a.answer_text} {a.is_correct && "✅"}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* ODPOWIEDŹ */}
                            {previewTask.answer && (
                                <div className={styles.answer_box}>
                                    <strong>Poprawna odpowiedź:</strong> {previewTask.answer}
                                </div>
                            )}

                            {/* PODPODWIEDZI */}
                            {Array.isArray(previewTask.hints) && previewTask.hints.length > 0 && (
                                <div className={styles.hints_preview}>
                                    <h4>💡 Podpowiedzi:</h4>
                                    {previewTask.hints.map((h, idx) => (
                                        <div key={idx} className={styles.hint_item} style={{ padding: '5px', background: '#f5f5f5', marginBottom: '5px', borderRadius: '4px' }}>
                                            <span>{idx + 1}.</span> {h.hint_text}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* WYJAŚNIENIE */}
                            {previewTask.explanation?.steps && Array.isArray(previewTask.explanation.steps) && previewTask.explanation.steps.length > 0 && (
                                <div className={styles.explanation_preview}>
                                    <h4>📖 Wyjaśnienie:</h4>
                                    {previewTask.explanation.steps.map((s, idx) => (
                                        <div key={idx} className={styles.step_item} style={{ fontSize: '0.9rem', marginBottom: '8px' }}>
                                            <strong>Krok {idx + 1}:</strong> {s.step_text}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className={styles.empty_preview}>
                        <p>Kliknij na slot zadania, aby wyświetlić jego pełną treść tutaj.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
