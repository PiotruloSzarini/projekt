'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCourseData } from '@/app/context/CourseContext'; // Nasz nowy magazyn
import LessonSelect from '@/app/dashboard/components/LessonComponents/LessonSelect/LessonSelect';
import LessonTask from '@/app/dashboard/components/LessonComponents/LessonTasks/LessonTasks';
import LessonTaskChild from '@/app/dashboard/components/LessonComponents/LessonTasksChild/LessonTasksChild';
import TaskView from '@/app/dashboard/components/TasksComponents/TaskView/TaskView';
import style from './page.module.css';

export default function TopicLessonsPage() {
  const { courseSlug, chapterSlug, topicSlug } = useParams();
  const router = useRouter();
  const { fullCourseData, loading } = useCourseData();
  const [activeContent, setActiveContent] = useState(null);

  useEffect(() => {
    if (!fullCourseData && !loading) {
    }
  }, [fullCourseData, loading]);

  const course = fullCourseData?.course;
  const chapter = fullCourseData?.structure?.find(c => c.slug === chapterSlug);
  const allTopicsInChapter = chapter?.topics || [];
  const currentTopic = allTopicsInChapter.find(t => t.slug === topicSlug);
  const lessonsInTopic = currentTopic?.lessons || [];

  useEffect(() => {
    if (lessonsInTopic.length > 0 && !activeContent) {
      const firstLesson = lessonsInTopic[0];
      if (firstLesson.video) {
        setActiveContent({ 
            type: 'video', 
            id: firstLesson.video.video_id, 
            data: firstLesson.video 
        });
      }
    }
  }, [lessonsInTopic, activeContent]);

  if (loading || !fullCourseData) return <p>Synchronizacja lekcji...</p>;
  if (!currentTopic) return <p>Nie znaleziono tematu.</p>;

  return (
    <div className={style.main_container}>
      {/* Pasek wyboru tematu (Góra) */}
      <div className={style.lessonSelect_conatiner}>
        {allTopicsInChapter.map((topic, index) => (
          <div key={topic.topic_id} onClick={() => router.push(`/dashboard/kursy/${courseSlug}/${chapterSlug}/${topic.slug}`)}>
            <LessonSelect 
              count={index + 1} 
              active={topic.slug === topicSlug} 
              backgroundColor={topic.slug === topicSlug ? course.color : "#FFFFFF"} 
              fontColor={topic.slug === topicSlug ? "#FEFFFF" : "#032327"}
              link={`/dashboard/kursy/${courseSlug}/${chapterSlug}/${topic.slug}`}
            />
          </div>
        ))}
      </div>

      <div className={style.topic_title_container} style={{ backgroundColor: course.color, marginBottom: '16px' }}>
        <h1>{currentTopic.title}</h1>
      </div>

      <div className={style.lesson_content_container}>
        {/* Lewa kolumna: Lista lekcji (Wideo i Zadania) */}
        <div className={style.lesson_content_container_select}>
          {lessonsInTopic.map((lesson) => {
            const video = lesson.video;
            const tasks = lesson.tasks; // Zadania są już w lekcji dzięki SQL!
            
            const isVideoActive = activeContent?.type === 'video' && activeContent?.id === video?.video_id;
            const isTasksActive = activeContent?.type === 'task' && activeContent?.parentId === video?.video_id;

            return (
              <div key={lesson.lesson_id} className={style.lesson_wrapper}>
                {video && (
                  <div className={style.lesson_video_wrapper}>
                    <div onClick={() => setActiveContent({ type: 'video', id: video.video_id, data: video })}>
                      <LessonTask
                        title={video.title}
                        active={isVideoActive || isTasksActive} 
                        hasActiveChild={isTasksActive}
                        backgroundColor={course.color}
                        fontColor="#FEFFFF"
                        link="#"
                      >
                        {/* Jeśli lekcja ma zadania, pokaż przycisk "Zadania" */}
                        {tasks && tasks.length > 0 && (
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveContent({ 
                                type: 'task', 
                                id: lesson.task_group_id, // Używamy ID grupy zadań
                                parentId: video.video_id,
                                tasks: tasks // Przekazujemy gotowe zadania!
                              });
                            }} 
                            style={{ width: '100%', userSelect: 'none' }}
                          >
                            <LessonTaskChild
                              title="Zadania"
                              active={isTasksActive}
                              backgroundColor={course.color}
                              fontColor="#FEFFFF"
                              link="#"
                            />
                          </div>
                        )}
                      </LessonTask>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Prawa kolumna: Player lub Zadania */}
        <div className={style.lesson_content_container_children}>
          {activeContent?.type === 'video' && (
            <div className={style.video_player_container}>
              <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#000', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <p>Wideo: {activeContent.data.title}</p>
              </div>
              {activeContent.data?.text && <p style={{ marginTop: '20px' }}>{activeContent.data.text}</p>}
            </div>
          )}

          {activeContent?.type === 'task' && (
            <TaskView 
                tasks={activeContent.tasks} // PRZEKAZUJEMY GOTOWE DANE
                courseColor={course.color} 
            />
          )}

          {!activeContent && <p>Wybierz materiał z listy po lewej.</p>}
        </div>
      </div>
    </div>
  );
}