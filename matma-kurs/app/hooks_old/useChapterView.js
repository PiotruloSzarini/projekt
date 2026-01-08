import chaptersData from '@/dane/mock_dane/chapters.json';
import lessonsData from '@/dane//mock_danelessons.json';
import tasksData from '@/dane/mock_dane/tasks.json';
import videosData from '@/dane/mock_dane/videos.json';
import { getCurrentUserId } from '@/app/lib/fakeAuth';
import { getUserData } from '@/app/lib/getUserData';

export function useChapterView(courseId) {
    const userId = getCurrentUserId();
    const userData = getUserData(userId);

    return chaptersData
        .filter(ch => ch.courseId === courseId)
        .map(chapter => {
        const chapterLessons = lessonsData.filter(
            l => l.chapterId === chapter.chapterId
        );

        const videoIds = chapterLessons.flatMap(l =>
            l.theory.map(t => t.videoId).filter(Boolean)
        );

        const taskGroupIds = chapterLessons.flatMap(l =>
            l.theory.map(t => t.taskGroupId).filter(Boolean)
        );

        const videosCount = videosData.filter(v =>
            videoIds.includes(v.videoId)
        ).length;

        const tasksCount = tasksData.filter(task =>
            taskGroupIds.includes(task.taskGroupId)
        ).length;

        const lessonProgresses = chapterLessons.map(l => {
            const ul = userData?.lessons?.find(
            x => x.lessonId === l.lessonId
            );
            return ul?.progress ?? 0;
        });

        const progress =
            lessonProgresses.length > 0
            ? Math.round(
                lessonProgresses.reduce((a, b) => a + b, 0) /
                lessonProgresses.length
            )
            : 0;

        return {
            chapterId: chapter.chapterId,
            title: chapter.title,
            slug: chapter.slug,

            stats: {
                videosCount,
                tasksCount
            },

            progress
        };
    });
}
