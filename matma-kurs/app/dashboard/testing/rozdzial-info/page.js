import RozdzialInfo from "@/app/dashboard/components/RozdzialInfo/RozdzialInfo";
import ChapterCard from "../../components/ChapterCard/ChapterCard";

export default function rozdzial_info() {
    return (
        <div>
            <RozdzialInfo courseName="Matura Podstawowa" progress={75} link="/dashboard/kursy/" backgroundColor="#1180F6"/>
            <ChapterCard count="1" title="Liczby rzeczywiste" backgroundColor="#1180F6" tasksCount="10" videosCount="5" progress={100} />
            <ChapterCard count="2" title="Wyrażenia algebraiczne" backgroundColor="#1180F6" tasksCount="10" videosCount="5" progress={50} />
            <ChapterCard count="3" title="Równania i nierówności" backgroundColor="#1180F6" tasksCount="10" videosCount="5" progress={25} />
        </div>
    );
}