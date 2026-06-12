import Link from 'next/link';
import { notFound } from 'next/navigation';
import styles from './page.module.css';

const exams = {
    'egzamin-8-klasisty': {
        title: 'Egzamin 8-klasisty',
        subtitle: 'Arkusze próbne',
        solved: 1,
        total: 16,
        color: '#E34A35',
        papers: [
            { title: 'Zima 2025', slug: 'zima-2025', status: 'Rozwiązuj' },
            { title: 'Lato 2025', slug: 'lato-2025' },
            { title: 'Zima 2024', slug: 'zima-2024' },
            { title: 'Lato 2024', slug: 'lato-2024' },
            { title: 'Zima 2023', slug: 'zima-2023' },
            { title: 'Lato 2023', slug: 'lato-2023' },
            { title: 'Zima 2022', slug: 'zima-2022' },
            { title: 'Lato 2022', slug: 'lato-2022' },
            { title: 'Zima 2021', slug: 'zima-2021' },
            { title: 'Lato 2021', slug: 'lato-2021' },
            { title: 'Zima 2020', slug: 'zima-2020' },
            { title: 'Lato 2020', slug: 'lato-2020' },
            { title: 'Zima 2019', slug: 'zima-2019' },
            { title: 'Lato 2019', slug: 'lato-2019' },
        ],
    },
    'matura-podstawowa': {
        title: 'Matura Podstawowa',
        subtitle: 'Arkusze próbne',
        solved: 0,
        total: 24,
        color: '#1684F2',
        papers: [
            { title: 'Maj 2026', slug: 'maj-2026', status: 'Rozwiązuj' },
            { title: 'Sierpień 2026', slug: 'sierpien-2026' },
            { title: 'Maj 2025', slug: 'maj-2025' },
            { title: 'Sierpień 2025', slug: 'sierpien-2025' },
            { title: 'Maj 2024', slug: 'maj-2024' },
            { title: 'Sierpień 2024', slug: 'sierpien-2024' },
            { title: 'Maj 2023', slug: 'maj-2023' },
            { title: 'Sierpień 2023', slug: 'sierpien-2023' },
            { title: 'Maj 2022', slug: 'maj-2022' },
            { title: 'Sierpień 2022', slug: 'sierpien-2022' },
            { title: 'Maj 2021', slug: 'maj-2021' },
            { title: 'Sierpień 2021', slug: 'sierpien-2021' },
        ],
    },
    'matura-rozszerzona': {
        title: 'Matura Rozszerzona',
        subtitle: 'Arkusze próbne',
        solved: 0,
        total: 32,
        color: '#0CAA7C',
        papers: [
            { title: 'Maj 2026', slug: 'maj-2026', status: 'Rozwiązuj' },
            { title: 'Sierpień 2026', slug: 'sierpien-2026' },
            { title: 'Maj 2025', slug: 'maj-2025' },
            { title: 'Sierpień 2025', slug: 'sierpien-2025' },
            { title: 'Maj 2024', slug: 'maj-2024' },
            { title: 'Sierpień 2024', slug: 'sierpien-2024' },
            { title: 'Maj 2023', slug: 'maj-2023' },
            { title: 'Sierpień 2023', slug: 'sierpien-2023' },
            { title: 'Maj 2022', slug: 'maj-2022' },
            { title: 'Sierpień 2022', slug: 'sierpien-2022' },
            { title: 'Maj 2021', slug: 'maj-2021' },
            { title: 'Sierpień 2021', slug: 'sierpien-2021' },
        ],
    },
};

export default async function ExamPapersPage({ params }) {
    const { examSlug } = await params;
    const exam = exams[examSlug];

    if (!exam) {
        notFound();
    }

    return (
        <div className={styles.page}>
            <section className={styles.exam_panel}>
                <header className={styles.exam_header} style={{ backgroundColor: exam.color }}>
                    <div>
                        <h1>{exam.title}</h1>
                        <p>{exam.subtitle}</p>
                    </div>
                    <strong>{exam.solved}/{exam.total}</strong>
                </header>

                <div className={styles.paper_grid}>
                    {exam.papers.map((paper, index) => {
                        const card = (
                            <article
                                className={`${styles.paper_card} ${index === 0 ? styles.active_card : ''}`}
                                style={index === 0 ? { backgroundColor: exam.color } : undefined}
                            >
                                <h2>{paper.title}</h2>
                                {paper.status && <p>{paper.status}</p>}
                            </article>
                        );

                        if (index !== 0) {
                            return <div key={paper.slug}>{card}</div>;
                        }

                        return (
                            <Link
                                key={paper.slug}
                                href={`/dashboard/egzaminy/${examSlug}/${paper.slug}`}
                                className={styles.paper_link}
                            >
                                {card}
                            </Link>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
