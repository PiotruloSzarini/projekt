// app/context/CourseContext.js
'use client';
import { createContext, useContext, useState, useCallback, useRef } from 'react';

const CourseContext = createContext();

export function CourseProvider({ children, initialUserId }) {
    const [userId] = useState(initialUserId);
    const [fullCourseData, setFullCourseData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lastLoadedId, setLastLoadedId] = useState(null);
    
    const isLoadingRef = useRef(false);

    const preloadCourse = useCallback(async (courseId) => {
        if (isLoadingRef.current || lastLoadedId === courseId || !userId) return;

        isLoadingRef.current = true;
        setLoading(true);
        
        try {
            const res = await fetch(`/api/full-course-data?courseId=${courseId}&userId=${userId}`);
            
            if (res.status === 403) {
                console.error("Brak uprawnień do tego kursu (403)");
                setLastLoadedId(courseId); 
                return;
            }

            if (!res.ok) throw new Error("Błąd pobierania");

            const data = await res.json();
            setFullCourseData(data);
            setLastLoadedId(courseId);
        } catch (err) {
            console.error(err);
        } finally {
            isLoadingRef.current = false;
            setLoading(false);
        }
    }, [lastLoadedId, userId]);

    return (
        <CourseContext.Provider value={{ 
            userId,
            fullCourseData, 
            preloadCourse,
            loading 
        }}>
            {children}
        </CourseContext.Provider>
    );
}

export const useCourseData = () => useContext(CourseContext);