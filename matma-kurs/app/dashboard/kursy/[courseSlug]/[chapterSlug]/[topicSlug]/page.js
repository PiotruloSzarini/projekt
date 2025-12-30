import Link from "next/link";
import lessonsData from "@/dane/mock_dane/lessons.json";
import { useCourseView } from "@/app/hooks/useCourseView";
import { useCourseNavigation } from "@/app/hooks/useCourseNavigation";

export default async function LessonPage({ params }) {
  const { courseSlug, chapterSlug, topicSlug, lessonSlug } = await params;

  const courses = useCourseView();
  const {
    getChapterBySlug,
    getTopicBySlug,
    getLessonBySlug,
    getVideoById,
    getTextById
  } = useCourseNavigation();

  // 1. kurs
  const course = courses.find(c => c.slug === courseSlug);
  if (!course) return <p>Nie znaleziono kursu</p>;

   // 2. rozdział
  const chapter = getChapterBySlug(course.courseId, chapterSlug);
  if (!chapter) return <p>Nie znaleziono rozdziału</p>;

  // 3. temat
  const topic = getTopicBySlug(chapter.chapterId, topicSlug);
  if (!topic) return <p>Nie znaleziono tematu</p>;

  // 4. lekcje w temacie
  const lessons = lessonsData
    .filter(l => topic.lessons.includes(l.lessonId))
    .sort((a, b) => a.order - b.order);

  if (!lessons.length) return <p>Brak lekcji w tym temacie</p>;

  return (
    <div>
      <h2>{topic.title}</h2>

      {lessons.map(lesson => (
        <div key={lesson.lessonId} style={{ marginBottom: "32px" }}>
          <h3>{lesson.title}</h3>

          {lesson.theory
            .sort((a, b) => a.order - b.order)
            .map((block, i) => (
              <div key={i} style={{ marginBottom: "24px" }}>
                {block.videoId && (
                  <div>
                    <p>film: {getVideoById(block.videoId)?.title}</p>
                  </div>
                )}

                {block.textId && (
                  <div>
                    <p>text: {getTextById(block.textId)?.content}</p>
                  </div>
                )}

                {block.taskGroupId && (
                  <Link href={`./${lesson.slug}/zadania/${block.taskGroupId}`}>
                    <div>
                      Przejdź do zadań
                    </div>
                  </Link>
                )}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}