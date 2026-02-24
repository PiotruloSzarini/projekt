'use client';

import Link from "next/link";
import { useParams } from "next/navigation";
import ChapterCard from "../../components/ChapterComponents/ChapterCard/ChapterCard";
import ChapterInfo from "../../components/ChapterComponents/ChapterInfo/ChapterInfo";
import { useCourseNavigation } from "@/app/hooks/useCourseNavigation";
import { useProgressCalculator } from "@/app/hooks_old/useProgressCalculator";

export default function CoursePage() {
  const { courseSlug } = useParams(); // ← JEDYNA POPRAWNA FORMA

  const { loading, getCourseBySlug, getChaptersByCourseId } = useCourseNavigation();
  const { calculateChapterStats } = useProgressCalculator();

  if (loading) return <p>Ładowanie danych kursu...</p>;

  const course = getCourseBySlug(courseSlug);
  if (!course) return <p>Nie znaleziono kursu</p>;

  const chapters = getChaptersByCourseId(course.course_id);

  return (
    <div>
      <ChapterInfo
        courseName={course.title}
        progress={course.progress}
        link={`/dashboard/kursy/${course.slug}/rozdzial-1`}
        backgroundColor={course.color}
      >
        {chapters.map((chapter, index) => {
        const chapterStats = calculateChapterStats(chapter);

        return (
            <Link
              href={`/dashboard/kursy/${course.slug}/${chapter.slug}`}
              style={{ textDecoration: "none", width: "100%" }}
              key={chapter.chapter_id}
            >
              <ChapterCard
                title={chapter.title}
                backgroundColor={course.color}
                tasksCount={chapterStats.taskCount}
                videosCount={chapterStats.videoCount}
                progress={chapterStats.progress}
                count={index + 1}
              />
            </Link>
          );
        })}
      </ChapterInfo>

      
    </div>
  );
}
