'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import tasksData from '@/dane/mock_dane/tasks.json';

export default function TaskPageClient() {
  const params = useParams();
  const { taskGroupId } = params;

  const groupTasks = tasksData.filter(
    task => task.taskGroupId === Number(taskGroupId)
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  if (!groupTasks.length) return <p>Brak zadań w tej grupie</p>;

  const currentTask = groupTasks[currentIndex];

  return (
    <div>
      <h2>Zadanie {currentIndex + 1} / {groupTasks.length}</h2>
      <p>{currentTask.taskType}</p>
      <p>{currentTask.instruction}</p>
      <pre>{JSON.stringify(currentTask.data, null, 2)}</pre>
      <button onClick={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}>Poprzednie</button>
      <button onClick={() => setCurrentIndex(prev => Math.min(prev + 1, groupTasks.length - 1))}>Następne</button>
    </div>
  );
}
