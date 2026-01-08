'use client';

import Link from "next/link";
import { useParams } from "next/navigation";
import ChapterCard from "../../components/ChapterCard/ChapterCard";
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
      <h1>{course.title}</h1>

      {chapters.map((chapter, index) => {
        const chapterStats = calculateChapterStats(chapter);

        return (
          <div key={chapter.chapter_id} style={{ marginBottom: "16px" }}>
            <Link
              href={`/dashboard/kursy/${course.slug}/${chapter.slug}`}
              style={{ textDecoration: "none" }}
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
          </div>
        );
      })}
    </div>
  );
}
