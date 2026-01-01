'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import tasksData from '@/dane/mock_dane/tasks.json';

export default function TaskPage() {
  const { taskGroupId } = useParams();
  const groupId = Number(taskGroupId);

  const tasks = tasksData.filter(
    task => task.taskGroupId === groupId
  );

  const [activeIndex, setActiveIndex] = useState(0);

  if (!tasks.length) {
    return <p>Brak zadań w tej grupie</p>;
  }

  const activeTask = tasks[activeIndex];

  return (
    <div style={{ padding: '24px' }}>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {tasks.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '1px solid #ccc',
              background: index === activeIndex ? '#59A5FE' : '#fff',
              color: index === activeIndex ? '#fff' : '#000',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <div>
        <h3>Zadanie {activeIndex + 1}</h3>
        <p>Typ zadania: {activeTask.taskType}</p>
        <p>Instrukcja: {activeTask.instruction}</p>
        <pre>
          {JSON.stringify(activeTask.data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
