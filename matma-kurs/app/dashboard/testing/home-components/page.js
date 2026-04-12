"use client";
import { useState } from 'react';

import HomeCourseCard from "../../components/HomeComponents/HomeCourseCard/HomeCourseCard";
import HomeEntryCard from "../../components/HomeComponents/HomeEntryCard/HomeEntryCard";
import HomeBuyNowButton from "../../components/buttons/HomeBuyNowButton/HomeBuyNowButton";
import StudyPlanCard from "../../components/HomeComponents/HomeStudyPlan/StudyPlanCard/StudyPlanCard";
import HomeRanking from "../../components/HomeComponents/HomeRanking/HomeRanking";
import HomeStats from "../../components/HomeComponents/HomeStats/HomeStats"; 

export default function home_components() {
    const [tasks, setTasks] = useState([
        { id: 1, title: 'Skończyć rozdział', category: 'Matematyka Podstawowa', deadline: 'dziś', isCompleted: true },
        { id: 2, title: 'Rozwiązać daily challenge', category: null, deadline: 'dziś', isCompleted: false },
        { id: 3, title: 'Podejść do próbnej matury', category: null, deadline: 'do 28 grudnia', isCompleted: false },
    ]);

    const rankingData = [
        { id: 101, rank: 5, name: 'KapisziXD', points: 26, avatar: '/assets/img/topbar/user-icon.svg', isCurrentUser: false },
        { id: 102, rank: 6, name: 'Alexssssandra', points: 1450, avatar: '/assets/img/topbar/user-icon.svg', isCurrentUser: true },
        { id: 103, rank: 7, name: 'BenjaminBaumann9/11', points: 28, avatar: '/assets/img/topbar/user-icon.svg', isCurrentUser: false },
        { id: 104, rank: 8, name: 'BenjaminBaumann9/11', points: 28, avatar: '/assets/img/topbar/user-icon.svg', isCurrentUser: false },
        { id: 105, rank: 9, name: 'BenjaminBaumann9/11', points: 28, avatar: '/assets/img/topbar/user-icon.svg', isCurrentUser: false }
    ];

    const statsData = [
        { id: 1, label: 'Obejrzane lekcje', value: 34, icon: '/assets/img/home/stats/stats-video.svg' },
        { id: 2, label: 'Ukończone zadania', value: 21, icon: '/assets/img/home/stats/stats-task.svg' },
        { id: 3, label: 'Rozwiązane daily challenge', value: 0, icon: '/assets/img/home/stats/stats-daily.svg' },
        { id: 4, label: 'Pokonane słabe punkty', value: 4, icon: '/assets/img/home/stats/stats-weak.svg' },
    ];

    const handleTaskToggle = (taskId) => {
        setTasks(prevTasks => 
            prevTasks.map(task => 
                task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
            )
        );
    };

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px'}}>
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
                title="Matura Rozszerzona"
                backgroundColor="#00A67E"
                tasksCount={96}
                videosCount={347}
                progress={0}
                owned={false}
            />

            <HomeEntryCard name="Kacper" continueLink="/dashboard" />

            <HomeBuyNowButton link="/dashboard" />

            <StudyPlanCard
                tasks={tasks}
                onTaskToggle={handleTaskToggle}
            />

            <HomeRanking users={rankingData} />
            
            <HomeStats stats={statsData} />
        </div>
    );
}