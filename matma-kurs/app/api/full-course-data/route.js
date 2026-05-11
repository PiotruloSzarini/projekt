import { NextResponse } from 'next/server';
import pool from '../../lib/db';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const userId = searchParams.get('userId');

    if (!courseId) {
        return NextResponse.json({ error: "Brak ID kursu" }, { status: 400 });
    }

    try {
        let isOwned = false;
        let ownershipData = null;

        if (userId && userId !== 'null' && userId !== 'undefined') {
            const [userAccess] = await pool.execute(
                'SELECT * FROM user_courses WHERE user_id = ? AND course_id = ?',
                [userId, courseId]
            );
            if (userAccess.length > 0) {
                isOwned = true;
                ownershipData = userAccess[0];
            }
        }

        const [
            [courses], [chapters], [topics], [lessons], [videos],
            [tasks], [taskGroups],
            [mcQuestions], [mcAnswers],
            [siData],
            [matchingPairs], [matchingItems],
            [sbsData], [sbsSteps],
            [explanations], [explanationSteps], [hints] 
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
            pool.execute(`SELECT ts.* FROM tasks ts JOIN task_groups tg ON ts.task_group_id = tg.task_group_id JOIN lessons l ON tg.lesson_id = l.lesson_id JOIN topics t ON l.topic_id = t.topic_id JOIN chapters c ON t.chapter_id = c.chapter_id WHERE c.course_id = ?`, [courseId]),
            pool.execute('SELECT * FROM task_groups'),
            pool.execute('SELECT * FROM task_multiple_choice'),
            pool.execute('SELECT * FROM task_multiple_choice_answers'),
            pool.execute('SELECT * FROM task_single_input'),
            pool.execute('SELECT * FROM task_matching_pairs'),
            pool.execute('SELECT * FROM task_matching_pairs_items'),
            pool.execute('SELECT * FROM task_step_by_step'),
            pool.execute('SELECT * FROM task_step_by_step_steps'),
            pool.execute('SELECT * FROM task_explanation'),
            pool.execute('SELECT * FROM task_explanation_steps'),
            pool.execute('SELECT * FROM task_hints')
        ]);

        const fullTasks = tasks.map(task => {
            let details = {};
            switch (task.task_type_id) {
                case 1: // MULTIPLE_CHOICE
                    const mc = mcQuestions.find(q => q.task_id === task.task_id);
                    if (mc) details.answers = mcAnswers.filter(a => a.task_multiple_id === mc.task_multiple_id);
                    break;
                case 2: // SINGLE_INPUT
                    const si = siData.find(si => si.task_id === task.task_id);
                    if (si) details.correct_value = si.correct_value;
                    break;
                case 3: // MATCHING
                    const mp = matchingPairs.find(p => p.task_id === task.task_id);
                    if (mp) details.items = matchingItems.filter(i => i.task_pair_id === mp.task_pair_id);
                    break;
                case 4: // STEP_BY_STEP
                    const sbs = sbsData.find(s => s.task_id === task.task_id);
                    if (sbs) details.steps = sbsSteps.filter(st => st.task_step_by_step_id === sbs.task_step_by_step_id);
                    break;
            }
            const explanationHeader = explanations.find(e => e.task_id === task.task_id);
            details.explanation = explanationHeader ? { ...explanationHeader, steps: explanationSteps.filter(es => es.explanation_id === explanationHeader.explanation_id) } : null;
            details.hints = hints.filter(h => h.task_id === task.task_id);
            return { ...task, details }; 
        });

        const structure = chapters.map(chapter => ({
            ...chapter,
            topics: topics
                .filter(topic => topic.chapter_id === chapter.chapter_id)
                .map(topic => ({
                    ...topic,
                    lessons: lessons
                        .filter(lesson => lesson.topic_id === topic.topic_id)
                        .map(lesson => {
                            const groupForLesson = taskGroups.find(tg => tg.lesson_id === lesson.lesson_id);
                            return {
                                ...lesson,
                                video: videos.find(v => v.lesson_id === lesson.lesson_id),
                                tasks: groupForLesson ? fullTasks.filter(t => t.task_group_id === groupForLesson.task_group_id) : [],
                                task_group_id: groupForLesson?.task_group_id || null
                            };
                        })
                }))
        }));

        return NextResponse.json({
            course: courses[0],
            owned: isOwned,
            structure: structure,
            user_info: ownershipData ? { userId, owned_at: ownershipData.owned_at } : null
        });

    } catch (error) {
        console.error("Błąd preloadu:", error);
        return NextResponse.json({ error: "Błąd serwera podczas pobierania danych" }, { status: 500 });
    }
}