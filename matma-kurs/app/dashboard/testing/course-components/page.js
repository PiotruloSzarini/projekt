import CourseCard from "../../components/CourseCard/CourseCard";


export default function course_components() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <CourseCard title="Matura Podstawowa" backgroundColor="#1180F6" tasksCount={67} videosCount={69} progress={50} owned={true} />
            <CourseCard title="Matura Podstawowa" backgroundColor="#00A67E" tasksCount={67} videosCount={69} progress={50} owned={true} />
            <CourseCard title="Matura Podstawowa" backgroundColor="#5E169B" tasksCount={67} videosCount={69} progress={50} owned={false} />
        </div>
    );
}