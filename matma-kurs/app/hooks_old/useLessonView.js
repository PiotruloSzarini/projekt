import lessonsData from '@/dane/mock_dane/lessons.json';
import tasksData from '@/dane/mock_dane/tasks.json';
import videosData from '@/dane/mock_dane/videos.json';
import { calculateLessonProgress } from '@/app/lib/calculateLessonProgress';
import { getCurrentUserId } from '@/app/lib/fakeAuth';
import { getUserData } from '@/app/lib/getUserData';

export function useLessonView(chapterId) {
    const userId = getCurrentUserId();
    const userData = getUserData(userId);

    return lessonsData
        .filter(lesson => lesson.chapterId === chapterId)
        .map(lesson => {
            const videoIds = lesson.theory
                .map(t => t.videoId)
                .filter(Boolean);

            const taskGroupIds = lesson.theory
                .map(t => t.taskGroupId)
                .filter(Boolean);

            const videosCount = videosData.filter(v =>
                videoIds.includes(v.videoId)
            ).length;

            const tasksCount = tasksData.filter(task =>
                taskGroupIds.includes(task.taskGroupId)
            ).length;

            const progress = calculateLessonProgress(lesson, userData);

            return {
                lessonId: lesson.lessonId,
                title: lesson.title,
                slug: lesson.slug,

                stats: {
                    videosCount,
                    tasksCount
                },

                progress
            };
        });
}
