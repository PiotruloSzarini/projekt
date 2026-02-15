import TopicInfo from "@/app/dashboard/components/TopicInfo/TopicInfo";
import LessonCard from "@/app/dashboard/components/LessonCard/LessonCard";

export default function temat_info() {
    return (
        <div>
            <TopicInfo chapterName="Matura Podstawowa" progress={75} link="/dashboard/kursy/" backgroundColor="#1180F6">
                <LessonCard title="Lekcja 1" backgroundColor="#1180F6" progress={100} count={1} blocked={false}/>
                <LessonCard title="Lekcja 2" backgroundColor="#1180F6" progress={50} count={2} blocked={false} />
                <LessonCard title="Lekcja 3" backgroundColor="#1180F6" progress={0} count={3} blocked={true} />
            </TopicInfo>
        </div>
    );
}