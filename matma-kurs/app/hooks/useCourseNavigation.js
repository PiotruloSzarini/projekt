'use client';

import { get } from 'node:http';
import { useEffect, useState } from 'react';

/**
 * TEMP DEBUG CONFIG
 *  USUNIESZ TO GDY DODASZ user_courses w DB
 */
const DEBUG_OWNED_COURSE_IDS = [1, 2, 3];

/**
 * HOOK DO NAWIGACJI PO KURSACH
 * Wszystkie funkcje pobierają dane z API i zwracają getterami
 */
export function useCourseNavigation() {
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
        try {
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
            fetch('/api/courses'),
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
        const chaptersData = await chaptersRes.json();
        const topicsData = await topicsRes.json();
        const lessonsData = await lessonsRes.json();
        const videosData = await videosRes.json();
        const taskGroupsData = await taskGroupsRes.json();
        const tasksData = await tasksRes.json();
        const taskTypesData = await taskTypesRes.json();
        setTaskMultipleChoice(await mcRes.json());
        setTaskMultipleChoiceAnswers(await mcAnswersRes.json());
        setTaskSingleInput(await siRes.json());
        setTaskMatchingPairs(await mpRes.json());
        setTaskMatchingPairsItems(await mpItemsRes.json());
        setTaskStepByStep(await sbRes.json());
        setTaskStepByStepSteps(await sbStepsRes.json());

        // Debug: symulacja posiadania kursów
        const coursesWithOwned = coursesData.map(course => ({
            ...course,
            owned: DEBUG_OWNED_COURSE_IDS.includes(course.course_id),
            progress: DEBUG_OWNED_COURSE_IDS.includes(course.course_id) ? 35 : 0
        }));

        setCourses(coursesWithOwned);
        setChapters(chaptersData);
        setTopics(topicsData);
        setLessons(lessonsData);
        setVideos(videosData);
        setTaskGroups(taskGroupsData);
        setTasks(tasksData);
        setTaskTypes(taskTypesData);
        } catch (err) {
            console.error('Course navigation fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

        fetchData();
    }, []);

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
        // 1: MULTIPLE_CHOICE, 2: SINGLE_INPUT, 3: MATCHING, 4: STEP_BY_STEP
        if (task.task_type_id === 1) {
            const mc = taskMultipleChoice.find(m => m.task_id === task.task_id);
            task.answers = taskMultipleChoiceAnswers.filter(a => a.task_multiple_id === mc?.task_multiple_id);
        } 
        else if (task.task_type_id === 2) {
            task.details = taskSingleInput.find(si => si.task_id === task.task_id);
        } 
        else if (task.task_type_id === 3) {
            const pair = taskMatchingPairs.find(p => p.task_id === task.task_id);
            task.pairs = taskMatchingPairsItems.filter(i => i.task_pair_id === pair?.task_pair_id);
        } 
        else if (task.task_type_id === 4) {
            const sbs = taskStepByStep.find(s => s.task_id === task.task_id);
            task.steps = taskStepByStepSteps.filter(s => s.task_step_by_step_id === sbs?.task_step_by_step_id);
        }
        return task;
    });
};
    const getTaskTypeById = (task_type_id) => {
        return taskTypes.find(tt => tt.task_type_id === task_type_id);
    };

    return {
    loading,

    // raw data
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

    // getters
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
// Example usage of useCourseNavigation hook in a component