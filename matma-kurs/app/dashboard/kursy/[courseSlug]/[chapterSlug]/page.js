import Link from "next/link";
import { useCourseView } from "@/app/hooks/useCourseView";
import { useCourseNavigation } from "@/app/hooks/useCourseNavigation";
import LessonCard from "@/app/dashboard/components/LessonCard/LessonCard";

export default async function ChapterPage({ params }) {
    const { courseSlug, chapterSlug } = await params;

    const courses = useCourseView();

    const {
        getChapterBySlug,
        getTopicsByChapterId
    } = useCourseNavigation();

    const course = courses.find(c => c.slug === courseSlug);
    if (!course) {
        return <p>Nie znaleziono kursu</p>;
    }

    const chapter = getChapterBySlug(course.courseId, chapterSlug);
    if (!chapter) {
    return <p>Nie znaleziono rozdziału</p>;
    }

    const topics = getTopicsByChapterId(chapter.chapterId);

    return (
        <div>
        <h1>kurs: {course.title}</h1>
        <h2>rozdział: {chapter.title}</h2>


        {topics.map((topic, index) => (
            <Link
            key={topic.topicId}
            href={`/dashboard/kursy/${course.slug}/${chapter.slug}/${topic.slug}`}
            style={{ textDecoration: 'none' }}
            >
            <div style={{ marginBottom: '16px' }}>
                <LessonCard
                title={topic.title}
                backgroundColor={course.color}
                progress={course.userState.progress}
                count={index + 1}
                />
            </div>
        </Link>
        ))}
    </div>
    );
}
