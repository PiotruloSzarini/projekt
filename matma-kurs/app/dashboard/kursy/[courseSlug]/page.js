import { useCourseView } from "@/app/hooks/useCourseView";
import { useCourseNavigation } from "@/app/hooks/useCourseNavigation";
import Link from "next/link";

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

        {chapters.map(chapter => (
            <Link
            key={chapter.chapterId}
            href={`/dashboard/kursy/${course.slug}/${chapter.slug}`}
        >
            <div>
                <p>rozdział: {chapter.title}</p>
            </div>
        </Link>
        ))}
    </div>
    );
}
