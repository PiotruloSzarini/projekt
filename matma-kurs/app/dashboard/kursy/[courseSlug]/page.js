'use client';

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ChapterCard from "../../components/ChapterComponents/ChapterCard/ChapterCard";
import ChapterInfo from "../../components/ChapterComponents/ChapterInfo/ChapterInfo";
import { useCourseNavigation } from "@/app/hooks/useCourseNavigation";
import { useCourseData } from "@/app/context/CourseContext"; // Nasz nowy magazyn danych

export default function CoursePage() {
  const { courseSlug } = useParams();
  const { loading, getCourseBySlug, getChaptersByCourseId } = useCourseNavigation();
  
  const { fullCourseData, preloadCourse, loading: preloadLoading } = useCourseData();

  const course = getCourseBySlug(courseSlug);

  useEffect(() => {
    if (course?.course_id && !fullCourseData) {
        preloadCourse(course.course_id);
    }
  }, [course?.course_id, fullCourseData, preloadCourse]);

  if (loading) return <p>Ładowanie nawigacji...</p>;
  if (!course) return <p>Nie znaleziono kursu</p>;

  const chapters = getChaptersByCourseId(course.course_id);

  return (
    <div>
      {preloadLoading && <div style={loadingBarStyle}>Przygotowywanie zadań...</div>}

      <ChapterInfo
        courseName={course.title}
        progress={course.progress}
        link={`/dashboard/kursy/${course.slug}/${chapters[0]?.slug || ''}`}
        backgroundColor={course.color}
      >
        {chapters.map((chapter, index) => {
          const chapterData = fullCourseData?.structure?.find(c => c.chapter_id === chapter.chapter_id);
          
          const realTaskCount = chapterData?.topics.reduce((acc, t) => acc + t.lessons.reduce((accL, l) => accL + l.tasks.length, 0), 0) || 0;
          const realVideoCount = chapterData?.topics.reduce((acc, t) => acc + t.lessons.reduce((accL, l) => accL + (l.video ? 1 : 0), 0), 0) || 0;

          return (
            <Link
              href={`/dashboard/kursy/${course.slug}/${chapter.slug}`}
              style={{ textDecoration: "none", width: "100%" }}
              key={chapter.chapter_id}
            >
              <ChapterCard
                title={chapter.title}
                backgroundColor={course.color}
                tasksCount={realTaskCount || 0}
                videosCount={realVideoCount || 0}
                progress={chapter.progress || 0}
                count={index + 1}
              />
            </Link>
          );
        })}
      </ChapterInfo>
    </div>
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