'use client';

import Link from 'next/link';
import styles from './page.module.css';
import CourseCard from '../components/CourseComponents/CourseCard/CourseCard';
import CourseInfo from '../components/CourseComponents/CourseInfo/CourseInfo';
import { useCourseNavigation } from '@/app/hooks/useCourseNavigation';

export default function KursyPage() {
    const { loading, courses } = useCourseNavigation();

    if (loading) return <p>Ładowanie kursów...</p>;

    return (
        <div className={styles.page_container}>
            <CourseInfo
                link1="/dashboard/kursy/"
                link2="/dashboard/sklep"
            >
                {courses.map((course) => {
                    const courseCard = (
                        <CourseCard
                            title={course.title}
                            backgroundColor={course.color}
                            tasksCount={course.total_tasks || 0}
                            videosCount={course.total_videos || 0}
                            progress={course.progress ?? 0}
                            owned={Boolean(course.owned)}
                        />
                    );

                    if (course.owned) {
                        return (
                            <Link
                                key={course.course_id}
                                href={`/dashboard/kursy/${course.slug}`}
                                style={{ textDecoration: 'none' }}
                                data-owned={true}
                            >
                                {courseCard}
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={course.course_id}
                            href={`/dashboard/sklep?course=${course.slug}`}
                            style={{ textDecoration: 'none' }}
                            data-owned={false}
                        >
                            {courseCard}
                        </Link>
                    );
                })}
            </CourseInfo>
        </div>
    );
}
