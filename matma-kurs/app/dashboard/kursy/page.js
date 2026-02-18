'use client';

import CourseCard from '../components/CourseComponents/CourseCard/CourseCard';
import CourseInfo from '../components/CourseComponents/CourseInfo/CourseInfo'
import { useCourseNavigation } from '@/app/hooks/useCourseNavigation';
import Link from 'next/link';
import styles from '../kursy/page.module.css';

export default function KursyPage() {
    const { loading, courses } = useCourseNavigation();

    if (loading) return <p>Ładowanie kursów...</p>;

    return (
    <div className={styles.page_container}>
        <CourseInfo 
            link1="/dashboard/kursy/" 
            link2="/sklep"
        >
        {courses.map(course => (
            course.owned ? (
                <Link
                    key={course.course_id}
                    href={`/dashboard/kursy/${course.slug}`}
                    style={{ textDecoration: 'none' }}
                    owned={true}
                >
                    <CourseCard
                        title={course.title}
                        backgroundColor={course.color}
                        tasksCount={123}     
                        videosCount={123}   
                        progress={course.progress ?? 0}
                        owned={true}
                    />
                </Link>
            ) : (
                <CourseCard
                    key={course.course_id}
                    title={course.title}
                    backgroundColor={course.color}
                    tasksCount={123}     
                    videosCount={123} 
                    progress={0}
                    owned={false}
                />
                )
            ))}
        </CourseInfo>
    </div>
    );
}