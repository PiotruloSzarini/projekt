import RankingWeeklyPoints from "../../components/RankingComponents/RankingWeeklyPoints/RankingWeeklyPoints";



export default function ranking_components() {
    return (
        <div style={{ display: 'flex',flexDirection: 'column', gap: '20px', padding: '16px'}}>
            <RankingWeeklyPoints points={1445} />
        </div>
    );
}