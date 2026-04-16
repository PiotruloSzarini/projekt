'use client';
import { createContext, useContext, useState, useCallback } from 'react';

const CourseContext = createContext();

export function CourseProvider({ children }) {
    const [fullCourseData, setFullCourseData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lastLoadedId, setLastLoadedId] = useState(null);

    const preloadCourse = useCallback(async (courseId) => {
        if (loading || lastLoadedId === courseId) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/full-course-data?courseId=${courseId}`);
            if (!res.ok) throw new Error("Błąd");
            const data = await res.json();
            setFullCourseData(data);
            setLastLoadedId(courseId);
        } catch (err) {
            console.error(err);
            setLoading(false); // <--- WAŻNE: zatrzymaj loading nawet przy błędzie
        } finally {
            setLoading(false); // <--- WAŻNE: zawsze wyłączaj loading
        }
    }, [loading, lastLoadedId]);

    return (
        <CourseContext.Provider value={{ 
            fullCourseData, 
            preloadCourse,
            loading 
        }}>
            {children}
        </CourseContext.Provider>
    );
}

export const useCourseData = () => useContext(CourseContext);