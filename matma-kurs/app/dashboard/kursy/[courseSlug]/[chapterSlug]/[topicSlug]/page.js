'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCourseNavigation } from '@/app/hooks/useCourseNavigation';
import { get } from 'node:http';

export default function TopicLessonsPage() {
  const { courseSlug, chapterSlug, topicSlug } = useParams();

  const {
    getCourseBySlug,
    getChapterBySlug,
    getTopicBySlug,
    getLessonsByTopicId,
    getVideosByLessonId,
    getTaskGroupsByLessonId
  } = useCourseNavigation();

  // 1. Kurs
  const course = getCourseBySlug(courseSlug);
  if (!course) return <p>Nie znaleziono kursu</p>;

  // 2. Rozdział
  const chapter = getChapterBySlug(course.course_id, chapterSlug);
  if (!chapter) return <p>Nie znaleziono rozdziału</p>;

  // 3. Temat
  const topic = getTopicBySlug(chapter.chapter_id, topicSlug);
  if (!topic) return <p>Nie znaleziono tematu</p>;

  // 4. Lekcje w temacie
  const lessons = getLessonsByTopicId(topic.topic_id);
  if (!lessons.length) return <p>Brak lekcji w tym temacie</p>;

  return (
    <div>
      <h1>Kurs: {course.title}</h1>
      <h2>Rozdział: {chapter.title}</h2>
      <h3>Temat: {topic.title}</h3>

      {lessons.map((lesson, index) => {
        const videos = getVideosByLessonId(lesson.lesson_id);
        const taskGroup = getTaskGroupsByLessonId(lesson.lesson_id);

        return (
          <div key={lesson.lesson_id} style={{ marginBottom: '32px' }}>
            <h4>
              {index + 1}. {lesson.title}
            </h4>

            {/* Materiały wideo */}
            {videos.length ? (
              videos
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((video) => (
                  <div key={video.video_id} style={{ marginBottom: '16px' }}>
                    <p>
                      🎬 {video.title} ({video.duration_seconds}s)
                    </p>
                    {video.text && <p>📄 {video.text}</p>}
                  </div>
                ))
            ) : (
              <p>Brak materiałów wideo w tej lekcji</p>
            )}

            {/* Link do zadań */}
            {taskGroup.length && (
              <Link
                href={`/dashboard/kursy/${course.slug}/${chapter.slug}/${topic.slug}/zadania/${taskGroup[0].task_group_id}`}
              >
                <div style={{ marginTop: '8px', color: 'blue' }}>
                  Przejdź do zadań: {taskGroup[0].title}
                </div>
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
