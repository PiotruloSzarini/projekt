import { NextResponse } from 'next/server';
import pool from '../../lib/db';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const userId = searchParams.get('userId'); // Pobieramy userId przekazany z kontekstu

    if (!courseId || !userId) {
        return NextResponse.json({ error: "Brak ID kursu lub ID użytkownika" }, { status: 400 });
    }

    try {
        // --- KROK 1: Sprawdzenie uprawnień (Weryfikacja w user_courses) ---
        const [userAccess] = await pool.execute(
            'SELECT * FROM user_courses WHERE user_id = ? AND course_id = ?',
            [userId, courseId]
        );

        if (userAccess.length === 0) {
            return NextResponse.json({ 
                error: "Brak dostępu do tego kursu. Musisz go najpierw aktywować." 
            }, { status: 403 });
        }

        // --- KROK 2: Pobieranie danych (Zoptymalizowane pod konkretny kurs) ---
        // Zamiast pobierać wszystko (SELECT * FROM topics), filtrujemy po courseId tam, gdzie się da.
        const [
            [courses], [chapters], [topics], [lessons], [videos],
            [tasks], [taskTypes], [taskGroups],
            [mcQuestions], [mcAnswers],
            [siData],
            [matchingPairs], [matchingItems],
            [sbsData], [sbsSteps],
            [explanations], [explanationSteps], [hints] 
        ] = await Promise.all([
            pool.execute('SELECT * FROM courses WHERE course_id = ?', [courseId]),
            pool.execute('SELECT * FROM chapters WHERE course_id = ? ORDER BY chapter_id ASC', [courseId]),
            // Pobieramy tematy tylko dla rozdziałów tego kursu
            pool.execute('SELECT * FROM topics WHERE chapter_id IN (SELECT chapter_id FROM chapters WHERE course_id = ?) ORDER BY sort_order ASC', [courseId]),
            // Pobieramy lekcje tylko dla tematów tego kursu
            pool.execute(`
                SELECT l.* FROM lessons l 
                JOIN topics t ON l.topic_id = t.topic_id 
                JOIN chapters c ON t.chapter_id = c.chapter_id 
                WHERE c.course_id = ?`, [courseId]),
            // Wideo, zadania itd.
            pool.execute('SELECT * FROM videos'),
            pool.execute('SELECT * FROM tasks'),
            pool.execute('SELECT * FROM task_types'),
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

        // --- KROK 3: Mapowanie zadań (Twoja istniejąca logika) ---
        const fullTasks = tasks.map(task => {
            let details = {};
            
            switch (task.task_type_id) {
                case 1: // MULTIPLE_CHOICE
                    const mc = mcQuestions.find(q => q.task_id === task.task_id);
                    if (mc) {
                        details.answers = mcAnswers.filter(a => a.task_multiple_id === mc.task_multiple_id);
                    }
                    break;
                case 2: // SINGLE_INPUT
                    const si = siData.find(si => si.task_id === task.task_id);
                    if (si) {
                        details.correct_value = si.correct_value;
                    }
                    break;
                case 3: // MATCHING
                    const mp = matchingPairs.find(p => p.task_id === task.task_id);
                    if (mp) {
                        details.items = matchingItems.filter(i => i.task_pair_id === mp.task_pair_id);
                    }
                    break;
                case 4: // STEP_BY_STEP
                    const sbs = sbsData.find(s => s.task_id === task.task_id);
                    if (sbs) {
                        details.steps = sbsSteps.filter(st => st.task_step_by_step_id === sbs.task_step_by_step_id);
                    }
                    break;
            }

            const explanationHeader = explanations.find(e => e.task_id === task.task_id);
            if (explanationHeader) {
                details.explanation = {
                    ...explanationHeader,
                    steps: explanationSteps.filter(es => es.explanation_id === explanationHeader.explanation_id)
                };
            } else {
                details.explanation = null;
            }

            details.hints = hints.filter(h => h.task_id === task.task_id);
            return { ...task, details }; 
        });

        // --- KROK 4: Budowanie struktury (Twoja istniejąca logika) ---
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

        // --- KROK 5: Zwracanie danych ---
        return NextResponse.json({
            course: courses[0],
            structure: structure,
            user_info: { userId, owned_at: userAccess[0].owned_at } // Dodatkowe info o dostępie
        });

    } catch (error) {
        console.error("Błąd preloadu:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}