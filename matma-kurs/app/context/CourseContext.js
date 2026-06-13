'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';

const CourseContext = createContext();

export function CourseProvider({ children, initialUserId, initialUserRole }) {
    const [userId] = useState(initialUserId);
    const [userRole] = useState(initialUserRole || 'user');
    const isAdmin = userRole === 'admin';
    const [fullCourseData, setFullCourseData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lastLoadedId, setLastLoadedId] = useState(null);

    const isLoadingRef = useRef(false);

    const preloadCourse = useCallback(async (courseId) => {
        if (isLoadingRef.current || lastLoadedId === courseId) return;

        isLoadingRef.current = true;
        setLoading(true);

        try {
            const res = await fetch(`/api/full-course-data?courseId=${courseId}&userId=${userId || ''}`);

            if (res.status === 403) {
                console.warn('Dostęp ograniczony (403) - widok podglądu');
            }

            if (!res.ok) throw new Error(`Błąd serwera: ${res.status}`);

            const data = await res.json();

            setFullCourseData(data);
            setLastLoadedId(courseId);
        } catch (err) {
            console.error('Course Context Error:', err);
            setFullCourseData(null);
        } finally {
            isLoadingRef.current = false;
            setLoading(false);
        }
    }, [lastLoadedId, userId]);

    return (
        <CourseContext.Provider value={{
            userId,
            userRole,
            isAdmin,
            fullCourseData,
            preloadCourse,
            loading,
            clearCourseData: () => {
                setFullCourseData(null);
                setLastLoadedId(null);
            }
        }}>
            {children}
        </CourseContext.Provider>
    );
}

export const useCourseData = () => useContext(CourseContext);
