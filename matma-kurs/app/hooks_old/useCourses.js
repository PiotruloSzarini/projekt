import courses from "@/dane/mock_dane/courses.json";

export function useCourses() {

    const getAllCourses = () => courses;

    const getCourseBySlug = (slug) => {
        return courses.find(course => course.slug === slug);
    }
    const getCourseById = (id) => {
        return courses.find(course => course.courseId === id);
    }
    return {
        getAllCourses,
        getCourseBySlug,
        getCourseById
    }
}