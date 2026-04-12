"use client";
import { useState } from 'react';

import HomeCourseCard from "../../components/HomeComponents/HomeCourseCard/HomeCourseCard";
import HomeEntryCard from "../../components/HomeComponents/HomeEntryCard/HomeEntryCard";
import HomeBuyNowButton from "../../components/buttons/HomeBuyNowButton/HomeBuyNowButton";
import StudyPlanCard from "../../components/HomeComponents/HomeStudyPlan/StudyPlanCard/StudyPlanCard";


export default function home_components() {
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Skończyć rozdział', category: 'Matematyka Podstawowa', deadline: 'dziś', isCompleted: true },
        { id: 2, title: 'Rozwiązać daily challenge', category: null, deadline: 'dziś', isCompleted: false },
        { id: 3, title: 'Podejść do próbnej matury', category: null, deadline: 'do 28 grudnia', isCompleted: false },
    ]);

    const handleTaskToggle = (taskId) => {
        setTasks(prevTasks => 
            prevTasks.map(task => 
                task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
            )
        );
        console.log('Toggled task with id:', taskId);
    };

    return (
        <div style={{ display: 'flex',flexDirection: 'column', gap: '16px'}}>
            <HomeCourseCard 
                title="Matura Podstawowa"
                backgroundColor="#1180F6"
                tasksCount={74}
                videosCount={223}
                progress={56}
                owned={true}
            />
            <HomeCourseCard 
                title="Egzamin 8-klasisty"
                backgroundColor="#DD4D32"
                tasksCount={48}
                videosCount={116}
                progress={0}
                owned={false}
            />
            <HomeCourseCard 
                title="Matura Rozszerzona border 2px zamiast 1px"
                backgroundColor="#00A67E"
                tasksCount={96}
                videosCount={347}
                progress={0}
                owned={false}
            />
            <HomeEntryCard name="Kacper" continueLink="/dashboard" />

            <HomeBuyNowButton />

            <StudyPlanCard
                tasks={tasks}
                onTaskToggle={handleTaskToggle}
            />
        </div>
    );
}