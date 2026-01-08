'use client';

import Link from "next/link";
import { useParams } from "next/navigation";
import LessonCard from "@/app/dashboard/components/LessonCard/LessonCard";
import { useCourseNavigation } from "@/app/hooks/useCourseNavigation";

export default function TopicPage() {
  const { courseSlug, chapterSlug, topicSlug } = useParams();

  const {
    getCourseBySlug,
    getChapterBySlug,
    getTopicsByChapterId
  } = useCourseNavigation();

  // Pobieramy kurs
  const course = getCourseBySlug(courseSlug);
  if (!course) return <p>Nie znaleziono kursu</p>;

  // Pobieramy rozdział
  const chapter = getChapterBySlug(course.course_id, chapterSlug);
  if (!chapter) return <p>Nie znaleziono rozdziału</p>;

  // Pobieramy temat
  const topics = getTopicsByChapterId(chapter.chapter_id);
  if (!topics) return <p>Nie znaleziono tematu</p>;

  return (
    <div>
      <h1>Kurs: {course.title}</h1>
      <h2>Rozdział: {chapter.title}</h2>

      {topics.map((topic, index) => {
        return (
          <Link
            key={topic.topic_id}
            href={`/dashboard/kursy/${course.slug}/${chapter.slug}/${topic.slug}`}
            style={{ textDecoration: "none" }}
          >
            <div style={{ marginBottom: "16px" }}>
              <LessonCard
                title={topic.title}
                backgroundColor={course.color}
                progress={50} // placeholder progress
                count={index + 1}
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
