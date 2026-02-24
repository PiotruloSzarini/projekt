import LessonSelect from "@/app/dashboard/components/LessonComponents/LessonSelect/LessonSelect";
import LessonTask from "@/app/dashboard/components/LessonComponents/LessonTasks/LessonTasks";
import LessonTaskChild from "@/app/dashboard/components/LessonComponents/LessonTasksChild/LessonTasksChild";

export default function lesson_components() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <LessonSelect count="1" active={true} backgroundColor="#1180F6" fontColor="#FEFFFF" link="/dashboard/kursy" />
            <LessonSelect count="2" active={false} backgroundColor="#FFFFFF" link="/dashboard/kursy"/>
            <LessonSelect count="3" active={false} backgroundColor="#FFFFFF" link="/dashboard/kursy"/>
            
            <LessonTask 
                title="Współczynnik liczbowy" 
                active={true} 
                hasActiveChild={true}
                backgroundColor="#1180F6" 
                fontColor="#FEFFFF" 
                link="/dashboard/kursy"
            >
                <LessonTaskChild title="Zadania" active={true} backgroundColor="#1180F6" fontColor="#FEFFFF" link="/dashboard/kursy"/>
            </LessonTask>

            <LessonTask 
                title="Potęgi o wykładnikach naturalnych" 
                active={false} 
                hasActiveChild={false} 
                backgroundColor="#FFFFFF" 
                fontColor="#032327" 
                link="/dashboard/kursy"
            >
                <LessonTaskChild title="Zadania" active={false} backgroundColor="#FFFFFF" fontColor="#032327" link="/dashboard/kursy"/>
            </LessonTask>
        </div>
    );
}