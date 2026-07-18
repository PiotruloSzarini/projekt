'use client';
import { useEffect, useState } from 'react';
import { useCourseData } from '@/app/context/CourseContext';
import { useUser } from '@/app/context/UserContext';

import MultipleChoice from '../TaskTypePages/TaskTypeMultipleChoice/TaskTypeMultipleChoice';
import SingleInput from '../TaskTypePages/TaskTypeSingleInput/TaskTypeSingleInput';
import Matching from '../TaskTypePages/TaskTypeMatching/TaskTypeMatching';
import StepByStep from '../TaskTypePages/TaskTypeStepByStep/TaskTypeStepByStep';

import style from './TaskView.module.css';
import TaskSelect from '../TaskSelect/TaskSelect';
import MathRender from '@/app/components/MathRender/MathRender';

export default function TaskView({ tasks, courseColor }) {
  const { userId } = useCourseData();
  const { refresh: refreshUser } = useUser();
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [taskResults, setTaskResults] = useState({});
  const [stepResults, setStepResults] = useState({});
  const [stepIdx, setStepIdx] = useState(0);
  const [msg, setMsg] = useState('');
  const [visibleHintsCount, setVisibleHintsCount] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
    setStepIdx(0);
    setMsg('');
    setAnswers({});
    setTaskResults({});
    setStepResults({});
    setVisibleHintsCount(0);
    setShowExplanation(false);
  }, [tasks]);

  const task = tasks?.[activeIndex];
  const currentResult = task ? taskResults[task.task_id] : null;

  const updateAnswer = (val) => {
    if (!task) return;
    setAnswers((prev) => ({ ...prev, [task.task_id]: val }));
  };

  const handleTaskChange = (index) => {
    setActiveIndex(index);
    setStepIdx(0);
    setMsg('');
    setVisibleHintsCount(0);
    setShowExplanation(false);
  };

  const goToNextTask = () => {
    if (activeIndex < tasks.length - 1) {
      handleTaskChange(activeIndex + 1);
    }
  };

  if (!tasks || tasks.length === 0) return <p className={style.empty}>Brak zadań w tej grupie.</p>;
  if (!task) return null;

  const isStepByStep = Number(task.task_type_id) === 4;
  const stepItems = task.details?.steps || [];
  const isStepTaskReadyToCheck = !isStepByStep || stepItems.length === 0 || stepIdx >= stepItems.length;
  const hasCorrectResult = currentResult === 'correct';
  const isCheckDisabled = hasCorrectResult || (isStepByStep && !currentResult && !isStepTaskReadyToCheck);

  const normalizeAnswer = (value) => String(value ?? '').trim().toLowerCase().replace(/\s+/g, '').replace(/,/g, '.').normalize('NFKC');

  const confirmStep = () => {
    if (!isStepByStep) return;

    const currentStep = stepItems[stepIdx];
    if (!currentStep) return;

    const currentValue = answers[task.task_id]?.[currentStep.step_id];
    if (!String(currentValue || '').trim()) {
      setMsg('Najpierw wpisz odpowiedź.');
      return;
    }

    setMsg('');
    setStepIdx((prev) => Math.min(prev + 1, stepItems.length));
  };

  const check = () => {
    if (isCheckDisabled) return;

    const userAns = answers[task.task_id];
    let isCorrect = false;

    if (userAns === undefined || userAns === null || userAns === '') {
      setMsg('Najpierw wpisz odpowiedź.');
      return;
    }

    switch (Number(task.task_type_id)) {
      case 1: {
        const mcOptions = task.details?.answers || [];
        const selected = mcOptions.find((a) => a.answer_id === userAns);
        isCorrect = Number(selected?.is_correct) === 1;
        break;
      }
      case 2:
        isCorrect = normalizeAnswer(userAns) === normalizeAnswer(task.details?.correct_value);
        break;
      case 3: {
        const matchingItems = task.details?.items || [];
        isCorrect = matchingItems.every((p) => (
          Number(answers[task.task_id]?.[p.pair_item_id]) === p.pair_item_id
        ));
        break;
      }
      case 4: {
        const nextStepResults = {};

        isCorrect = true;
        stepItems.forEach((step) => {
          const stepCorrect = normalizeAnswer(userAns?.[step.step_id]) === normalizeAnswer(step.step_answer);
          nextStepResults[step.step_id] = stepCorrect ? 'correct' : 'incorrect';
          if (!stepCorrect) isCorrect = false;
        });

        setStepResults((prev) => ({
          ...prev,
          [task.task_id]: nextStepResults,
        }));
        break;
      }
      default:
        isCorrect = false;
    }

    setTaskResults((prev) => ({
      ...prev,
      [task.task_id]: isCorrect ? 'correct' : 'incorrect',
    }));

    if (isCorrect) {
      awardTaskPoints(task.task_id);
    } else {
      setMsg('');
    }
  };

  const awardTaskPoints = async (taskId) => {
    if (!userId) {
      setMsg('Brak aktywnej sesji.');
      return;
    }

    try {
      const res = await fetch('/api/tasks/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Nie udało się naliczyć punktów.');
      }

      setMsg(data.message || '');
      await refreshUser?.();
    } catch (error) {
      console.error('Błąd naliczania punktów:', error);
      setMsg('Zadanie zaliczone, ale nie udało się naliczyć punktów.');
    }
  };

  const renderTaskType = () => {
    const commonProps = {
      task,
      answer: answers[task.task_id],
      setAnswer: updateAnswer,
      courseColor,
    };

    switch (Number(task.task_type_id)) {
      case 1:
        return (
          <MultipleChoice
            {...commonProps}
            feedback={currentResult ? { status: currentResult } : null}
          />
        );
      case 2:
        return (
          <SingleInput
            {...commonProps}
            feedback={currentResult ? { status: currentResult } : null}
          />
        );
      case 3:
        return (
          <Matching
            {...commonProps}
            feedback={currentResult ? { status: currentResult } : null}
          />
        );
      case 4:
        return (
          <StepByStep
            {...commonProps}
            stepIdx={stepIdx}
            onConfirmStep={confirmStep}
            feedback={currentResult ? {
              status: currentResult,
              steps: stepResults[task.task_id] || {},
            } : null}
          />
        );
      default:
        return <p>Nieznany typ zadania</p>;
    }
  };

  return (
    <div className={style.task_container}>
      <div className={style.task_navigation}>
        {tasks.map((item, i) => (
          <TaskSelect
            key={item.task_id || i}
            int={i + 1}
            backgroundColor={courseColor}
            active={activeIndex === i}
            status={taskResults[item.task_id]}
            onClick={() => handleTaskChange(i)}
          />
        ))}
      </div>

      <div className={style.content_card}>
        <h2 className={style.question}>{task.question}</h2>

        {(task.math_content || task.math_img) && (
          <div className={style.math_container}>
            {task.math_content && (
              <div className={style.math_text}>
                <MathRender formula={task.math_content} />
              </div>
            )}
            {task.math_img && (
              <div className={style.math_image_wrapper}>
                <img src={task.math_img} alt="Zadanie" className={style.math_image} />
              </div>
            )}
          </div>
        )}

        {task.details?.hints?.length > 0 && (
          <div className={`${style.hint_container} ${visibleHintsCount > 0 ? style.active : ''}`}>
            <button
              className={style.hint_btn}
              onClick={() => {
                const totalHints = task.details.hints.length;
                if (visibleHintsCount < totalHints) {
                  setVisibleHintsCount((prev) => prev + 1);
                }
              }}
            >
              <img src="/assets/img/lightbulb.svg" alt="Podpowiedź" className={style.hint_icon} />

              {visibleHintsCount < task.details.hints.length && (
                <span className={style.hint_btn_text}>
                  {visibleHintsCount === 0 ? 'Pokaż podpowiedź' : 'Pokaż kolejną podpowiedź'}
                </span>
              )}
            </button>

            {visibleHintsCount > 0 && (
              <div className={style.hints_section}>
                {task.details.hints.slice(0, visibleHintsCount).map((hint) => (
                  <div key={hint.hint_id} className={style.hint_item}>
                    {hint.content}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className={style.task_body}>
          {renderTaskType()}
        </div>

        <div className={style.anwser_check}>
          {msg && <p className={style.message}>{msg}</p>}
          <button
            className={`${style.check_btn} ${isCheckDisabled ? style.check_btn_disabled : ''}`}
            style={{ backgroundColor: isCheckDisabled ? '#cbd5e1' : courseColor }}
            onClick={check}
            disabled={isCheckDisabled}
          >
            Sprawdź odpowiedź
          </button>
          {currentResult && activeIndex < tasks.length - 1 && (
            <button
              className={style.next_btn}
              style={{ backgroundColor: courseColor }}
              onClick={goToNextTask}
            >
              Następne pytanie -&gt;
            </button>
          )}
        </div>

        <div className={style.explanation_wrapper}>
          <div
            className={`${style.explanation_toggle} ${showExplanation ? style.active : ''}`}
            style={{ backgroundColor: courseColor }}
          >
            <div className={style.explanation_content}>
              <h3>Rozwiązanie krok po kroku:</h3>
              {task.details.explanation?.steps?.map((step, index) => (
                <div key={step.explanation_step_id}>
                  <strong>Krok {index + 1}:</strong> {step.content}
                </div>
              ))}
            </div>
          </div>

          <button
            className={style.explanation_btn}
            style={{ backgroundColor: courseColor }}
            onClick={() => setShowExplanation(!showExplanation)}
          >
            {showExplanation ? 'X' : <img src="/assets/img/explanation_book.svg" alt="?" />}
          </button>
        </div>
      </div>
    </div>
  );
}
