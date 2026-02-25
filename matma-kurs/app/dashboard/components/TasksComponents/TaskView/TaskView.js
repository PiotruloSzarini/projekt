'use client';
import { useState, useEffect } from 'react';

import MultipleChoice from '../TaskTypePages/TaskTypeMultipleChoice/TaskTypeMultipleChoice';
import SingleInput from '../TaskTypePages/TaskTypeSingleInput/TaskTypeSingleInput';
import Matching from '../TaskTypePages/TaskTypeMatching/TaskTypeMatching';
import StepByStep from '../TaskTypePages/TaskTypeStepByStep/TaskTypeStepByStep';

import style from './TaskView.module.css';
import TaskSelect from '../TaskSelect/TaskSelect';

export default function TaskView({ tasks, courseColor }) {
  // UWAGA: Usunęliśmy useCourseNavigation. Dane przychodzą gotowe w propsie 'tasks'
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState({}); 
  const [stepIdx, setStepIdx] = useState(0);   
  const [msg, setMsg] = useState("");          

  // Resetujemy stan, gdy zmieni się grupa zadań (np. przejście do innej lekcji)
  useEffect(() => {
    setActiveIndex(0);
    setStepIdx(0);
    setMsg("");
    setAnswers({});
  }, [tasks]);

  const task = tasks?.[activeIndex];

  const updateAnswer = (val) => {
    setAnswers({ ...answers, [task.task_id]: val });
  };

  const handleTaskChange = (index) => {
    setActiveIndex(index);
    setStepIdx(0);
    setMsg("");
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

    // Wykorzystujemy kody typów z Twojego Super-Route (np. 'MULTIPLE_CHOICE') 
    // lub ID, jeśli wolisz zostać przy case 1, 2, 3...
    // Zakładam, że w Twoim obiekcie 'task' masz task_type_id
    switch (task.task_type_id) {
      case 1: // Multiple Choice
        // Dane są teraz w task.details.answers dzięki naszemu SQL
        const mcAnswers = task.details?.answers || [];
        const selectedOption = mcAnswers.find(a => a.task_multiple_id === userAns || a.answer_id === userAns);
        isCorrect = selectedOption?.is_correct === 1;
        break;

      case 2: // Single Input
        isCorrect = userAns.trim().toLowerCase() === task.details?.correct_value?.toLowerCase();
        break;

      case 3: // Matching
        const pairs = task.details?.items || [];
        isCorrect = pairs.every(p => 
          userAns[p.task_pair_id]?.trim().toLowerCase() === p.right_text.toLowerCase()
        );
        break;

      case 4: // Step by Step
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

    setMsg(isCorrect ? "Klasa jesteś gitem!" : "Rozjebałeś się na komendzie.");
  };

  const renderTaskType = () => {
    const commonProps = {
      task, // tu są teraz dane z detalami (details.answers, details.steps itd.)
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