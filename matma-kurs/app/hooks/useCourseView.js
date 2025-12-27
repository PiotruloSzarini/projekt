import coursesData from '@/dane/courses.json';
import { getCurrentUserId } from '@/app/lib/fakeAuth';
import { getUserData } from '@/app/lib/getUserData';

export function useCourseView() {
    const userId = getCurrentUserId();
    const userData = getUserData(userId);

    const courses = Array.isArray(coursesData)
    ? coursesData
    : [coursesData];

    return courses.map(course => {
    const userCourse = userData?.courses.find(
        c => c.courseId === course.courseId
    );

    return {
        courseId: course.courseId,
        slug: course.slug,
        title: course.title,
        color: course.color,

        stats: {
            tasksCount: course.stats?.tasksCount ?? 0,
            videosCount: course.stats?.videosCount ?? 0
        },

        userState: {
            owned: Boolean(userCourse),
            progress: userCourse?.progress ?? 0
        }
    };
});
}
