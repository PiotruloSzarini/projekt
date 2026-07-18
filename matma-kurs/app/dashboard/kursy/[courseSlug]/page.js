'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ChapterCard from "../../components/ChapterComponents/ChapterCard/ChapterCard";
import ChapterInfo from "../../components/ChapterComponents/ChapterInfo/ChapterInfo";
import HomeRanking from "../../components/HomeComponents/HomeRanking/HomeRanking";
import StudyPlanCard from "../../components/HomeComponents/HomeStudyPlan/StudyPlanCard/StudyPlanCard";
import { useCourseNavigation } from "@/app/hooks/useCourseNavigation";
import { useCourseData } from "@/app/context/CourseContext";
import styles from './page.module.css';

export default function ChapterPage() {
  const { courseSlug } = useParams();
  const { loading: navLoading, getCourseBySlug, getChaptersByCourseId } = useCourseNavigation();
  const { fullCourseData, preloadCourse, loading: dataLoading, userId } = useCourseData();
  const [rankingData, setRankingData] = useState([]);
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Skończyć rozdział', category: 'Kurs', deadline: 'dziś', isCompleted: true },
    { id: 2, title: 'Rozwiązać daily challenge', category: null, deadline: 'dziś', isCompleted: false, href: '/dashboard/mathdle' },
    { id: 3, title: 'Przejrzeć powtórkę', category: null, deadline: 'do końca tygodnia', isCompleted: false },
  ]);

  const course = useMemo(() => getCourseBySlug(courseSlug), [courseSlug, getCourseBySlug]);

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
        console.error('Błąd pobierania rankingu w widoku kursu:', error);
      }
    };

    loadRanking();
  }, [userId]);

  useEffect(() => {
    const loadDailyStatus = async () => {
      try {
        const res = await fetch('/api/mathdle/status');
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
    if (course?.course_id) {
        const isWrongData = fullCourseData?.course?.course_id !== course.course_id;
        
        if (isWrongData && !dataLoading) {
            console.log("Pobieram dane dla kursu:", course.course_id);
            preloadCourse(course.course_id);
        }
    }
  }, [course?.course_id, fullCourseData?.course?.course_id, preloadCourse, dataLoading]);

  if (navLoading) return <p>Ładowanie nawigacji...</p>;
  if (!course) return <p>Nie znaleziono kursu</p>;

  const chapters = getChaptersByCourseId(course.course_id);

  const isDataReady = fullCourseData?.course?.course_id === course.course_id;

  return (
    <div className={styles.course_page}>
      {dataLoading && <div style={loadingBarStyle}>Przygotowywanie zadań...</div>}

      <section className={styles.course_main}>
        <ChapterInfo
          courseName={course.title}
          progress={course.progress}
          link={`/dashboard/kursy/${course.slug}/${chapters[0]?.slug || ''}`}
          backgroundColor={course.color}
        >
          {chapters.map((chapter, index) => {
            const isBlocked = !course.owned && index !== 0;

            const chapterData = isDataReady 
              ? fullCourseData.structure?.find(c => c.chapter_id === chapter.chapter_id)
              : null;

            const realTaskCount = chapterData?.topics.reduce((acc, t) => 
              acc + t.lessons.reduce((accL, l) => accL + (l.tasks?.length || 0), 0), 0) || 0;
            
            const realVideoCount = chapterData?.topics.reduce((acc, t) => 
              acc + t.lessons.reduce((accL, l) => accL + (l.video ? 1 : 0), 0), 0) || 0;

            return (
              <ConditionalLink
                key={chapter.chapter_id}
                href={`/dashboard/kursy/${course.slug}/${chapter.slug}`}
                blocked={isBlocked}
              >
                <ChapterCard
                  title={chapter.title}
                  backgroundColor={course.color}
                  tasksCount={isDataReady ? realTaskCount : 0}
                  videosCount={isDataReady ? realVideoCount : 0}
                  progress={chapter.progress || 0}
                  count={index + 1}
                  blocked={isBlocked}
                />
              </ConditionalLink>
            );
          })}
        </ChapterInfo>
      </section>

      <aside className={styles.course_sidebar}>
        <div className={styles.sidebar_card}>
          <HomeRanking users={rankingData} />
        </div>
        <div className={styles.study_plan_shell}>
          <StudyPlanCard tasks={tasks} onTaskToggle={() => {}} />
        </div>
      </aside>
    </div>
  );
}


function ConditionalLink({ blocked, href, children}) {
    if (blocked) {
        return <div style={{ width: "100%", cursor: "not-allowed" }}>{children}</div>;
    }
    return (
        <Link href={href} style={{ textDecoration: "none", width: "100%" }}>
            {children}
        </Link>
    );
}

const loadingBarStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  fontSize: '10px',
  background: '#0070f3',
  color: 'white',
  padding: '2px 10px',
  zIndex: 9999
};
