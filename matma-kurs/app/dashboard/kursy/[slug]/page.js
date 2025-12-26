import courses from '@/dane/courses.json';
import chapters from '@/dane/chapters.json';

export default async function ChapterPage({ params }) {
    const { slug } = await params;

    const course = courses.find(c => c.slug === slug);

    const courseChapters = chapters.filter(ch => ch.courseSlug === slug);

    return (
        <div>
            <h1>{course.title}</h1>
            <ul>
                {courseChapters.map(chapter => (
                    <li key={chapter.chapterId}>{chapter.title}</li>
                ))}
            </ul> 
        </div>
    );

}