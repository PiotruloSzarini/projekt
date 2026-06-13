"use client";

import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import { fetchTasksFromDB, addTaskToDB, toggleTaskInDB, deleteTaskFromDB } from './actions';

export default function PlanNaukiPage() {
    const loggedInUserId = 1;
    const now = new Date();

    const [tasks, setTasks] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [loading, setLoading] = useState(true);

    const [currentYear, setCurrentYear] = useState(now.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(now.getMonth());

    const gridRef = useRef(null);

    const monthNames = [
        'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
        'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
    ];

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            const data = await fetchTasksFromDB(loggedInUserId);
            setTasks(Array.isArray(data) ? data : []);
            setLoading(false);
        };

        loadInitialData();
    }, []);

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim() || !selectedDate) return;

        const addedTask = await addTaskToDB(loggedInUserId, newTaskTitle, selectedDate);
        if (addedTask) {
            setTasks(prev => [...prev, addedTask]);
            setNewTaskTitle('');
        }
    };

    const handleToggleTask = async (taskId) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_completed: t.is_completed === 1 ? 0 : 1 } : t));
        await toggleTaskInDB(loggedInUserId, taskId);
    };

    const handleDeleteTask = async (taskId) => {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        await deleteTaskFromDB(loggedInUserId, taskId);
    };

    const generateCalendarCells = () => {
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        let firstDayIndex = new Date(currentYear, currentMonth, 1).getDay() - 1;
        if (firstDayIndex === -1) firstDayIndex = 6;

        const prevMonthDaysCount = new Date(currentYear, currentMonth, 0).getDate();
        const prevCells = [];
        for (let i = firstDayIndex - 1; i >= 0; i--) {
            prevCells.push({ day: prevMonthDaysCount - i, isCurrent: false, type: 'prev' });
        }

        const currentCells = [];
        for (let i = 1; i <= daysInMonth; i++) {
            currentCells.push({ day: i, isCurrent: true, type: 'current' });
        }

        const totalCellsSoFar = prevCells.length + currentCells.length;
        const nextCellsCount = totalCellsSoFar % 7 === 0 ? 0 : 7 - (totalCellsSoFar % 7);
        const nextCells = [];
        for (let i = 1; i <= nextCellsCount; i++) {
            nextCells.push({ day: i, isCurrent: false, type: 'next' });
        }

        return [...prevCells, ...currentCells, ...nextCells];
    };

    const handlePrevMonth = () => {
        setSelectedDate(null);
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(prev => prev - 1);
        } else {
            setCurrentMonth(prev => prev - 1);
        }
    };

    const handleNextMonth = () => {
        setSelectedDate(null);
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(prev => prev + 1);
        } else {
            setCurrentMonth(prev => prev + 1);
        }
    };

    const handleDayClick = (e, cell) => {
        if (!cell.isCurrent) return;

        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;

        if (selectedDate === dateStr) {
            setSelectedDate(null);
            return;
        }

        const cellRect = e.currentTarget.getBoundingClientRect();
        const gridRect = gridRef.current.getBoundingClientRect();

        const top = cellRect.bottom - gridRect.top + 8;
        let left = cellRect.left - gridRect.left;

        const popupWidth = 380;
        if (left + popupWidth > gridRect.width) {
            left = gridRect.width - popupWidth - 10;
        }

        setPopupPosition({ top, left });
        setSelectedDate(dateStr);
    };

    if (loading) return <div className={styles.loader}>Wczytywanie Twojego planu dnia...</div>;

    const calendarCells = generateCalendarCells();
    const activeDayTasks = tasks.filter(t => t.task_date === selectedDate);
    const activeDayNumber = selectedDate ? parseInt(selectedDate.split('-')[2], 10) : null;

    return (
        <div className={styles.container}>
            <div className={styles.month_selector}>
                <button className={styles.nav_btn} onClick={handlePrevMonth}>← Poprzedni miesiąc</button>
                <div className={styles.current_month}>{monthNames[currentMonth]} {currentYear}</div>
                <button className={styles.nav_btn} onClick={handleNextMonth}>Następny miesiąc →</button>
            </div>

            <div className={styles.calendar_card}>
                <div className={styles.weekdays_row}>
                    {['PONIEDZIAŁEK', 'WTOREK', 'ŚRODA', 'CZWARTEK', 'PIĄTEK', 'SOBOTA', 'NIEDZIELA'].map(day => (
                        <div key={day} className={styles.weekday_cell}>{day}</div>
                    ))}
                </div>

                <div className={styles.grid_container} ref={gridRef}>
                    {calendarCells.map((cell, index) => {
                        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
                        const dayTasks = tasks.filter(t => t.task_date === dateStr);

                        return (
                            <div
                                key={`${cell.type}-${cell.day}-${index}`}
                                className={`${styles.day_box} ${!cell.isCurrent ? styles.inactive_day : ''} ${selectedDate === dateStr ? styles.selected_day : ''}`}
                                onClick={(e) => handleDayClick(e, cell)}
                            >
                                <span className={styles.day_num}>{cell.day}</span>

                                {cell.isCurrent && dayTasks.length > 0 && (
                                    <div className={styles.task_badge}>
                                        {dayTasks.length === 1 ? '1 zadanie' : `${dayTasks.length} zadania`}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {selectedDate && (
                        <div
                            className={styles.floating_popup}
                            style={{ top: `${popupPosition.top}px`, left: `${popupPosition.left}px` }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={styles.popup_header}>
                                <h3>{activeDayNumber} {monthNames[currentMonth]} {currentYear}:</h3>
                                <button className={styles.close_mini_btn} onClick={() => setSelectedDate(null)}>&times;</button>
                            </div>

                            <form onSubmit={handleAddTask} className={styles.task_input_row}>
                                <span className={styles.bullet_icon}>⬠</span>
                                <input
                                    type="text"
                                    placeholder="Dodaj zadanie i kliknij Enter +"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    className={styles.plain_input}
                                />
                            </form>

                            <div className={styles.popup_tasks_list}>
                                {activeDayTasks.length > 0 ? (
                                    activeDayTasks.map(task => (
                                        <div key={task.id} className={styles.task_row}>
                                            <div className={styles.task_left}>
                                                <input
                                                    type="checkbox"
                                                    checked={task.is_completed === 1}
                                                    onChange={() => handleToggleTask(task.id)}
                                                    className={styles.custom_checkbox}
                                                />
                                                <span className={`${styles.task_title} ${task.is_completed === 1 ? styles.line_through : ''}`}>
                                                    {task.title}
                                                </span>
                                            </div>
                                            <button className={styles.delete_action} onClick={() => handleDeleteTask(task.id)}>
                                                <span>Usuń</span>
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className={styles.empty_state}>Brak zadań na ten dzień.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
