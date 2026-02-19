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

    const months = [
        'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
        'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
    ];

    useEffect(() => { setMounted(true); }, []);
    if (!mounted) return null;

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
                {calendarDays.map((d, i) => (
                    <div
                        key={i}
                        className={`${styles.day_tile} ${
                            !isSameMonth(d, monthStart) ? styles.disabled : 
                            isSameDay(d, selectedDate) ? styles.selected : ""
                        }`}
                        onClick={() => setSelectedDate(d)}
                    >
                        {format(d, 'd')}
                        <div className={styles.dot_indicator}></div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className={styles.admin_wrapper}>
            {/* LEWA STRONA: KALENDARZ */}
            <div className={styles.calendar_section}>
                <div className={styles.header}>
                    <button 
                        className={styles.nav_button} 
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m15 18-6-6 6-6"/>
                        </svg>
                    </button>

                    <div className={styles.month_selector} onClick={() => setShowMonthPicker(!showMonthPicker)}>
                        <span className={styles.current_month_text}>
                            {format(currentMonth, 'MMMM yyyy', { locale: pl })}
                        </span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={showMonthPicker ? styles.rotate : ""}>
                            <path d="m6 9 6 6 6-6"/>
                        </svg>

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

                    <button 
                        className={styles.nav_button} 
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m9 18 6-6-6-6"/>
                        </svg>
                    </button>
                </div>
                {renderDays()}
            </div>

            {/* PRAWA STRONA: PANEL EDYCJI */}
            <div className={styles.edit_panel}>
                <h2 className={styles.panel_title}>Plan na: {format(selectedDate, 'dd.MM.yyyy')}</h2>
                <div className={styles.task_setup}>
                    <div className={styles.slot}>
                        <label>🟢 Poziom Easy</label>
                        <select className={styles.task_select}>
                            <option>Wybierz zadanie...</option>
                        </select>
                    </div>
                    <div className={styles.slot}>
                        <label>🟡 Poziom Medium</label>
                        <select className={styles.task_select}>
                            <option>Wybierz zadanie...</option>
                        </select>
                    </div>
                    <div className={styles.slot}>
                        <label>🔴 Poziom Hard</label>
                        <select className={styles.task_select}>
                            <option>Wybierz zadanie...</option>
                        </select>
                    </div>
                    <button className={styles.save_button}>Zatwierdź Trio w bazie</button>
                </div>
            </div>
        </div>
    );
}