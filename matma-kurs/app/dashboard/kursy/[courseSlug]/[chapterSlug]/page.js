import Link from "next/link";
import { useCourseView } from "@/app/hooks/useCourseView";
import { useCourseNavigation } from "@/app/hooks/useCourseNavigation";

export default async function ChapterPage({ params }) {
    const { courseSlug, chapterSlug } = await params;

  // 1. kursy (z userState)
    const courses = useCourseView();

  // 2. nawigacja edukacyjna
    const {
        getChapterBySlug,
        getTopicsByChapterId
    } = useCourseNavigation();

  // 3. znajdź kurs
    const course = courses.find(c => c.slug === courseSlug);
    if (!course) {
        return <p>Nie znaleziono kursu</p>;
    }

  // 4. znajdź rozdział
    const chapter = getChapterBySlug(course.courseId, chapterSlug);
    if (!chapter) {
    return <p>Nie znaleziono rozdziału</p>;
    }

  // 5. pobierz tematy
    const topics = getTopicsByChapterId(chapter.chapterId);

    return (
        <div>
        <h1>kurs: {course.title}</h1>
        <h2>rozdział: {chapter.title}</h2>


        {topics.map(topic => (
            <Link
            key={topic.topicId}
            href={`/dashboard/kursy/${course.slug}/${chapter.slug}/${topic.slug}`}
            >
            <div>
                <p>temat: {topic.title}</p>
            </div>
        </Link>
        ))}
    </div>
    );
}
