'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';
import RankingWeeklyPoints from '../components/RankingComponents/RankingWeeklyPoints/RankingWeeklyPoints';
import RankingFinishedWeeklyTasks from '../components/RankingComponents/RankingFinishedWeeklyTasks/RankingFinishedWeeklyTasks';
import RankingTimer from '../components/RankingComponents/RankingTimer/RankingTimer';
import RankingUserCard from '../components/RankingComponents/RankingUserCard/RankingUserCard';
import { useUser } from '@/app/context/UserContext';

export default function RankingPage() {
    const { userId } = useUser();
    const [loading, setLoading] = useState(true);
    const [rankingData, setRankingData] = useState({
        topUsers: [],
        rows: [],
        me: null,
        summary: { totalPoints: 0, completedLessons: 0, dailyCompleted: 0 },
    });

    useEffect(() => {
        const loadRanking = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/ranking${userId ? `?userId=${userId}` : ''}`);
                const data = await res.json();
                setRankingData({
                    topUsers: Array.isArray(data.topUsers) ? data.topUsers : [],
                    rows: Array.isArray(data.rows) ? data.rows : [],
                    me: data.me || null,
                    summary: data.summary || { totalPoints: 0, completedLessons: 0, dailyCompleted: 0 },
                });
            } catch (error) {
                console.error('Błąd pobierania rankingu:', error);
            } finally {
                setLoading(false);
            }
        };

        loadRanking();
    }, [userId]);

    if (loading) {
        return <div className={styles.loading_state}>Ładowanie rankingu...</div>;
    }

    return (
        <div className={styles.ranking_page}>
            <section className={styles.summary_row}>
                <RankingWeeklyPoints points={rankingData.summary.totalPoints} />
                <RankingFinishedWeeklyTasks task_number={rankingData.summary.completedLessons} />
                <RankingTimer />
            </section>

            <section className={styles.top_section}>
                <h2 className={styles.section_title}>Top 3 uczniów w tym tygodniu:</h2>
                <div className={styles.top_cards}>
                    {rankingData.topUsers.map((user) => (
                        <RankingUserCard key={user.name} {...user} />
                    ))}
                </div>
            </section>

            <section className={styles.bottom_section}>
                <div className={styles.my_ranking}>
                    <h2 className={styles.card_title}>Ogólny ranking:</h2>
                    <div className={styles.ranking_rows}>
                        {rankingData.rows.map((row) => (
                            <div
                                key={row.rank}
                                className={`${styles.ranking_row} ${row.active ? styles.active_row : ''}`}
                            >
                                <span className={styles.row_avatar}></span>
                                <span className={styles.row_name}>{row.name}</span>
                                <span className={styles.row_points}>{row.total_points}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <aside className={styles.my_rank}>
                    <h2 className={styles.card_title}>Moja ranga:</h2>
                    <div className={styles.rank_content}>
                        <div className={styles.buggie}></div>
                        <p className={styles.rank_name}>
                            {rankingData.me?.rank ? `pozycja ${rankingData.me.rank}` : 'brak danych'}
                        </p>
                    </div>
                    <div className={styles.rank_meta}>
                        <p><span>Zdobyte punkty</span><strong>{rankingData.summary.totalPoints}</strong></p>
                        <p><span>Ukończone lekcje</span><strong>{rankingData.summary.completedLessons}</strong></p>
                        <p><span>Daily challenge</span><strong>{rankingData.summary.dailyCompleted}</strong></p>
                    </div>
                </aside>
            </section>
        </div>
    );
}
