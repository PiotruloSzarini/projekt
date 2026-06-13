'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

import HomeEntryCard from './components/HomeComponents/HomeEntryCard/HomeEntryCard';
import HomeCourseCard from './components/HomeComponents/HomeCourseCard/HomeCourseCard';
import StudyPlanCard from './components/HomeComponents/HomeStudyPlan/StudyPlanCard/StudyPlanCard';
import HomeRanking from './components/HomeComponents/HomeRanking/HomeRanking';
import HomeStats from './components/HomeComponents/HomeStats/HomeStats';
import HomeBuyNowButton from './components/buttons/HomeBuyNowButton/HomeBuyNowButton';

import { useCourseNavigation } from '@/app/hooks/useCourseNavigation';
import { useUser } from '@/app/context/UserContext';

export default function MyProgressPage() {
    const { loading: coursesLoading, courses } = useCourseNavigation();
    const { user, loading: userLoading, userId } = useUser();

    const [tasks, setTasks] = useState([
        { id: 1, title: 'Skończyć rozdział', category: 'Matematyka Podstawowa', deadline: 'dziś', isCompleted: true },
        { id: 2, title: 'Rozwiązać daily challenge', category: null, deadline: 'dziś', isCompleted: false, href: '/dashboard/mathdle' },
        { id: 3, title: 'Podejść do próbnej matury', category: null, deadline: 'do 28 grudnia', isCompleted: false },
    ]);
    const [rankingData, setRankingData] = useState([]);

    useEffect(() => {
        const loadDailyStatus = async () => {
            try {
                const res = await fetch('/api/admin/mathdle/today');
                const data = await res.json();
                const dailyCompleted = (data?.completedCount || 0) > 0;

                setTasks((prevTasks) =>
                    prevTasks.map((task) => (
                        task.id === 2 ? { ...task, isCompleted: dailyCompleted } : task
                    ))
                );
            } catch (err) {
                console.error('Błąd odczytu daily challenge:', err);
            }
        };

        loadDailyStatus();
    }, []);

    useEffect(() => {
        const loadRanking = async () => {
            try {
                const res = await fetch(`/api/ranking${userId ? `?userId=${userId}` : ''}`);
                const data = await res.json();
                const rows = Array.isArray(data.rows) ? data.rows : [];

                setRankingData(rows.slice(0, 5).map((row) => ({
                    id: row.user_id,
                    rank: row.rank,
                    name: row.name,
                    points: row.total_points,
                    avatar: row.avatar_url || '/assets/img/topbar/user-icon.svg',
                    isCurrentUser: row.active,
                })));
            } catch (error) {
                console.error('Błąd pobierania rankingu na stronie głównej:', error);
            }
        };

        loadRanking();
    }, [userId]);

    const handleTaskToggle = (taskId) => {
        setTasks((prevTasks) =>
            prevTasks.map((task) =>
                task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
            )
        );
    };

    const statsData = [
        { id: 1, label: 'Obejrzane lekcje', value: user?.videos_watched || 0, icon: '/assets/img/home/stats/stats-video.svg' },
        { id: 2, label: 'Ukończone zadania', value: user?.tasks_completed || 0, icon: '/assets/img/home/stats/stats-task.svg' },
        { id: 3, label: 'Daily challenge', value: user?.daily_completed || 0, icon: '/assets/img/home/stats/stats-daily.svg' },
    ];

    if (userLoading) return <p>Ładowanie profilu...</p>;

    return (
        <div className={styles.page_container}>
            <div className={styles.page_container_top}>
                <div className={styles.page_container_left}>
                    <div className={styles.home_entry_card_container}>
                        <HomeEntryCard name={user?.name || 'Użytkownik'} continueLink="/dashboard/kursy" />
                    </div>

                    <div className={styles.home_course_card_container}>
                        <div className={styles.home_course_card_header}>
                            <p>Kursy:</p>
                            <HomeBuyNowButton text="Sklep" link="/dashboard/sklep" />
                        </div>

                        <div className={styles.home_course_card_list}>
                            {coursesLoading ? (
                                <p>Ładowanie kursów...</p>
                            ) : (
                                courses.map((course) => (
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
                        <StudyPlanCard tasks={tasks} onTaskToggle={handleTaskToggle} />
                    </div>
                </div>

                <div className={styles.page_container_right}>
                    <div className={styles.home_ranking_container}>
                        <HomeRanking users={rankingData} />
                    </div>
                    <div className={styles.streak_box}>
                        streak: <strong>{user?.current_streak || 0} dni</strong>
                    </div>
                    <div className={styles.home_stats_section}>
                        <div className={styles.home_stats_header}>
                            <h2>Moje statystyki</h2>
                            <div className={styles.user_strip}>
                                {(rankingData.length ? rankingData : [
                                    { avatar: '/assets/img/topbar/user-icon.svg' },
                                    { avatar: '/assets/img/topbar/user-icon.svg' },
                                    { avatar: '/assets/img/topbar/user-icon.svg' },
                                ]).slice(0, 3).map((row, index) => (
                                    <img
                                        key={`${row.id || index}-${index}`}
                                        src={row.avatar}
                                        alt="Użytkownik"
                                        className={styles.user_avatar}
                                    />
                                ))}
                            </div>
                        </div>
                        <HomeStats stats={statsData} />
                    </div>
                </div>
            </div>
        </div>
    );
}
