import pool from '@/app/lib/db';

function isPresentId(value) {
    return Boolean(value && value !== 'null' && value !== 'undefined');
}

function groupBy(rows, key) {
    return rows.reduce((acc, row) => {
        const groupKey = row[key];
        if (!acc.has(groupKey)) acc.set(groupKey, []);
        acc.get(groupKey).push(row);
        return acc;
    }, new Map());
}

function indexBy(rows, key) {
    return rows.reduce((acc, row) => {
        acc.set(row[key], row);
        return acc;
    }, new Map());
}

export async function getCoursesForUser({ userId, isAdmin = false } = {}) {
    const query = `
        SELECT 
            c.*, 
            CASE WHEN uc.user_id IS NOT NULL THEN 1 ELSE 0 END as owned,
            COALESCE(up.progress_percent, 0) as progress,
            (SELECT COUNT(*) FROM videos v
                JOIN lessons l ON v.lesson_id = l.lesson_id
                JOIN topics t ON l.topic_id = t.topic_id
                JOIN chapters ch ON t.chapter_id = ch.chapter_id
                WHERE ch.course_id = c.course_id) as total_videos,
            (SELECT COUNT(*) FROM tasks t
                JOIN task_groups tg ON t.task_group_id = tg.task_group_id
                JOIN lessons l ON tg.lesson_id = l.lesson_id
                JOIN topics tp ON l.topic_id = tp.topic_id
                JOIN chapters ch ON tp.chapter_id = ch.chapter_id
                WHERE ch.course_id = c.course_id) as total_tasks
        FROM courses c
        LEFT JOIN user_courses uc ON c.course_id = uc.course_id AND uc.user_id = ?
        LEFT JOIN user_progress up ON c.course_id = up.entity_id 
            AND up.entity_type = 'COURSE' 
            AND up.user_id = ?
        ORDER BY c.course_id ASC
    `;

    const [rows] = await pool.execute(query, [userId || null, userId || null]);

    return rows.map((row) => ({
        ...row,
        owned: isAdmin ? 1 : Number(row.owned || 0),
    }));
}

export async function getFullCourseData({ courseId, userId, isAdmin = false }) {
    let isOwned = false;
    let ownershipData = null;

    if (isPresentId(userId)) {
        const [userAccess] = await pool.execute(
            'SELECT * FROM user_courses WHERE user_id = ? AND course_id = ?',
            [userId, courseId]
        );

        if (userAccess.length > 0) {
            isOwned = true;
            ownershipData = userAccess[0];
        }
    }

    if (isAdmin) {
        isOwned = true;
    }

    const [
        [courses], [chapters], [topics], [lessons], [videos],
        [tasks], [taskGroups],
        [mcQuestions], [mcAnswers],
        [siData],
        [matchingPairs], [matchingItems],
        [sbsData], [sbsSteps],
        [explanations], [explanationSteps], [hints],
    ] = await Promise.all([
        pool.execute('SELECT * FROM courses WHERE course_id = ?', [courseId]),
        pool.execute('SELECT * FROM chapters WHERE course_id = ? ORDER BY chapter_id ASC', [courseId]),
        pool.execute('SELECT * FROM topics WHERE chapter_id IN (SELECT chapter_id FROM chapters WHERE course_id = ?) ORDER BY sort_order ASC', [courseId]),
        pool.execute(`
            SELECT l.* FROM lessons l
            JOIN topics t ON l.topic_id = t.topic_id
            JOIN chapters c ON t.chapter_id = c.chapter_id
            WHERE c.course_id = ?`, [courseId]),
        pool.execute(`SELECT v.* FROM videos v JOIN lessons l ON v.lesson_id = l.lesson_id JOIN topics t ON l.topic_id = t.topic_id JOIN chapters c ON t.chapter_id = c.chapter_id WHERE c.course_id = ?`, [courseId]),
        pool.execute(`SELECT ts.* FROM tasks ts JOIN task_groups tg ON ts.task_group_id = tg.task_group_id JOIN lessons l ON tg.lesson_id = l.lesson_id JOIN topics t ON l.topic_id = t.topic_id JOIN chapters c ON t.chapter_id = c.chapter_id WHERE c.course_id = ? ORDER BY COALESCE(ts.sort_order, 999999), ts.task_id ASC`, [courseId]),
        pool.execute(`
            SELECT tg.* FROM task_groups tg
            JOIN lessons l ON tg.lesson_id = l.lesson_id
            JOIN topics t ON l.topic_id = t.topic_id
            JOIN chapters c ON t.chapter_id = c.chapter_id
            WHERE c.course_id = ?`, [courseId]),
        pool.execute(`
            SELECT mc.* FROM task_multiple_choice mc
            JOIN tasks ts ON mc.task_id = ts.task_id
            JOIN task_groups tg ON ts.task_group_id = tg.task_group_id
            JOIN lessons l ON tg.lesson_id = l.lesson_id
            JOIN topics t ON l.topic_id = t.topic_id
            JOIN chapters c ON t.chapter_id = c.chapter_id
            WHERE c.course_id = ?`, [courseId]),
        pool.execute(`
            SELECT a.* FROM task_multiple_choice_answers a
            JOIN task_multiple_choice mc ON a.task_multiple_id = mc.task_multiple_id
            JOIN tasks ts ON mc.task_id = ts.task_id
            JOIN task_groups tg ON ts.task_group_id = tg.task_group_id
            JOIN lessons l ON tg.lesson_id = l.lesson_id
            JOIN topics t ON l.topic_id = t.topic_id
            JOIN chapters c ON t.chapter_id = c.chapter_id
            WHERE c.course_id = ?
            ORDER BY a.task_multiple_id, a.sort_order`, [courseId]),
        pool.execute(`
            SELECT si.* FROM task_single_input si
            JOIN tasks ts ON si.task_id = ts.task_id
            JOIN task_groups tg ON ts.task_group_id = tg.task_group_id
            JOIN lessons l ON tg.lesson_id = l.lesson_id
            JOIN topics t ON l.topic_id = t.topic_id
            JOIN chapters c ON t.chapter_id = c.chapter_id
            WHERE c.course_id = ?`, [courseId]),
        pool.execute(`
            SELECT mp.* FROM task_matching_pairs mp
            JOIN tasks ts ON mp.task_id = ts.task_id
            JOIN task_groups tg ON ts.task_group_id = tg.task_group_id
            JOIN lessons l ON tg.lesson_id = l.lesson_id
            JOIN topics t ON l.topic_id = t.topic_id
            JOIN chapters c ON t.chapter_id = c.chapter_id
            WHERE c.course_id = ?`, [courseId]),
        pool.execute(`
            SELECT mpi.* FROM task_matching_pairs_items mpi
            JOIN task_matching_pairs mp ON mpi.task_pair_id = mp.task_pair_id
            JOIN tasks ts ON mp.task_id = ts.task_id
            JOIN task_groups tg ON ts.task_group_id = tg.task_group_id
            JOIN lessons l ON tg.lesson_id = l.lesson_id
            JOIN topics t ON l.topic_id = t.topic_id
            JOIN chapters c ON t.chapter_id = c.chapter_id
            WHERE c.course_id = ?
            ORDER BY mpi.task_pair_id, mpi.sort_order`, [courseId]),
        pool.execute(`
            SELECT sbs.* FROM task_step_by_step sbs
            JOIN tasks ts ON sbs.task_id = ts.task_id
            JOIN task_groups tg ON ts.task_group_id = tg.task_group_id
            JOIN lessons l ON tg.lesson_id = l.lesson_id
            JOIN topics t ON l.topic_id = t.topic_id
            JOIN chapters c ON t.chapter_id = c.chapter_id
            WHERE c.course_id = ?`, [courseId]),
        pool.execute(`
            SELECT st.* FROM task_step_by_step_steps st
            JOIN task_step_by_step sbs ON st.task_step_by_step_id = sbs.task_step_by_step_id
            JOIN tasks ts ON sbs.task_id = ts.task_id
            JOIN task_groups tg ON ts.task_group_id = tg.task_group_id
            JOIN lessons l ON tg.lesson_id = l.lesson_id
            JOIN topics t ON l.topic_id = t.topic_id
            JOIN chapters c ON t.chapter_id = c.chapter_id
            WHERE c.course_id = ?
            ORDER BY st.task_step_by_step_id, st.sort_order`, [courseId]),
        pool.execute(`
            SELECT e.* FROM task_explanation e
            JOIN tasks ts ON e.task_id = ts.task_id
            JOIN task_groups tg ON ts.task_group_id = tg.task_group_id
            JOIN lessons l ON tg.lesson_id = l.lesson_id
            JOIN topics t ON l.topic_id = t.topic_id
            JOIN chapters c ON t.chapter_id = c.chapter_id
            WHERE c.course_id = ?`, [courseId]),
        pool.execute(`
            SELECT es.* FROM task_explanation_steps es
            JOIN task_explanation e ON es.explanation_id = e.explanation_id
            JOIN tasks ts ON e.task_id = ts.task_id
            JOIN task_groups tg ON ts.task_group_id = tg.task_group_id
            JOIN lessons l ON tg.lesson_id = l.lesson_id
            JOIN topics t ON l.topic_id = t.topic_id
            JOIN chapters c ON t.chapter_id = c.chapter_id
            WHERE c.course_id = ?`, [courseId]),
        pool.execute(`
            SELECT h.* FROM task_hints h
            JOIN tasks ts ON h.task_id = ts.task_id
            JOIN task_groups tg ON ts.task_group_id = tg.task_group_id
            JOIN lessons l ON tg.lesson_id = l.lesson_id
            JOIN topics t ON l.topic_id = t.topic_id
            JOIN chapters c ON t.chapter_id = c.chapter_id
            WHERE c.course_id = ?`, [courseId]),
    ]);

    const topicsByChapterId = groupBy(topics, 'chapter_id');
    const lessonsByTopicId = groupBy(lessons, 'topic_id');
    const videosByLessonId = indexBy(videos, 'lesson_id');
    const taskGroupsByLessonId = indexBy(taskGroups, 'lesson_id');
    const mcByTaskId = indexBy(mcQuestions, 'task_id');
    const mcAnswersByMultipleId = groupBy(mcAnswers, 'task_multiple_id');
    const singleInputByTaskId = indexBy(siData, 'task_id');
    const matchingPairsByTaskId = indexBy(matchingPairs, 'task_id');
    const matchingItemsByPairId = groupBy(matchingItems, 'task_pair_id');
    const stepByStepByTaskId = indexBy(sbsData, 'task_id');
    const stepByStepStepsByParentId = groupBy(sbsSteps, 'task_step_by_step_id');
    const explanationByTaskId = indexBy(explanations, 'task_id');
    const explanationStepsByParentId = groupBy(explanationSteps, 'explanation_id');
    const hintsByTaskId = groupBy(hints, 'task_id');

    const fullTasks = tasks.map((task) => {
        const details = {};

        switch (task.task_type_id) {
            case 1: {
                const mc = mcByTaskId.get(task.task_id);
                if (mc) details.answers = mcAnswersByMultipleId.get(mc.task_multiple_id) || [];
                break;
            }
            case 2: {
                const si = singleInputByTaskId.get(task.task_id);
                if (si) details.correct_value = si.correct_value;
                break;
            }
            case 3: {
                const matchingPair = matchingPairsByTaskId.get(task.task_id);
                if (matchingPair) details.items = matchingItemsByPairId.get(matchingPair.task_pair_id) || [];
                break;
            }
            case 4: {
                const stepByStep = stepByStepByTaskId.get(task.task_id);
                if (stepByStep) details.steps = stepByStepStepsByParentId.get(stepByStep.task_step_by_step_id) || [];
                break;
            }
        }

        const explanationHeader = explanationByTaskId.get(task.task_id);
        details.explanation = explanationHeader
            ? {
                ...explanationHeader,
                steps: explanationStepsByParentId.get(explanationHeader.explanation_id) || [],
            }
            : null;
        details.hints = hintsByTaskId.get(task.task_id) || [];

        return { ...task, details };
    });

    const fullTasksByTaskGroupId = groupBy(fullTasks, 'task_group_id');

    const structure = chapters.map((chapter) => ({
        ...chapter,
        topics: (topicsByChapterId.get(chapter.chapter_id) || [])
            .map((topic) => ({
                ...topic,
                lessons: (lessonsByTopicId.get(topic.topic_id) || [])
                    .map((lesson) => {
                        const groupForLesson = taskGroupsByLessonId.get(lesson.lesson_id);

                        return {
                            ...lesson,
                            video: videosByLessonId.get(lesson.lesson_id),
                            tasks: groupForLesson ? fullTasksByTaskGroupId.get(groupForLesson.task_group_id) || [] : [],
                            task_group_id: groupForLesson?.task_group_id || null,
                        };
                    }),
            })),
    }));

    return {
        course: courses[0],
        owned: isOwned,
        structure,
        user_info: ownershipData ? { userId, owned_at: ownershipData.owned_at } : null,
    };
}
