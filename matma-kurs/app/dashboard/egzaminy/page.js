import Link from 'next/link';
import styles from './page.module.css';

const examTiles = [
    {
        title: 'Egzamin 8-klasisty',
        subtitle: 'Arkusze próbne',
        solved: 0,
        total: 16,
        color: '#E34A35',
        href: '/dashboard/egzaminy/egzamin-8-klasisty',
        active: true,
    },
    {
        title: 'Matura Podstawowa',
        subtitle: 'Arkusze próbne',
        solved: 0,
        total: 24,
        color: '#1684F2',
        href: '/dashboard/egzaminy/matura-podstawowa',
        active: true,
    },
    {
        title: 'Matura Rozszerzona',
        subtitle: 'Arkusze próbne',
        solved: 0,
        total: 32,
        color: '#0CAA7C',
        href: '/dashboard/egzaminy/matura-rozszerzona',
        active: true,
    },
];

const rankingRows = [
    { name: 'KapisziXD', points: 26 },
    { name: 'Alexssssandra', points: 27, active: true },
    { name: 'BenjaminBaumann9/11', points: 28 },
];

export default function EgzaminyPage() {
    return (
        <div className={styles.page}>
            <section className={styles.exam_list}>
                {examTiles.map((exam) => {
                    const content = (
                        <article className={styles.exam_tile} style={{ backgroundColor: exam.color }}>
                            <div>
                                <h2>{exam.title}</h2>
                                <p>{exam.subtitle}</p>
                            </div>
                            <div className={styles.tile_footer}>
                                <span>KONTYNUUJ ROZWIĄZYWANIE →</span>
                                <strong>{exam.solved}/{exam.total}</strong>
                            </div>
                        </article>
                    );

                    if (!exam.active) {
                        return <div key={exam.title}>{content}</div>;
                    }

                    return (
                        <Link key={exam.title} href={exam.href} className={styles.exam_link}>
                            {content}
                        </Link>
                    );
                })}
            </section>

            <aside className={styles.sidebar}>
                <div className={styles.calendar_card}>
                    <div className={styles.calendar_header}>
                        <button aria-label="Poprzedni miesiąc">←</button>
                        <strong>Grudzień 2025</strong>
                        <button aria-label="Następny miesiąc">→</button>
                    </div>
                    <div className={styles.calendar_grid}>
                        {['Wt', 'Śr', 'Czw', 'Pt', 'So'].map((day) => (
                            <span key={day}>{day}</span>
                        ))}
                        <b>✓</b>
                        <b>✓</b>
                        <span>26</span>
                        <span>27</span>
                        <span>28</span>
                    </div>
                    <p className={styles.calendar_result}>Moja seria: <strong>20 dni</strong></p>
                </div>

                <div className={styles.stats_card}>
                    <h3>Moje statystyki:</h3>
                    <div className={styles.buggie}></div>
                    <p className={styles.rank_name}>diamentowy Buggie!</p>
                    <div className={styles.ranking_rows}>
                        {rankingRows.map((row) => (
                            <div
                                key={row.name}
                                className={`${styles.ranking_row} ${row.active ? styles.active_row : ''}`}
                            >
                                <span className={styles.row_avatar}></span>
                                <span>{row.name}</span>
                                <strong>{row.points}</strong>
                            </div>
                        ))}
                    </div>
                    <div className={styles.stat_rows}>
                        <p><span>Obejrzane lekcje</span><strong>34</strong></p>
                        <p><span>Ukończone zadania</span><strong>21</strong></p>
                        <p><span>Rozwiązane daily challenge</span><strong>0</strong></p>
                        <p><span>Pokonane słabe punkty</span><strong>4</strong></p>
                    </div>
                </div>
            </aside>
        </div>
    );
}
