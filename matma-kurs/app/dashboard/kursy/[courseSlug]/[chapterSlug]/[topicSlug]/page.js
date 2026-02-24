'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCourseNavigation } from '@/app/hooks/useCourseNavigation';
import LessonSelect from '@/app/dashboard/components/LessonComponents/LessonSelect/LessonSelect';
import LessonTask from '@/app/dashboard/components/LessonComponents/LessonTasks/LessonTasks';
import LessonTaskChild from '@/app/dashboard/components/LessonComponents/LessonTasksChild/LessonTasksChild';
import TaskView from '@/app/dashboard/components/TasksComponents/TaskView/TaskView'; // Importujemy wydzielony komponent zadań
import style from './page.module.css';

export default function TopicLessonsPage() {
  const { courseSlug, chapterSlug, topicSlug } = useParams();
  const router = useRouter();

  const [activeContent, setActiveContent] = useState(null);

  const {
    getCourseBySlug,
    getChapterBySlug,
    getTopicsByChapterId,
    getLessonsByTopicId,
    getVideosByLessonId,
    getTaskGroupsByLessonId
  } = useCourseNavigation();

  const course = getCourseBySlug(courseSlug);
  const chapter = course ? getChapterBySlug(course.course_id, chapterSlug) : null;
  const allTopicsInChapter = chapter ? getTopicsByChapterId(chapter.chapter_id) : [];
  const currentTopic = allTopicsInChapter.find(t => t.slug === topicSlug);
  const lessonsInTopic = currentTopic ? getLessonsByTopicId(currentTopic.topic_id) : [];

  useEffect(() => {
    if (lessonsInTopic.length > 0 && !activeContent) {
      const firstLessonVideos = getVideosByLessonId(lessonsInTopic[0].lesson_id);
      if (firstLessonVideos.length > 0) {
        setActiveContent({ type: 'video', id: firstLessonVideos[0].video_id, data: firstLessonVideos[0] });
      }
    }
  }, [lessonsInTopic]);

  if (!course || !chapter || !currentTopic) return <p>Ładowanie danych...</p>;

  return (
    <div className={style.main_container}>
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
        <div className={style.lesson_content_container_select}>
          {lessonsInTopic.map((lesson) => {
            const videos = getVideosByLessonId(lesson.lesson_id);
            const taskGroups = getTaskGroupsByLessonId(lesson.lesson_id);
            return (
              <div key={lesson.lesson_id} className={style.lesson_wrapper}>
                {videos.sort((a, b) => a.sort_order - b.sort_order).map((video, vIndex) => {
                  const relatedTaskGroup = taskGroups[vIndex];
                  const isVideoActive = activeContent?.type === 'video' && activeContent?.id === video.video_id;
                  const isChildTaskActive = activeContent?.type === 'task' && activeContent?.parentId === video.video_id;
                  return (
                    <div key={video.video_id} className={style.lesson_video_wrapper}>
                      <div onClick={() => setActiveContent({ type: 'video', id: video.video_id, data: video })}>
                        <LessonTask
                          title={video.title}
                          active={isVideoActive || isChildTaskActive} 
                          hasActiveChild={isChildTaskActive}
                          backgroundColor={course.color}
                          fontColor="#FEFFFF"
                          link="#"
                        >
                          {relatedTaskGroup && (
                            <div 
                              onClick={(e) => {
                                e.stopPropagation(); 
                                setActiveContent({ 
                                  type: 'task', 
                                  id: relatedTaskGroup.task_group_id, 
                                  parentId: video.video_id 
                                });
                              }} 
                              style={{ width: '100%', userSelect: 'none' }}
                            >
                              <LessonTaskChild
                                title="Zadania"
                                active={isChildTaskActive}
                                backgroundColor={course.color}
                                fontColor="#FEFFFF"
                                link="#"
                              />
                            </div>
                          )}
                        </LessonTask>
                      </div>
                    </div>
                  );
                  })}
              </div>
            );
          })}
        </div>

        <div className={style.lesson_content_container_children}>
          {activeContent?.type === 'video' && (
            <div className={style.video_player_container}>
              <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#000', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <p>Odtwarzacz Wideo dla ID: {activeContent.id}</p>
                  {/* Przykład: <iframe src={activeContent.data.url} ... /> TO JEST DO OGARNIECIA BO CHUJ WIE JAK TO ZROBIC*/}
              </div>
              {activeContent.data?.text && <p style={{ marginTop: '20px' }}>{activeContent.data.text}</p>}
            </div>
          )}

          {activeContent?.type === 'task' && (
            <TaskView taskGroupId={activeContent.id} courseColor={course.color} />
          )}

          {!activeContent && <p>Wybierz materiał z listy po lewej.</p>}
        </div>
      </div>
    </div>
  );
}