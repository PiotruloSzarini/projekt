// app/context/CourseContext.js
'use client';
import { createContext, useContext, useState, useCallback, useRef } from 'react';

const CourseContext = createContext();

export function CourseProvider({ children, initialUserId }) {
    // userId może być null/undefined dla gościa - i to jest OK
    const [userId] = useState(initialUserId);
    const [fullCourseData, setFullCourseData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lastLoadedId, setLastLoadedId] = useState(null);
    
    const isLoadingRef = useRef(false);

    const preloadCourse = useCallback(async (courseId) => {
        // Blokada: nie pobieraj, jeśli już trwa ładowanie lub ten kurs jest już w pamięci
        if (isLoadingRef.current || lastLoadedId === courseId) return;

        isLoadingRef.current = true;
        setLoading(true);
        
        try {
            // userId || '' zapewnia, że do API poleci pusty string zamiast słowa "undefined"
            const res = await fetch(`/api/full-course-data?courseId=${courseId}&userId=${userId || ''}`);
            
            // Jeśli backend mimo wszystko rzuciłby 403 (choć w nowym API go usunęliśmy)
            if (res.status === 403) {
                console.warn("Dostęp ograniczony (403) - widok podglądu");
                // Nie robimy 'return', pozwalamy spróbować sparsować to, co przyszło
            }

            if (!res.ok) throw new Error(`Błąd serwera: ${res.status}`);

            const data = await res.json();
            
            setFullCourseData(data);
            setLastLoadedId(courseId);
        } catch (err) {
            console.error("Course Context Error:", err);
            // W razie błędu czyścimy dane, żeby nie pokazywać starych z innego kursu
            setFullCourseData(null);
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
            loading,
            // Opcjonalnie dodajemy funkcję do czyszczenia keszu przy wylogowaniu
            clearCourseData: () => { setFullCourseData(null); setLastLoadedId(null); }
        }}>
            {children}
        </CourseContext.Provider>
    );
}

export const useCourseData = () => useContext(CourseContext);