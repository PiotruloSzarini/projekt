// app/hooks/useProgressCalculator.js
import courses from "@/dane/mock_dane/courses.json";
import chapters from "@/dane/mock_dane/chapters.json";
import topics from "@/dane/mock_dane/topics.json";
import lessons from "@/dane/mock_dane/lessons.json";
import videos from "@/dane/mock_dane/videos.json";
import tasks from "@/dane/mock_dane/tasks.json";
import { getCurrentUserId } from "@/app/lib/fakeAuth";
import { getUserData } from "@/app/lib/getUserData";

export function useProgressCalculator() {
  const userId = getCurrentUserId();
  const userData = getUserData(userId);

  // LICZY DANE DLA LEKCJI 
  const calculateLessonStats = (lesson) => {
    const lessonVideos = videos.filter(v => v.lessonId === lesson.lessonId);
    const videoCount = lessonVideos.length;

    const taskGroupIds = lesson.theory.map(t => t.taskGroupId).filter(Boolean);
    const lessonTasks = tasks.filter(t => taskGroupIds.includes(t.taskGroupId));
    const taskCount = lessonTasks.length;

    // ukończone taski
    const solvedTasks = userData.solvedTasks.filter(ut =>
      ut.solved && lessonTasks.some(t => t.taskId === ut.taskId)
    ).length;

    // obejrzane wideo
    const watchedVideos = userData.watchedVideos || [];
    const watchedCount = lessonVideos.filter(v => watchedVideos.some(wv => wv.videoId === v.videoId)).length;

    // PROGRESS
    const totalItems = taskCount + videoCount;
    const completedItems = solvedTasks + watchedCount;

    const progress = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

    return { lessonId: lesson.lessonId, videoCount, taskCount, progress };
  };

  // LICZY DANE DLA ROZDZIAŁU
  const calculateChapterStats = (chapter) => {
    const chapterTopics = topics.filter(t => t.chapterId === chapter.chapterId);
    let chapterVideos = 0;
    let chapterTasks = 0;
    let chapterProgresses = [];

    chapterTopics.forEach(topic => {
      const topicLessons = lessons.filter(l => topic.lessons.includes(l.lessonId));
      topicLessons.forEach(lesson => {
        const stats = calculateLessonStats(lesson);
        chapterVideos += stats.videoCount;
        chapterTasks += stats.taskCount;
        chapterProgresses.push(stats.progress);
      });
    });

    const progress = chapterProgresses.length
      ? Math.round(chapterProgresses.reduce((a,b)=>a+b,0)/chapterProgresses.length)
      : 0;

    return { chapterId: chapter.chapterId, videoCount: chapterVideos, taskCount: chapterTasks, progress };
  };

  // LICZY DANE DLA KURSU 
  const calculateCourseStats = (course) => {
    const courseChapters = chapters.filter(c => c.courseId === course.courseId);
    let courseVideos = 0;
    let courseTasks = 0;
    let courseProgresses = [];

    const chapterStats = courseChapters.map(chapter => {
      const stats = calculateChapterStats(chapter);
      courseVideos += stats.videoCount;
      courseTasks += stats.taskCount;
      courseProgresses.push(stats.progress);
      return stats;
    });

    const progress = courseProgresses.length
      ? Math.round(courseProgresses.reduce((a,b)=>a+b,0)/courseProgresses.length)
      : 0;

    return { courseId: course.courseId, videoCount: courseVideos, taskCount: courseTasks, progress, chapters: chapterStats };
  };

  // GENERUJEMY STATYSTYKI WSZYSTKICH KURSÓW
  const coursesStats = courses.map(course => {
    const userCourse = userData?.courses.find(c => c.courseId === course.courseId);
    const stats = calculateCourseStats(course);

    return {
      ...course,
      userState: {
        owned: Boolean(userCourse),
        progress: userCourse?.progress ?? stats.progress
      },
      stats
    };
  });

  return { coursesStats, calculateLessonStats, calculateChapterStats, calculateCourseStats };
}
