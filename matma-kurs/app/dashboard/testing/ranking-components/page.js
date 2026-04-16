import RankingWeeklyPoints from "../../components/RankingComponents/RankingWeeklyPoints/RankingWeeklyPoints";
import RankingFinishedWeeklyTasks from "../../components/RankingComponents/RankingFinishedWeeklyTasks/RankingFinishedWeeklyTasks";
import RankingTimer from "../../components/RankingComponents/RankingTimer/RankingTimer";
import RankingUserCard from "../../components/RankingComponents/RankingUserCard/RankingUserCard";


export default function ranking_components() {
    return (
        <div style={{ display: 'flex',flexDirection: 'column', gap: '20px', padding: '16px'}}>
            <RankingWeeklyPoints points={1445} />
            <RankingFinishedWeeklyTasks task_number={24} />
            <RankingTimer datetime="2026-05-16T23:59:59" />
            <RankingUserCard
                icon="/assets/img/topbar/user-icon.svg"
                name="Tomash Problem"
                nick="@TomProb1"
                points={3845}
                tasks={64}
                daily_challange={31}
                isFirst={true}
            />
            <RankingUserCard
                icon="/assets/img/topbar/user-icon.svg"
                name="Marcinek Debilek"
                nick="@Milosniktuska1337"
                points={2985}
                tasks={56}
                daily_challange={31}
                isFirst={false}
            />
        </div>
    );
}