'use client';

import Link from 'next/link';
import CourseCard from '../components/CourseCard/CourseCard';
import styles from '../kursy/page.module.css';
import { useCourseNavigation } from '@/app/hooks/useCourseNavigation';

export default function KursyPage() {
  const { loading, courses } = useCourseNavigation();

  if (loading) return <p>Ładowanie kursów...</p>;

  const ownedCourses = courses.filter(c => c.owned);
  const notOwnedCourses = courses.filter(c => !c.owned);

  return (
    <div className={styles.page_container}>
      <p>Posiadane:</p>

      <div className={styles.course_container}>
        {ownedCourses.map(course => (
          <Link
            key={course.course_id}
            href={`/dashboard/kursy/${course.slug}`}
            className={styles.courseLink}
          > 
            <CourseCard
              key={course.course_id}
              title={course.title}
              backgroundColor={course.color}
              tasksCount={123}     
              videosCount={123}   
              progress={course.progress ?? 0}
              owned={true}
            />
          </Link>
        ))}
      </div>

      <p>Nie posiadane:</p>

      <div className={styles.course_container}>
        {notOwnedCourses.map(course => (
          <CourseCard
            key={course.course_id}
            title={course.title}
            backgroundColor={course.color}
            tasksCount={123}     
            videosCount={123} 
            progress={0}
            owned={false}
          />
        ))}
      </div>
    </div>
  );
}
