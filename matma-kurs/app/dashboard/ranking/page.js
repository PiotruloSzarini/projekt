import styles from './page.module.css';
import RankingWeeklyPoints from '../components/RankingComponents/RankingWeeklyPoints/RankingWeeklyPoints';
import RankingFinishedWeeklyTasks from '../components/RankingComponents/RankingFinishedWeeklyTasks/RankingFinishedWeeklyTasks';
import RankingTimer from '../components/RankingComponents/RankingTimer/RankingTimer';
import RankingUserCard from '../components/RankingComponents/RankingUserCard/RankingUserCard';

const topUsers = [
    {
        icon: '/assets/img/topbar/user-icon.svg',
        name: 'Tomash Problem',
        nick: '@TomProb1',
        points: 3845,
        tasks: 64,
        daily_challange: 31,
        isFirst: true,
    },
    {
        icon: '/assets/img/topbar/user-icon.svg',
        name: 'Anna Kucyk',
        nick: '@KochamWlosy',
        points: 3212,
        tasks: 60,
        daily_challange: 30,
        isFirst: false,
    },
    {
        icon: '/assets/img/topbar/user-icon.svg',
        name: 'Marcinek D.',
        nick: '@Milosniktuska1337',
        points: 2985,
        tasks: 56,
        daily_challange: 31,
        isFirst: false,
    },
];

const rankingRows = [
    { id: 1, name: 'KapisziXD', points: 26 },
    { id: 2, name: 'KapisziXD', points: 26 },
    { id: 3, name: 'KapisziXD', points: 26 },
    { id: 4, name: 'Alexssssandra', points: 27, active: true },
    { id: 5, name: 'BenjaminBaumann9/11', points: 28 },
    { id: 6, name: 'BenjaminBaumann9/11', points: 28 },
    { id: 7, name: 'BenjaminBaumann9/11', points: 28 },
    { id: 8, name: 'BenjaminBaumann9/11', points: 28 },
];

export default function RankingPage() {
    return (
        <div className={styles.ranking_page}>
            <section className={styles.summary_row}>
                <RankingWeeklyPoints points={1445} />
                <RankingFinishedWeeklyTasks task_number={24} />
                <RankingTimer />
            </section>

            <section className={styles.top_section}>
                <h2 className={styles.section_title}>Top 3 uczniów w tym tygodniu:</h2>
                <div className={styles.top_cards}>
                    {topUsers.map((user) => (
                        <RankingUserCard key={user.name} {...user} />
                    ))}
                </div>
            </section>

            <section className={styles.bottom_section}>
                <div className={styles.my_ranking}>
                    <h2 className={styles.card_title}>Mój ranking:</h2>
                    <div className={styles.ranking_rows}>
                        {rankingRows.map((row) => (
                            <div
                                key={row.id}
                                className={`${styles.ranking_row} ${row.active ? styles.active_row : ''}`}
                            >
                                <span className={styles.row_avatar}></span>
                                <span className={styles.row_name}>{row.name}</span>
                                <span className={styles.row_points}>{row.points}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <aside className={styles.my_rank}>
                    <h2 className={styles.card_title}>Moja ranga:</h2>
                    <div className={styles.rank_content}>
                        <div className={styles.buggie}></div>
                        <p className={styles.rank_name}>diamentowy<br />Buggie</p>
                    </div>
                </aside>
            </section>
        </div>
    );
}
