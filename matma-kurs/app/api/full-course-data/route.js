import { NextResponse } from 'next/server';
import pool from '../../lib/db';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
        return NextResponse.json({ error: "Brak ID kursu" }, { status: 400 });
    }

    try {
        const [
            [courses], [chapters], [topics], [lessons], [videos],
            [tasks], [taskTypes], [taskGroups],
            [mcQuestions], [mcAnswers],
            [siData],
            [matchingPairs], [matchingItems],
            [sbsData], [sbsSteps]
        ] = await Promise.all([
            pool.execute('SELECT * FROM courses WHERE course_id = ?', [courseId]),
            pool.execute('SELECT * FROM chapters WHERE course_id = ? ORDER BY chapter_id ASC', [courseId]),
            pool.execute('SELECT * FROM topics ORDER BY sort_order ASC'),
            pool.execute('SELECT * FROM lessons ORDER BY lesson_id ASC'),
            pool.execute('SELECT * FROM videos ORDER BY video_id ASC'),
            pool.execute('SELECT * FROM tasks ORDER BY task_id ASC'),
            pool.execute('SELECT * FROM task_types ORDER BY task_type_id ASC'),
            pool.execute('SELECT * FROM task_groups ORDER BY task_group_id ASC'),
            pool.execute('SELECT * FROM task_multiple_choice'),
            pool.execute('SELECT * FROM task_multiple_choice_answers ORDER BY sort_order ASC'),
            pool.execute('SELECT * FROM task_single_input'),
            pool.execute('SELECT * FROM task_matching_pairs'),
            pool.execute('SELECT * FROM task_matching_pairs_items ORDER BY sort_order ASC'),
            pool.execute('SELECT * FROM task_step_by_step'),
            pool.execute('SELECT * FROM task_step_by_step_steps ORDER BY sort_order ASC')
        ]);


        const fullTasks = tasks.map(task => {
            const type = taskTypes.find(t => t.task_type_id === task.task_type_id)?.task_type_code;
            
            let details = {};
            if (type === 'MULTIPLE_CHOICE') {
                const mc = mcQuestions.find(q => q.task_id === task.task_id);
                details = {
                    answers: mcAnswers.filter(a => a.task_multiple_id === mc?.task_multiple_id)
                };
            } else if (type === 'SINGLE_INPUT') {
                details = siData.find(si => si.task_id === task.task_id) || {};
            } else if (type === 'MATCHING') {
                const mp = matchingPairs.find(p => p.task_id === task.task_id);
                details = {
                    items: matchingItems.filter(i => i.task_pair_id === mp?.task_pair_id)
                };
            } else if (type === 'STEP_BY_STEP') {
                const sbs = sbsData.find(s => s.task_id === task.task_id);
                details = {
                    steps: sbsSteps.filter(st => st.task_step_by_step_id === sbs?.task_step_by_step_id)
                };
            }

            return { ...task, type, details };
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
                        tasks: groupForLesson 
                            ? fullTasks.filter(t => t.task_group_id === groupForLesson.task_group_id)
                            : [],
                        task_group_id: groupForLesson?.task_group_id || null
                    };
                })
        }))
    }));

        return NextResponse.json({
            course: courses[0],
            structure: structure
        });

    } catch (error) {
        console.error("Błąd preloadu:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}