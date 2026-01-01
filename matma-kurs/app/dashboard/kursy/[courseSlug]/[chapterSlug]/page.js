import Link from "next/link";
import LessonCard from "@/app/dashboard/components/LessonCard/LessonCard";
import { useProgressCalculator } from "@/app/hooks/useProgressCalculator";
import { useCourseNavigation } from "@/app/hooks/useCourseNavigation";

export default async function ChapterPage({ params }) {
    const { courseSlug, chapterSlug } = await params;

    const { coursesStats, calculateLessonStats } = useProgressCalculator();
    const { getChapterBySlug, getTopicsByChapterId, getLessonsByTopicId } = useCourseNavigation();

    const course = coursesStats.find(c => c.slug === courseSlug);
        if (!course) return <p>Nie znaleziono kursu</p>;

    const chapter = getChapterBySlug(course.courseId, chapterSlug);
        if (!chapter) return <p>Nie znaleziono rozdziału</p>;

    const topics = getTopicsByChapterId(chapter.chapterId);

    return (
        <div>
            <h1>kurs: {course.title}</h1>
            <h2>rozdział: {chapter.title}</h2>

            {topics.map((topic, index) => {
                const lessons = getLessonsByTopicId(topic.topicId);

            const lessonStatsArray = lessons.map(l => calculateLessonStats(l));
            const topicProgress = lessonStatsArray.length
                ? Math.round(lessonStatsArray.reduce((a, b) => a + b.progress, 0) / lessonStatsArray.length)
                : 0;

            return (
                <Link
                    key={topic.topicId}
                    href={`/dashboard/kursy/${course.slug}/${chapter.slug}/${topic.slug}`}
                    style={{ textDecoration: "none" }}
                >
                <div style={{ marginBottom: "16px" }}>
                    <LessonCard
                        title={topic.title}
                        backgroundColor={course.color}
                        progress={topicProgress}
                        count={index + 1}
                    />
                </div>
                </Link>
                );
            })}
        </div>
    );
}
