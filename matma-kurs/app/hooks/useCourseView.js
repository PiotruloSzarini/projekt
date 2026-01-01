import coursesData from '@/dane/mock_dane/courses.json';
import chaptersData from '@/dane/mock_dane/chapters.json';
import lessonsData from '@/dane/mock_dane/lessons.json';
import tasksData from '@/dane/mock_dane/tasks.json';
import videosData from '@/dane/mock_dane/videos.json';
import { getCurrentUserId } from '@/app/lib/fakeAuth';
import { getUserData } from '@/app/lib/getUserData';

export function useCourseView() {
  const userId = getCurrentUserId();
  const userData = getUserData(userId);

  return coursesData.map(course => {
    const courseChapters = chaptersData.filter(
      ch => ch.courseId === course.courseId
    );

    const courseLessons = lessonsData.filter(l =>
      courseChapters.some(ch => ch.chapterId === l.chapterId)
    );

    const videoIds = courseLessons.flatMap(l =>
      l.theory.map(t => t.videoId).filter(Boolean)
    );

    const taskGroupIds = courseLessons.flatMap(l =>
      l.theory.map(t => t.taskGroupId).filter(Boolean)
    );

    const videosCount = videosData.filter(v =>
      videoIds.includes(v.videoId)
    ).length;

    const tasksCount = tasksData.filter(task =>
      taskGroupIds.includes(task.taskGroupId)
    ).length;

    const userCourse = userData?.courses?.find(
      c => c.courseId === course.courseId
    );

    return {
      courseId: course.courseId,
      slug: course.slug,
      title: course.title,
      color: course.color,

      stats: {
        videosCount,
        tasksCount
      },

      userState: {
        owned: Boolean(userCourse),
        progress: userCourse?.progress ?? 0
      }
    };
  });
}
