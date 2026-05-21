'use client';

import { useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";

import HomeEntryCard from "./components/HomeComponents/HomeEntryCard/HomeEntryCard";
import HomeCourseCard from "./components/HomeComponents/HomeCourseCard/HomeCourseCard";
import StudyPlanCard from "./components/HomeComponents/HomeStudyPlan/StudyPlanCard/StudyPlanCard";
import HomeRanking from "./components/HomeComponents/HomeRanking/HomeRanking";
import HomeStats from "./components/HomeComponents/HomeStats/HomeStats";
import HomeBuyNowButton from "./components/buttons/HomeBuyNowButton/HomeBuyNowButton";

import { useCourseNavigation } from "@/app/hooks/useCourseNavigation";
import { useUser } from "@/app/context/UserContext";

export default function MyProgressPage() {
    const { loading: coursesLoading, courses } = useCourseNavigation();
    
    const { user, loading: userLoading } = useUser();

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
    };

    const rankingData = [
        { id: 101, rank: 5, name: 'KapisziXD', points: 26, avatar: '/assets/img/topbar/user-icon.svg', isCurrentUser: false },
        { id: 102, rank: 6, name: 'Alexssssandra', points: 1450, avatar: '/assets/img/topbar/user-icon.svg', isCurrentUser: true },
        { id: 103, rank: 7, name: 'BenjaminBaumann9/11', points: 28, avatar: '/assets/img/topbar/user-icon.svg', isCurrentUser: false },
        { id: 104, rank: 8, name: 'BenjaminBaumann9/11', points: 28, avatar: '/assets/img/topbar/user-icon.svg', isCurrentUser: false },
        { id: 105, rank: 9, name: 'BenjaminBaumann9/11', points: 28, avatar: '/assets/img/topbar/user-icon.svg', isCurrentUser: false }
    ];

    const statsData = [
        { id: 1, label: 'Obejrzane lekcje', value: user?.videos_watched || 0, icon: '/assets/img/home/stats/stats-video.svg' },
        { id: 2, label: 'Ukończone zadania', value: user?.tasks_completed || 0, icon: '/assets/img/home/stats/stats-task.svg' },
        { id: 3, label: 'Daily challenge', value: user?.daily_completed || 0, icon: '/assets/img/home/stats/stats-daily.svg' },
        { id: 4, label: 'Słabe punkty', value: user?.weak_points_completed || 0, icon: '/assets/img/home/stats/stats-weak.svg' },
    ];

    if (userLoading) return <p>Ładowanie profilu...</p>;

    return (
        <div className={styles.page_container}>
            <div className={styles.page_container_left}>
                <div className={styles.home_entry_card_container}>
                    {/* DYNAMICZNE IMIĘ Z BAZY */}
                    <HomeEntryCard name={user?.name || "Użytkownik"} continueLink="/dashboard/kursy"/>
                </div>

                <div className={styles.home_course_card_container}>
                    <div className={styles.home_course_card_header}>
                        <p>Kursy:</p>
                        <HomeBuyNowButton text="Sklep" link="/sklep"/>
                    </div>

                    <div className={styles.home_course_card_list}>
                        {coursesLoading ? (
                            <p>Ładowanie kursów...</p>
                        ) : (
                            courses.map(course => (
                                <Link 
                                    key={course.course_id} 
                                    href={`/dashboard/kursy/${course.slug}`}
                                    style={{ textDecoration: 'none', width: '100%' }}
                                >
                                    <HomeCourseCard 
                                        title={course.title} 
                                        backgroundColor={course.color} 
                                        tasksCount={course.total_tasks || 0} 
                                        videosCount={course.total_videos || 0} 
                                        progress={course.progress || 0} 
                                        owned={course.owned}
                                    />
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                <div className={styles.home_study_plan_card_container}>
                    <StudyPlanCard
                        tasks={tasks}
                        onTaskToggle={handleTaskToggle}
                    />
                </div>
            </div>

            <div className={styles.page_container_right}>
                <div className={styles.home_ranking_container}>
                    <HomeRanking users={rankingData} />
                </div>
                <div style={{textAlign: 'center', marginBottom: '16px', fontSize: '18px'}}>
                    streak: <strong>{user?.current_streak || 0} dni</strong>
                </div>
                <div className={styles.home_stats_container}>
                    <HomeStats stats={statsData} />
                </div>
            </div>
        </div>
    );
}

function ConditionalLink({ condition, href, children }) {
    return (
        <Link href={href} style={{ textDecoration: 'none', width: '100%' }}>
            {children}
        </Link>
    );
}