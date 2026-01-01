import CourseCard from '../components/CourseCard/CourseCard';
import styles from '../kursy/page.module.css';
import Link from 'next/link';
import { useProgressCalculator } from '@/app/hooks/useProgressCalculator';

export default function KursyPage() {
  const { coursesStats } = useProgressCalculator();

  const ownedCourses = coursesStats.filter(c => c.userState.owned);
  const notOwnedCourses = coursesStats.filter(c => !c.userState.owned);

  return (
    <div className={styles.page_container}>
      <p>Posiadane:</p>
      <div className={styles.course_container}>
        {ownedCourses.map(course => (
          <Link
            key={course.courseId}
            href={`/dashboard/kursy/${course.slug}`}
            className={styles.courseLink}
          >
            <CourseCard
              title={course.title}
              backgroundColor={course.color}
              tasksCount={course.stats.taskCount}
              videosCount={course.stats.videoCount}
              progress={course.userState.progress}
              owned={true}
            />
          </Link>
        ))}
      </div>

      <p>Nie posiadane:</p>
      <div className={styles.course_container}>
        {notOwnedCourses.map(course => (
          <CourseCard
            key={course.courseId}
            title={course.title}
            backgroundColor={course.color}
            tasksCount={course.stats.taskCount}
            videosCount={course.stats.videoCount}
            progress={0}
            owned={false}
          />
        ))}
      </div>
    </div>
  );
}
