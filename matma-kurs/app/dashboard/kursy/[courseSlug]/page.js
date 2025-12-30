import { useCourseView } from "@/app/hooks/useCourseView";
import { useCourseNavigation } from "@/app/hooks/useCourseNavigation";
import Link from "next/link";
import ChapterCard from "../../components/ChapterCard/ChapterCard";

export default async function CoursePage({ params }) {
    const { courseSlug } = await params;

    const courses = useCourseView();
    const { getChaptersByCourseId } = useCourseNavigation();

    const course = courses.find(c => c.slug === courseSlug);

    if (!course) {
        return <p>Nie znaleziono kursu</p>;
    }

    const chapters = getChaptersByCourseId(course.courseId);

    return (
        <div>
        <h1>{course.title}</h1>

        {chapters.map((chapter, index) => (
        <div key={chapter.chapterId} style={{ marginBottom: '16px' }}>
        <Link
            href={`/dashboard/kursy/${course.slug}/${chapter.slug}`}
            style={{ textDecoration: 'none' }}
        >
            <ChapterCard
                title={chapter.title}
                backgroundColor={course.color}
                tasksCount={course.stats.tasksCount}
                videosCount={course.stats.videosCount}
                progress={course.userState.progress}
                count={index + 1}
            />
        </Link>
    </div>
))}
        
    </div>
    );
}
