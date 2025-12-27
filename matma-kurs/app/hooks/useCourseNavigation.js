import chapters from '@/dane/mock_dane/chapters.json';
import lessons from '@/dane/mock_dane/lessons.json';
import topics from '@/dane/mock_dane/topics.json';

export function useCourseNavigation() {

    const getChaptersByCourseId = (courseId) =>
        chapters.filter(ch => ch.courseId === courseId);

    const getChapterBySlug = (courseId, chapterSlug) =>
        chapters.find(
        ch => ch.courseId === courseId && ch.slug === chapterSlug
        );

    const getTopicsByChapterId = (chapterId) =>
        topics.filter(t => t.chapterId === chapterId);

    const getTopicBySlug = (chapterId, topicSlug) =>
        topics.find(
        t => t.chapterId === chapterId && t.slug === topicSlug
        );

    const getLessonsByTopicId = (topicId) =>
        lessons.filter(l => l.topicId === topicId);

    const getLessonBySlug = (topicId, lessonSlug) =>
        lessons.find(
        l => l.topicId === topicId && l.slug === lessonSlug
        );

    return {
        getChaptersByCourseId,
        getChapterBySlug,
        getTopicsByChapterId,
        getTopicBySlug,
        getLessonsByTopicId,
        getLessonBySlug
    };
}