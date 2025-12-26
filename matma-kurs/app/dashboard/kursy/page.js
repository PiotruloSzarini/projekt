import CourseCard from '../components/CourseCard/CourseCard';
import styles from '../kursy/page.module.css'
import courses from '@/dane/courses.json';

export default function KursyPage() {
    const ownedCourses = courses.filter(c => c.userState.owned);
    const notOwnedCourses = courses.filter(c => !c.userState.owned);

    return (
        <div className={styles.page_container}>
        <p>Posiadane:</p>
        <div className={styles.course_container}>
            {ownedCourses.map(course => (
            <CourseCard
                key={course.courseId}
                title={course.title}
                backgroundColor={course.color}
                tasksCount={course.stats.tasksCount}
                videosCount={course.stats.videosCount}
                progress={course.userState.progress}
                owned={true}
            />
        ))}
        </div>

        <p>Nie posiadane:</p>
        <div className={styles.course_container}>
            {notOwnedCourses.map(course => (
            <CourseCard
                key={course.courseId}
                title={course.title}
                backgroundColor={course.color}
                tasksCount={course.stats.tasksCount}
                videosCount={course.stats.videosCount}
                progress={0}
                owned={false}
            />
            ))}
        </div>
    </div>
    );
}