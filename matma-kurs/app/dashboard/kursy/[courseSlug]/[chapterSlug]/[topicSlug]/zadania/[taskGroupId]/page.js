'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCourseNavigation } from '@/app/hooks/useCourseNavigation';

export default function TaskPage() {
  const { taskGroupId } = useParams();
  const { getTasksByTaskGroupId, loading } = useCourseNavigation();
  const tasks = getTasksByTaskGroupId(Number(taskGroupId));

  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // Odpowiedzi: { [taskId]: wartość }
  const [stepIdx, setStepIdx] = useState(0);   // Dla typu 4 (kroki)
  const [msg, setMsg] = useState("");          // Komunikat dla użytkownika

  const task = tasks[activeIndex];

  // Resetuj stan przy zmianie zadania
  useEffect(() => { setStepIdx(0); setMsg(""); }, [activeIndex]);

  if (loading || !task) return <p>Ładowanie...</p>;

  const check = () => {
    const userAns = answers[task.task_id];
    let correct = false;

    switch (task.task_type_id) {
      case 1: // Multiple Choice
        const selected = task.answers.find(a => a.answer_id == userAns);
        correct = selected?.is_correct == 1;
        break;

      case 2: // Single Input
        correct = userAns?.trim().toLowerCase() === task.details?.correct_value.toLowerCase();
        break;

      case 3: // Matching
        correct = task.pairs.every(p => userAns?.[p.pair_item_id] === p.right_text);
        break;

      case 4: // Step by Step
        const currentStep = task.steps[stepIdx];
        if (userAns?.[currentStep.step_id]?.toLowerCase() === currentStep.step_answer.toLowerCase()) {
          if (stepIdx < task.steps.length - 1) {
            setStepIdx(stepIdx + 1);
            return setMsg("Dobrze grypsujesz!");
          }
          correct = true;
        }
        break;
    }

    setMsg(correct ? "Klasa jesteś gitem" : "Rozjebales sie na komendzie");
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Nawigacja numerami zadań */}
      {tasks.map((_, i) => (
        <button key={i} onClick={() => setActiveIndex(i)}>{i + 1}</button>
      ))}

      <hr />
      <h2>{task.question}</h2>

      {/* 1 MULTIPLE CHOICE */}
      {task.task_type_id === 1 && task.answers?.map(a => (
        <div key={a.answer_id}>
          <input type="radio" name="choice" onChange={() => setAnswers({...answers, [task.task_id]: a.answer_id})} />
          {a.answer_text}
        </div>
      ))}

      {/* 2 SINGLE INPUT */}
      {task.task_type_id === 2 && (
        <input type="text" onChange={(e) => setAnswers({...answers, [task.task_id]: e.target.value})} />
      )}

      {/* 3 MATCHING */}
      {task.task_type_id === 3 && task.pairs?.map(p => (
        <div key={p.pair_item_id}>
          {p.left_text} = 
          <input type="text" onChange={(e) => {
            const current = answers[task.task_id] || {};
            setAnswers({...answers, [task.task_id]: {...current, [p.pair_item_id]: e.target.value}});
          }} />
        </div>
      ))}

      {/* 4 STEP BY STEP */}
      {task.task_type_id === 4 && (
        <div>
          <p>Krok {stepIdx + 1}: {task.steps[stepIdx]?.step_instruction}</p>
          <input type="text" onChange={(e) => {
            const current = answers[task.task_id] || {};
            setAnswers({...answers, [task.task_id]: {...current, [task.steps[stepIdx].step_id]: e.target.value}});
          }} />
        </div>
      )}

      <br />
      <button onClick={check}>Sprawdź</button>
      <p><b>{msg}</b></p>
    </div>
  );
}