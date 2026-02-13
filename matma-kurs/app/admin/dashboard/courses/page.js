'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminCoursesList() {
    const [courses, setCourses] = useState([]);

    useEffect(() => {
    fetch('/api/courses') 
        .then(res => res.json())
        .then(data => setCourses(data));
    }, []);

    return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
        <h1 style={{ marginBottom: '20px' }}>Panel Administratora: Kursy</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {courses.map(course => (
            <div key={course.course_id} style={{ width: '200px', border: '1px solid black', padding: '20px' }}>
                <h2>{course.name}</h2>
                <p>ID Kursu: {course.course_id}</p>
                    <Link href={`/admin/dashboard/courses/${course.course_id}`}>
                    <button style={{ 
                        marginTop: '15px', width: '100%', padding: '10px', 
                        background: '#007bff', color: 'white', border: 'none', 
                        borderRadius: '5px', cursor: 'pointer' 
                        }}>
                        Zarządzaj
                    </button>
                    </Link>
            </div>
        ))}
        </div>
    </div>
    );
}