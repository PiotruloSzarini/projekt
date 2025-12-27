import Link from "next/link";
import { useCourseView } from "@/app/hooks/useCourseView";
import { useCourseNavigation } from "@/app/hooks/useCourseNavigation";

export default async function TopicPage({ params }) {
    const { courseSlug, chapterSlug, topicSlug } = await params;

    const courses = useCourseView();
    const {
        getChapterBySlug,
        getTopicBySlug,
        getLessonsByTopicId
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

  // 4. lekcje
    const lessons = getLessonsByTopicId(topic.topicId);

    return (
        <div>
            <h1>kurs: {course.title}</h1>
            <h2>rozdział: {chapter.title}</h2>
            <h3>temat: {topic.title}</h3>

            {lessons.map(lesson => (
                <Link
                    key={lesson.lessonId}
                    href={`/dashboard/kursy/${course.slug}/${chapter.slug}/${topic.slug}/${lesson.slug}`}
                >
                    <div>
                        <p>lekcja: {lesson.title}</p>
                    </div>
                </Link>
            ))}
        </div>
    );
}
