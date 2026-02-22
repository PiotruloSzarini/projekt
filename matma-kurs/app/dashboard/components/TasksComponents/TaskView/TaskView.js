'use client';
import { useState, useEffect } from 'react';
import { useCourseNavigation } from '@/app/hooks/useCourseNavigation';

import MultipleChoice from '../TaskTypePages/TaskTypeMultipleChoice/TaskTypeMultipleChoice';
import SingleInput from '../TaskTypePages/TaskTypeSingleInput/TaskTypeSingleInput';
import Matching from '../TaskTypePages/TaskTypeMatching/TaskTypeMatching';
import StepByStep from '../TaskTypePages/TaskTypeStepByStep/TaskTypeStepByStep';

import style from './TaskView.module.css';

export default function TaskView({ taskGroupId, courseColor }) {
  const { getTasksByTaskGroupId, loading } = useCourseNavigation();
  const tasks = getTasksByTaskGroupId(Number(taskGroupId));

  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState({}); 
  const [stepIdx, setStepIdx] = useState(0);   
  const [msg, setMsg] = useState("");          

  const task = tasks?.[activeIndex];

  const updateAnswer = (val) => {
    setAnswers({ ...answers, [task.task_id]: val });
  };

  useEffect(() => { 
    setStepIdx(0); 
    setMsg(""); 
  }, [activeIndex, taskGroupId]);

  if (loading) return <p>Ładowanie zadań...</p>;
  if (!tasks || tasks.length === 0) return <p>Brak zadań w tej grupie.</p>;
  if (!task) return null;

  const check = () => {
    const userAns = answers[task.task_id];
    let isCorrect = false;

    // check czy cos wpisal
    if (userAns === undefined || userAns === null || userAns === "") {
      setMsg("Najpierw coś wpisz, mordo.");
      return;
    }

    switch (task.task_type_id) {
      case 1: // Multiple Choice
        const selectedOption = task.answers?.find(a => a.answer_id === userAns);
        isCorrect = selectedOption?.is_correct === 1;
        break;

      case 2: // Single Input
        isCorrect = userAns.trim().toLowerCase() === task.details?.correct_value?.toLowerCase();
        break;

      case 3: // Matching
        isCorrect = task.pairs?.every(p => 
          userAns[p.pair_item_id]?.trim().toLowerCase() === p.right_text.toLowerCase()
        );
        break;

      case 4: // Step by Step
        const currentStep = task.steps[stepIdx];
        const stepUserAns = userAns[currentStep.step_id];

        if (stepUserAns?.trim().toLowerCase() === currentStep.step_answer.toLowerCase()) {
          if (stepIdx < task.steps.length - 1) {
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

    setMsg(isCorrect ? "Klasa jesteś gitem!" : "Rozjebałeś się na komendzie.");
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
      <nav className={style.navigation}>
        {tasks.map((_, i) => (
          <button 
            key={i} 
            className={activeIndex === i ? style.nav_btn_active : style.nav_btn}
            style={activeIndex === i ? { backgroundColor: courseColor } : {}}
            onClick={() => setActiveIndex(i)}
          >
            {i + 1}
          </button>
        ))}
      </nav>

      <div className={style.content_card}>
        <h2 className={style.question}>{task.question}</h2>
        
        <div className={style.task_body}>
          {renderTaskType()}
        </div>

        <footer className={style.footer}>
          <button 
            className={style.check_btn} 
            style={{ backgroundColor: courseColor }}
            onClick={check}
          >
            Sprawdź odpowiedź
          </button>
          {msg && (
            <p className={style.message} style={{ color: msg.includes("Klasa") || msg.includes("Dobrze") ? 'green' : 'red' }}>
              {msg}
            </p>
          )}
        </footer>
      </div>
    </div>
  );
}