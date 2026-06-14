'use client';
import { useState, useEffect } from 'react';

import MultipleChoice from '../TaskTypePages/TaskTypeMultipleChoice/TaskTypeMultipleChoice';
import SingleInput from '../TaskTypePages/TaskTypeSingleInput/TaskTypeSingleInput';
import Matching from '../TaskTypePages/TaskTypeMatching/TaskTypeMatching';
import StepByStep from '../TaskTypePages/TaskTypeStepByStep/TaskTypeStepByStep';

import style from './TaskView.module.css';
import TaskSelect from '../TaskSelect/TaskSelect';

export default function TaskView({ tasks, courseColor }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [stepIdx, setStepIdx] = useState(0);
  const [msg, setMsg] = useState("");
  
  // Zmieniono showHints na licznik odkrytych podpowiedzi
  const [visibleHintsCount, setVisibleHintsCount] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
    setStepIdx(0);
    setMsg("");
    setAnswers({});
    setVisibleHintsCount(0); // Reset licznika
    setShowExplanation(false);
  }, [tasks]);

  const task = tasks?.[activeIndex];

  const updateAnswer = (val) => {
    setAnswers({ ...answers, [task.task_id]: val });
  };

  const handleTaskChange = (index) => {
    setActiveIndex(index);
    setStepIdx(0);
    setMsg("");
    setVisibleHintsCount(0); // Reset licznika
    setShowExplanation(false);
  };

  if (!tasks || tasks.length === 0) return <p className={style.empty}>Brak zadań w tej grupie.</p>;
  if (!task) return null;

  const check = () => {
    const userAns = answers[task.task_id];
    let isCorrect = false;

    if (userAns === undefined || userAns === null || userAns === "") {
      setMsg("Najpierw coś wpisz, mordo.");
      return;
    }

    switch (task.task_type_id) {
      case 1:
        const mcOptions = task.details?.answers || [];
        const selected = mcOptions.find(a => a.answer_id === userAns);
        isCorrect = selected?.is_correct === 1;
        break;
      case 2:
        isCorrect = userAns.trim().toLowerCase() === task.details?.correct_value?.toLowerCase();
        break;
      case 3:
        const matchingItems = task.details?.items || [];
        isCorrect = matchingItems.every(p => 
          Number(answers[task.task_id]?.[p.pair_item_id]) === p.pair_item_id
        );
        break;
      case 4:
        const steps = task.details?.steps || [];
        const currentStep = steps[stepIdx];
        const stepUserAns = userAns[currentStep.step_id];

        if (stepUserAns?.trim().toLowerCase() === currentStep.step_answer.toLowerCase()) {
          if (stepIdx < steps.length - 1) {
            setStepIdx(prev => prev + 1);
            setMsg("Dobrze grypsujesz! Następny krok...");
            return;
          }
          isCorrect = true;
        } else {
          isCorrect = false;
        }
        break;
    }

    setMsg(isCorrect ? "Super zadanie" : "Spróbuj jeszcze raz");
  };

  const renderTaskType = () => {
    const commonProps = {
      task,
      answer: answers[task.task_id],
      setAnswer: updateAnswer,
      courseColor
    };

    switch (task.task_type_id) {
      case 1: return <MultipleChoice {...commonProps} />;
      case 2: return <SingleInput {...commonProps} />;
      case 3: return <Matching {...commonProps} />;
      case 4: return <StepByStep {...commonProps} stepIdx={stepIdx} />;
      default: return <p>Nieznany typ zadania</p>;
    }
  };

  return (
    <div className={style.task_container}>
      <div className={style.task_navigation}>
        {tasks.map((_, i) => (
          <TaskSelect
            key={i}
            int={i + 1}
            backgroundColor={courseColor}
            active={activeIndex === i}
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
                <p>{task.math_content}</p>
              </div>
            )}
            {task.math_img && (
              <div className={style.math_image_wrapper}>
                <img src={task.math_img} alt="Zadanie" className={style.math_image} />
              </div>
            )}
          </div>
        )}

        {/* LOGIKA HINTÓW */}
        {task.details?.hints?.length > 0 && (
          <div className={`${style.hint_container} ${visibleHintsCount > 0 ? style.active : ''}`}>
            <button 
              className={style.hint_btn}
              onClick={() => {
                const totalHints = task.details.hints.length;
                if (visibleHintsCount < totalHints) {
                  setVisibleHintsCount(prev => prev + 1);
                }
              }}
            >
              <img src="/assets/img/lightbulb.svg" alt="Podpowiedź" className={style.hint_icon} />

              {visibleHintsCount < task.details.hints.length && (
                <span className={style.hint_btn_text}>
                  {visibleHintsCount === 0 ? "Pokaż podpowiedź" : "Pokaż kolejną podpowiedź"}
                </span>
              )}
            </button>
            
            {visibleHintsCount > 0 && (
              <div className={style.hints_section}>
                {task.details.hints.slice(0, visibleHintsCount).map(hint => (
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
          <button 
              className={style.check_btn} 
              style={{ backgroundColor: courseColor }}
              onClick={check}
            >
              Sprawdź odpowiedź
            </button>
            {msg && (
            <p className={style.message} style={{ color: msg === "Super zadanie" || msg.includes("Dobrze") ? 'green' : 'red' }}>
              {msg}
            </p>
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
            {showExplanation ? "X" : <img src="/assets/img/explanation_book.svg" alt="?" />}
          </button>
        </div>
      </div>
    </div>
  );
}
