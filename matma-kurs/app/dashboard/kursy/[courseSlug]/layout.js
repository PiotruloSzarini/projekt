'use client';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCourseData } from '@/app/context/CourseContext';
import { useCourseNavigation } from '@/app/hooks/useCourseNavigation';

export default function CourseLayout({ children }) {
  const { courseSlug } = useParams();
  const { preloadCourse, fullCourseData, loading } = useCourseData();
  const { getCourseBySlug } = useCourseNavigation();

  useEffect(() => {
    const course = getCourseBySlug(courseSlug);
    if (course?.course_id && !fullCourseData && !loading) {
      preloadCourse(course.course_id);
    }
  }, [courseSlug, fullCourseData, loading, getCourseBySlug, preloadCourse]);

  return <>{children}</>;
}