import LessonSelect from "@/app/dashboard/components/LessonComponents/LessonSelect/LessonSelect";


export default function lesson_components() {
    return (
        <div>
            <LessonSelect count="1" active={true} backgroundColor="#1180F6" fontColor="#FEFFFF" link="/dashboard/kursy" />
            <LessonSelect count="2" active={false} backgroundColor="#FFFFFF" link="/dashboard/kursy"/>
            <LessonSelect count="3" active={false} backgroundColor="#FFFFFF" link="/dashboard/kursy"/>
        </div>
    );
}