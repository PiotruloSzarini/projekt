'use client';

import { useEffect, useState } from 'react';
import { useCourseData } from '@/app/context/CourseContext';

/**
 * HOOK DO NAWIGACJI PO KURSACH
 * Zintegrowany z bazą danych i systemem uprawnień (userId)
 */
export function useCourseNavigation() {
    const { userId } = useCourseData(); // Pobieramy userId z kontekstu aplikacji
    const [courses, setCourses] = useState([]);
    const [chapters, setChapters] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                const [coursesRes, chaptersRes] = await Promise.all([
                    fetch(`/api/courses?userId=${userId || ''}`),
                    fetch('/api/chapters'),
                ]);

                const coursesData = await coursesRes.json();
                
                // ZABEZPIECZENIE: Jeśli API zwróciło błąd zamiast tablicy, zapobiegamy crashowi .map
                if (Array.isArray(coursesData)) {
                    setCourses(coursesData.map(c => ({
                        ...c,
                        owned: Boolean(c.owned), // Konwersja 0/1 z MySQL na true/false
                        progress: Number(c.progress) || 0,
                        tasksCount: c.total_tasks || 0, // Nowe pole z SQL
                        videosCount: c.total_videos || 0 // Nowe pole z SQL
                    })));
                } else {
                    console.error("API /api/courses nie zwróciło tablicy. Otrzymano:", coursesData);
                    setCourses([]);
                }

                setChapters(await chaptersRes.json());

            } catch (err) {
                console.error('Course navigation fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    /**
     * ==========================
     * GETTERY
     * ==========================
     */

    const getCourses = () => courses;

    const getCourseBySlug = (slug) =>
        courses.find(c => c.slug === slug);

    const getChaptersByCourseId = (course_id) =>
        chapters
            .filter(ch => ch.course_id === course_id)
            .sort((a, b) => a.sort_order - b.sort_order);

    const getChapterBySlug = (course_id, chapterSlug) =>
        chapters.find(
            ch => ch.course_id === course_id && ch.slug === chapterSlug
        );

    const getTopicsByChapterId = () =>
        [];

    const getTopicBySlug = () =>
        undefined;

    const getLessonsByTopicId = () =>
        [];

    const getLessonBySlug = () =>
        undefined;

    const getVideosByLessonId = () =>
        [];

    const getVideoById = () =>
        undefined;

    const getTaskGroupsByLessonId = () =>
        [];

    const getTasksByTaskGroupId = () => {
        return [];
    };

    const getTaskTypeById = () => {
        return undefined;
    };

    return {
        loading,
        courses,
        chapters,
        topics: [],
        lessons: [],
        videos: [],
        taskGroups: [],
        tasks: [],
        taskTypes: [],
        taskMultipleChoice: [],
        taskMultipleChoiceAnswers: [],
        taskSingleInput: [],
        taskMatchingPairs: [],
        taskMatchingPairsItems: [],
        taskStepByStep: [],
        taskStepByStepSteps: [],

        getCourses,
        getCourseBySlug,
        getChaptersByCourseId,
        getChapterBySlug,
        getTopicsByChapterId,
        getTopicBySlug,
        getLessonsByTopicId,
        getLessonBySlug,
        getVideosByLessonId,
        getVideoById,
        getTaskGroupsByLessonId,
        getTasksByTaskGroupId,
        getTaskTypeById
    };
}
