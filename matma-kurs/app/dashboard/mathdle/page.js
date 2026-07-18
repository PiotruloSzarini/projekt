'use client';
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';
import DailyChallangeEntry from '../components/DailyChallangeComponents/DailyChallangeEntry/DailyChallangeEntry';
import DailyChallangeCard from '../components/DailyChallangeComponents/DailyChallangeCard/DailyChallangeCard';
import TaskTypeSingleInput from '../components/TasksComponents/TaskTypePages/TaskTypeSingleInput/TaskTypeSingleInput';
import TaskTypeMultipleChoice from '../components/TasksComponents/TaskTypePages/TaskTypeMultipleChoice/TaskTypeMultipleChoice';
import TaskTypeStepByStep from '../components/TasksComponents/TaskTypePages/TaskTypeStepByStep/TaskTypeStepByStep';
import TaskTypeMatching from '../components/TasksComponents/TaskTypePages/TaskTypeMatching/TaskTypeMatching';
import { useUser } from '@/app/context/UserContext';
import MathRender from '@/app/components/MathRender/MathRender';

const DIFFICULTY_META = {
    1: { label: 'ŁATWE', points: 1, theme: '#1180F6' },
    2: { label: 'ŚREDNIE', points: 3, theme: '#0f766e' },
    3: { label: 'TRUDNE', points: 5, theme: '#032327' },
};

function getDefaultAnswer(task) {
    const typeCode = String(task?.task_type_code || '').trim().toUpperCase();
    if (typeCode === 'MULTIPLE_CHOICE') return null;
    if (typeCode === 'MATCHING' || typeCode === 'STEP_BY_STEP') return {};
    return '';
}

export default function MathdleUserPage() {
    const { user, refresh: refreshUser } = useUser();
    const [tasks, setTasks] = useState([]);
    const [completedTaskIds, setCompletedTaskIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskAnswer, setTaskAnswer] = useState('');
    const [stepIndex, setStepIndex] = useState(0);
    const [visibleHintsCount, setVisibleHintsCount] = useState(0);
    const [feedback, setFeedback] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [choiceFeedback, setChoiceFeedback] = useState(null);

    const completedCount = completedTaskIds.length;
    const activeTaskType = String(selectedTask?.task_type_code || '').trim().toUpperCase();
    const stepDetails = selectedTask?.details?.step_by_step?.steps || [];
    const activeStep = stepDetails[stepIndex] || null;
    const multipleChoiceTask = selectedTask ? { ...selectedTask, details: selectedTask.details?.multiple_choice || {} } : null;
    const matchingTask = selectedTask ? { ...selectedTask, details: selectedTask.details?.matching_pairs || {} } : null;
    const stepTask = selectedTask ? { ...selectedTask, details: selectedTask.details?.step_by_step || {} } : null;

    const canSubmit = useMemo(() => {
        if (!selectedTask) return false;
        if (activeTaskType === 'MULTIPLE_CHOICE') return taskAnswer !== null;
        if (activeTaskType === 'MATCHING') return Object.keys(taskAnswer || {}).length > 0;
        if (activeTaskType === 'STEP_BY_STEP') {
            return !!activeStep && !!String(taskAnswer?.[activeStep.step_id] ?? '').trim();
        }
        return !!String(taskAnswer ?? '').trim();
    }, [activeTaskType, activeStep, selectedTask, taskAnswer]);

    useEffect(() => {
        const loadDaily = async () => {
            try {
                const res = await fetch('/api/mathdle/today');
                const data = await res.json();
                setTasks(Array.isArray(data.tasks) ? data.tasks : []);
                setCompletedTaskIds(Array.isArray(data.completedTaskIds) ? data.completedTaskIds : []);
            } catch (err) {
                console.error('Błąd pobierania zadań:', err);
                setTasks([]);
                setCompletedTaskIds([]);
            } finally {
                setLoading(false);
            }
        };

        loadDaily();
    }, []);

    const sortedTasks = useMemo(() => [...tasks].sort((a, b) => a.difficulty - b.difficulty), [tasks]);

    const closePanel = () => {
        setSelectedTask(null);
        setTaskAnswer('');
        setStepIndex(0);
        setVisibleHintsCount(0);
        setFeedback(null);
        setChoiceFeedback(null);
    };

    const openTask = (task) => {
        if (!task || task.isCompleted) return;
        const index = sortedTasks.findIndex((item) => item.task_id === task.task_id);
        const previousTask = sortedTasks[index - 1];
        const isUnlocked = index === 0 || completedTaskIds.includes(previousTask?.task_id);

        if (!isUnlocked) return;

        setSelectedTask(task);
        setTaskAnswer(getDefaultAnswer(task));
        setStepIndex(0);
        setVisibleHintsCount(0);
        setFeedback(null);
        setChoiceFeedback(null);
    };

    const handleSubmit = async () => {
        if (!selectedTask || isSubmitting || !canSubmit) return;

        const stepId = activeTaskType === 'STEP_BY_STEP' ? activeStep?.step_id : undefined;
        const currentAnswer = activeTaskType === 'STEP_BY_STEP'
            ? taskAnswer?.[activeStep?.step_id] ?? ''
            : taskAnswer;

        setIsSubmitting(true);
        setFeedback(null);
        setChoiceFeedback(null);

        try {
            const response = await fetch('/api/mathdle/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    taskId: selectedTask.task_id,
                    difficulty: selectedTask.difficulty,
                    userAnswer: currentAnswer,
                    stepId,
                }),
            });

            const result = await response.json();
            const message = result?.message || result?.error || (result?.isCorrect ? 'Udało się.' : 'Zła odpowiedź, spróbuj jeszcze raz!');
            setFeedback({ ...result, message });

            if (activeTaskType === 'MULTIPLE_CHOICE') {
                const answers = selectedTask?.details?.multiple_choice?.answers || [];
                const selectedAnswerId = taskAnswer;
                const correctAnswer = answers.find((answer) => Number(answer.is_correct) === 1);

                setChoiceFeedback({
                    status: result?.isCorrect ? 'correct' : 'incorrect',
                    selectedAnswerId,
                    correctAnswerId: correctAnswer?.answer_id ?? null,
                });
            }

            if (result?.isCorrect && result?.stepCompleted && activeTaskType === 'STEP_BY_STEP') {
                setStepIndex((prev) => prev + 1);
                return;
            }

            if (result?.isCorrect) {
                setCompletedTaskIds(result.completedTaskIds || [...completedTaskIds, selectedTask.task_id]);
                setTasks((prev) => prev.map((task) => (
                    task.task_id === selectedTask.task_id ? { ...task, isCompleted: true } : task
                )));
                await refreshUser?.();

                setTimeout(() => {
                    closePanel();
                }, 850);
            }
        } catch (err) {
            console.error(err);
            setFeedback({ isCorrect: false, message: 'Błąd serwera. Spróbuj później.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className={styles.loader}>Wczytywanie wyzwań...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.content_wrapper}>
                <DailyChallangeEntry completed={completedCount} total={sortedTasks.length || 3} />

                <div className={styles.card_grid}>
                    {sortedTasks.length > 0 ? (
                        sortedTasks.map((task, index) => {
                            const previousTask = sortedTasks[index - 1];
                            const isUnlocked = index === 0 || completedTaskIds.includes(previousTask?.task_id);
                            const meta = DIFFICULTY_META[task.difficulty] || DIFFICULTY_META[1];

                            return (
                                <DailyChallangeCard
                                    key={task.task_id}
                                    title={task.difficulty === 1 ? 'Podstawy' : task.difficulty === 2 ? 'Geometria' : 'Funkcje'}
                                    type={meta.label}
                                    points={meta.points}
                                    img={
                                        task.difficulty === 1
                                            ? '/assets/img/dashboardLayoutIcons/calc.svg'
                                            : task.difficulty === 2
                                                ? '/assets/img/dashboardLayoutIcons/geo.svg'
                                                : '/assets/img/dashboardLayoutIcons/func.svg'
                                    }
                                    count={index + 1}
                                    completed={task.isCompleted}
                                    locked={!task.isCompleted && !isUnlocked}
                                    onOpen={() => openTask(task)}
                                />
                            );
                        })
                    ) : (
                        <div className={styles.empty_state}>
                            <h2>Brak zadań na dziś</h2>
                        </div>
                    )}
                </div>
            </div>

            {selectedTask && (
                <div className={styles.task_overlay} onClick={closePanel}>
                    <div className={styles.task_panel} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.close_btn} onClick={closePanel} type="button">
                            ×
                        </button>

                        <div className={styles.task_panel_header}>
                            <div>
                                <p className={styles.task_kicker}>Daily challenge</p>
                                <h2>{selectedTask.question}</h2>
                                <div className={styles.task_meta_row}>
                                    <span>{DIFFICULTY_META[selectedTask.difficulty]?.label || 'ŁATWE'}</span>
                                    <span>{DIFFICULTY_META[selectedTask.difficulty]?.points || 1} pkt</span>
                                </div>
                            </div>
                            <div className={styles.task_status}>
                                <span>Użytkownik</span>
                                <strong>{user?.name || 'Użytkownik'}</strong>
                            </div>
                        </div>

                        {(selectedTask.math_content || selectedTask.math_img) && (
                            <div className={styles.task_formula_box}>
                                {selectedTask.math_content && (
                                    <div className={styles.task_formula}>
                                        <MathRender formula={selectedTask.math_content} />
                                    </div>
                                )}
                                {selectedTask.math_img && (
                                    <img
                                        src={selectedTask.math_img}
                                        alt="Ilustracja zadania"
                                        className={styles.task_formula_image}
                                    />
                                )}
                            </div>
                        )}

                        <div className={styles.task_type_badge_row}>
                            <span className={styles.task_type_badge}>{activeTaskType || 'SINGLE_INPUT'}</span>
                            {activeTaskType === 'STEP_BY_STEP' && (
                                <span className={styles.task_step_badge}>
                                    Krok {Math.min(stepIndex + 1, Math.max(stepDetails.length, 1))} / {Math.max(stepDetails.length, 1)}
                                </span>
                            )}
                        </div>

                        {selectedTask.hints?.length > 0 && (
                            <div className={`${styles.hint_shell} ${visibleHintsCount > 0 ? styles.hint_shell_active : ''}`}>
                                <button
                                    type="button"
                                    className={styles.hint_button}
                                    onClick={() => {
                                        if (visibleHintsCount < selectedTask.hints.length) {
                                            setVisibleHintsCount((prev) => prev + 1);
                                        }
                                    }}
                                >
                                    {visibleHintsCount === 0 ? 'Pokaż podpowiedź' : 'Pokaż kolejną podpowiedź'}
                                </button>

                                {visibleHintsCount > 0 && (
                                    <div className={styles.hint_list}>
                                        {selectedTask.hints.slice(0, visibleHintsCount).map((hint) => (
                                            <div key={hint.hint_id} className={styles.hint_item}>
                                                {hint.content}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className={styles.answer_block}>
                            {activeTaskType === 'MULTIPLE_CHOICE' && (
                                <TaskTypeMultipleChoice
                                    task={multipleChoiceTask}
                                    answer={taskAnswer}
                                    setAnswer={setTaskAnswer}
                                    courseColor="#1180f6"
                                    feedback={choiceFeedback}
                                />
                            )}

                            {activeTaskType === 'STEP_BY_STEP' && (
                                <TaskTypeStepByStep
                                    task={stepTask}
                                    answer={taskAnswer}
                                    setAnswer={setTaskAnswer}
                                    stepIdx={stepIndex}
                                    courseColor="#1180f6"
                                />
                            )}

                            {activeTaskType === 'MATCHING' && (
                                <TaskTypeMatching
                                    task={matchingTask}
                                    answer={taskAnswer}
                                    setAnswer={setTaskAnswer}
                                    courseColor="#1180f6"
                                />
                            )}

                            {(!activeTaskType || activeTaskType === 'SINGLE_INPUT') && (
                                <TaskTypeSingleInput
                                    answer={taskAnswer}
                                    setAnswer={setTaskAnswer}
                                    courseColor="#1180f6"
                                />
                            )}

                            {feedback && (
                                <div className={feedback.isCorrect ? styles.feedback_success : styles.feedback_error}>
                                    {feedback.message || (feedback.isCorrect ? 'Udało się.' : 'Zła odpowiedź, spróbuj jeszcze raz!')}
                                </div>
                            )}

                            <button
                                type="button"
                                className={styles.submit_button}
                                onClick={handleSubmit}
                                disabled={isSubmitting || !canSubmit}
                            >
                                {isSubmitting ? 'Sprawdzanie...' : activeTaskType === 'STEP_BY_STEP' ? 'Sprawdź krok' : 'Sprawdź odpowiedź'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
