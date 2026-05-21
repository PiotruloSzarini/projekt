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
    const [topics, setTopics] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [videos, setVideos] = useState([]);
    const [taskGroups, setTaskGroups] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [taskTypes, setTaskTypes] = useState([]);
    const [taskMultipleChoice, setTaskMultipleChoice] = useState([]);
    const [taskMultipleChoiceAnswers, setTaskMultipleChoiceAnswers] = useState([]);
    const [taskSingleInput, setTaskSingleInput] = useState([]);
    const [taskMatchingPairs, setTaskMatchingPairs] = useState([]);
    const [taskMatchingPairsItems, setTaskMatchingPairsItems] = useState([]);
    const [taskStepByStep, setTaskStepByStep] = useState([]);
    const [taskStepByStepSteps, setTaskStepByStepSteps] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            // Debugging: sprawdź czy userId dociera do hooka
            console.log("Hook useCourseNavigation - current userId:", userId);

            // Jeśli nie ma userId, a chcesz wersję testową, 
            // API i tak powinno zwrócić listę (z owned=0), 
            // więc możemy pozwolić na fetch bez userId (userId będzie null w query)
            
            try {
                setLoading(true);
                
                // Pobieramy dane równolegle. 
                const [
                    coursesRes,
                    chaptersRes,
                    topicsRes,
                    lessonsRes,
                    videosRes,
                    taskGroupsRes,
                    tasksRes,
                    taskTypesRes,
                    mcRes,
                    mcAnswersRes,
                    siRes,
                    mpRes,
                    mpItemsRes,
                    sbRes,
                    sbStepsRes
                ] = await Promise.all([
                    fetch(`/api/courses?userId=${userId || ''}`),
                    fetch('/api/chapters'),
                    fetch('/api/topics'),
                    fetch('/api/lessons'),
                    fetch('/api/videos'),
                    fetch('/api/task_groups'),
                    fetch('/api/tasks'),
                    fetch('/api/task_types'),
                    fetch('/api/task_multiple_choice'),
                    fetch('/api/task_multiple_choice_answers'),
                    fetch('/api/task_single_input'),
                    fetch('/api/task_matching_pairs'),
                    fetch('/api/task_matching_pairs_items'),
                    fetch('/api/task_step_by_step'),
                    fetch('/api/task_step_by_step_steps')
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
                setTopics(await topicsRes.json());
                setLessons(await lessonsRes.json());
                setVideos(await videosRes.json());
                setTaskGroups(await taskGroupsRes.json());
                setTasks(await tasksRes.json());
                setTaskTypes(await taskTypesRes.json());
                setTaskMultipleChoice(await mcRes.json());
                setTaskMultipleChoiceAnswers(await mcAnswersRes.json());
                setTaskSingleInput(await siRes.json());
                setTaskMatchingPairs(await mpRes.json());
                setTaskMatchingPairsItems(await mpItemsRes.json());
                setTaskStepByStep(await sbRes.json());
                setTaskStepByStepSteps(await sbStepsRes.json());

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

    const getTopicsByChapterId = (chapter_id) =>
        topics
            .filter(t => t.chapter_id === chapter_id)
            .sort((a, b) => a.sort_order - b.sort_order);

    const getTopicBySlug = (chapter_id, topicSlug) =>
        topics.find(
            t => t.chapter_id === chapter_id && t.slug === topicSlug
        );

    const getLessonsByTopicId = (topic_id) =>
        lessons
            .filter(l => l.topic_id === topic_id)
            .sort((a, b) => a.sort_order - b.sort_order);

    const getLessonBySlug = (topic_id, lessonSlug) =>
        lessons.find(
            l => l.topic_id === topic_id && l.slug === lessonSlug
        );

    const getVideosByLessonId = (lesson_id) =>
        videos
            .filter(v => v.lesson_id === lesson_id)
            .sort((a, b) => a.sort_order - b.sort_order);

    const getVideoById = (video_id) =>
        videos.find(v => v.video_id === video_id);

    const getTaskGroupsByLessonId = (lesson_id) =>
        taskGroups
            .filter(tg => tg.lesson_id === lesson_id)
            .sort((a, b) => a.sort_order - b.sort_order);

    const getTasksByTaskGroupId = (task_group_id) => {
        return tasks
            .filter(t => t.task_group_id === task_group_id)
            .map(task => {
                const clonedTask = { ...task };
                if (clonedTask.task_type_id === 1) {
                    const mc = taskMultipleChoice.find(m => m.task_id === clonedTask.task_id);
                    clonedTask.answers = taskMultipleChoiceAnswers.filter(a => a.task_multiple_id === mc?.task_multiple_id);
                } 
                else if (clonedTask.task_type_id === 2) {
                    clonedTask.details = taskSingleInput.find(si => si.task_id === clonedTask.task_id);
                } 
                else if (clonedTask.task_type_id === 3) {
                    const pair = taskMatchingPairs.find(p => p.task_id === clonedTask.task_id);
                    clonedTask.pairs = taskMatchingPairsItems.filter(i => i.task_pair_id === pair?.task_pair_id);
                } 
                else if (clonedTask.task_type_id === 4) {
                    const sbs = taskStepByStep.find(s => s.task_id === clonedTask.task_id);
                    clonedTask.steps = taskStepByStepSteps.filter(s => s.task_step_by_step_id === sbs?.task_step_by_step_id);
                }
                return clonedTask;
            });
    };

    const getTaskTypeById = (task_type_id) => {
        return taskTypes.find(tt => tt.task_type_id === task_type_id);
    };

    return {
        loading,
        courses,
        chapters,
        topics,
        lessons,
        videos,
        taskGroups,
        tasks,
        taskTypes,
        taskMultipleChoice,
        taskMultipleChoiceAnswers,
        taskSingleInput,
        taskMatchingPairs,
        taskMatchingPairsItems,
        taskStepByStep,
        taskStepByStepSteps,

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