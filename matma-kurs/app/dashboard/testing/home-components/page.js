import HomeCourseCard from "../../components/HomeComponents/HomeCourseCard/HomeCourseCard";
import HomeEntryCard from "../../components/HomeComponents/HomeEntryCard/HomeEntryCard";


export default function home_components() {
    return (
        <div style={{ display: 'flex',flexDirection: 'column', gap: '16px'}}>
            <HomeCourseCard 
                title="Matura Podstawowa"
                backgroundColor="#1180F6"
                tasksCount={74}
                videosCount={223}
                progress={56}
                owned={true}
            />
            <HomeCourseCard 
                title="Egzamin 8-klasisty"
                backgroundColor="#DD4D32"
                tasksCount={48}
                videosCount={116}
                progress={0}
                owned={false}
            />
            <HomeCourseCard 
                title="Matura Rozszerzona border 2px zamiast 1px"
                backgroundColor="#00A67E"
                tasksCount={96}
                videosCount={347}
                progress={0}
                owned={false}
            />
            <HomeEntryCard name="Kacper" continueLink="/dashboard" />

            
        </div>
    );
}