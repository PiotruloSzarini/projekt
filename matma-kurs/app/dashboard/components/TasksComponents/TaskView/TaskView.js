'use client';
import { useState, useEffect } from 'react';
import { useCourseNavigation } from '@/app/hooks/useCourseNavigation';

export default function TaskView({ taskGroupId, courseColor }) {
  const { getTasksByTaskGroupId, loading } = useCourseNavigation();
  const tasks = getTasksByTaskGroupId(Number(taskGroupId));

  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState({}); 
  const [stepIdx, setStepIdx] = useState(0);   
  const [msg, setMsg] = useState("");          

  const task = tasks[activeIndex];

  useEffect(() => { 
    setStepIdx(0); 
    setMsg(""); 
  }, [activeIndex, taskGroupId]);

  if (loading) return <p>Ładowanie zadań...</p>;
  if (!tasks || tasks.length === 0) return <p>Brak zadań w tej grupie.</p>;
  if (!task) return null;

  const check = () => {
    const userAns = answers[task.task_id];
    let correct = false;

    switch (task.task_type_id) {
      case 1: // Multiple Choice
        const selected = task.answers?.find(a => a.answer_id == userAns);
        correct = selected?.is_correct == 1;
        break;
      case 2: // Single Input
        correct = userAns?.trim().toLowerCase() === task.details?.correct_value.toLowerCase();
        break;
      case 3: // Matching
        correct = task.pairs?.every(p => userAns?.[p.pair_item_id]?.trim().toLowerCase() === p.right_text.toLowerCase());
        break;
      case 4: // Step by Step
        const currentStep = task.steps[stepIdx];
        if (userAns?.[currentStep.step_id]?.trim().toLowerCase() === currentStep.step_answer.toLowerCase()) {
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
    <div>
      {/* Nawigacja numerami */}
      <nav>
        {tasks.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setActiveIndex(i)}
            data-active={activeIndex === i}
          >
            {i + 1}
          </button>
        ))}
      </nav>

      <hr />
      
      <h2>{task.question}</h2>

      <section>
        {/* 1 MULTIPLE CHOICE */}
        {task.task_type_id === 1 && task.answers?.map(a => (
          <div key={a.answer_id}>
            <input 
              type="radio" 
              name={`task-${task.task_id}`} 
              checked={answers[task.task_id] === a.answer_id}
              onChange={() => setAnswers({...answers, [task.task_id]: a.answer_id})} 
            />
            <label>{a.answer_text}</label>
          </div>
        ))}

        {/* 2 SINGLE INPUT */}
        {task.task_type_id === 2 && (
          <input 
            type="text" 
            value={answers[task.task_id] || ""}
            onChange={(e) => setAnswers({...answers, [task.task_id]: e.target.value})} 
          />
        )}

        {/* 3 MATCHING */}
        {task.task_type_id === 3 && task.pairs?.map(p => (
          <div key={p.pair_item_id}>
            <span>{p.left_text} = </span>
            <input 
              type="text" 
              onChange={(e) => {
                const current = answers[task.task_id] || {};
                setAnswers({...answers, [task.task_id]: {...current, [p.pair_item_id]: e.target.value}});
              }} 
            />
          </div>
        ))}

        {/* 4 STEP BY STEP */}
        {task.task_type_id === 4 && (
          <div>
            <p>Krok {stepIdx + 1}: {task.steps[stepIdx]?.step_instruction}</p>
            <input 
              type="text" 
              value={answers[task.task_id]?.[task.steps[stepIdx]?.step_id] || ""}
              onChange={(e) => {
                const current = answers[task.task_id] || {};
                setAnswers({...answers, [task.task_id]: {...current, [task.steps[stepIdx].step_id]: e.target.value}});
              }} 
            />
          </div>
        )}
      </section>

      <footer>
        <button onClick={check}>Sprawdź odpowiedź</button>
        {msg && <p>{msg}</p>}
      </footer>
    </div>
  );
}