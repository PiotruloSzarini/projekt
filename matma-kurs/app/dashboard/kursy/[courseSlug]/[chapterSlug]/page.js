'use client';

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import TopicCard from "@/app/dashboard/components/TopicComponents/TopicCard/TopicCard";
import TopicInfo from "@/app/dashboard/components/TopicComponents/TopicInfo/TopicInfo";
import { useCourseData } from "@/app/context/CourseContext";
import { useCourseNavigation } from "@/app/hooks/useCourseNavigation";

export default function TopicPage() {
  const { courseSlug, chapterSlug } = useParams();
  const { getCourseBySlug, loading: navLoading } = useCourseNavigation();
  const { fullCourseData, preloadCourse, loading: dataLoading } = useCourseData();

  const courseNavigationInfo = getCourseBySlug(courseSlug);

  useEffect(() => {
    if (courseNavigationInfo?.course_id) {
        // POPRAWKA: Sprawdzamy fullCourseData.course?.course_id zamiast fullCourseData.course_id
        const isDataLoaded = fullCourseData?.course?.course_id === courseNavigationInfo.course_id;
        
        if (!isDataLoaded && !dataLoading) {
            console.log("Ładuję dane dla kursu:", courseNavigationInfo.course_id);
            preloadCourse(courseNavigationInfo.course_id);
        }
    }
  }, [courseNavigationInfo?.course_id, fullCourseData, preloadCourse, dataLoading]);

  // 1. Czekamy na nawigację i dane
  if (navLoading || (dataLoading && !fullCourseData)) {
      return <p>Ładowanie struktury kursu...</p>;
  }

  // 2. Sprawdzamy czy mamy dane w kontekście
  if (!fullCourseData || !fullCourseData.structure) {
      return <p>Inicjalizacja danych...</p>;
  }

  // 3. Szukamy rozdziału (używamy .find na strukturze z API)
  const chapter = fullCourseData.structure.find(c => c.slug === chapterSlug);

  if (!chapter) {
      return (
        <div style={{ padding: '20px' }}>
            <p>Nie znaleziono rozdziału: <strong>{chapterSlug}</strong></p>
            <Link href={`/dashboard/kursy/${courseSlug}`}>Wróć do listy rozdziałów</Link>
        </div>
      );
  }

  const topics = chapter.topics || [];

  return (
    <div>
      <TopicInfo
        chapterName={chapter.title}
        progress={chapter.progress || 0}
        link={`/dashboard/kursy/${courseSlug}/${chapterSlug}/${topics[0]?.slug || ''}`}
        backgroundColor={fullCourseData.course?.color || '#333'}
        count={chapter.sort_order || 1}
      >
        {topics.length > 0 ? (
            topics.map((topic, index) => (
                <Link
                  key={topic.topic_id}
                  href={`/dashboard/kursy/${courseSlug}/${chapterSlug}/${topic.slug}`}
                  style={{ textDecoration: "none", width: "100%" }}
                >
                  <TopicCard
                    title={topic.title}
                    backgroundColor={fullCourseData.course?.color}
                    progress={topic.progress || 0} 
                    count={index + 1}
                  />
                </Link>
            ))
        ) : (
            <p>Ten rozdział nie ma jeszcze żadnych tematów.</p>
        )}
      </TopicInfo>
    </div>
  );
}