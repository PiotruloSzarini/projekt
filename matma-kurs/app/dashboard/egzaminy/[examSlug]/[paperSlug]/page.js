import Link from 'next/link';
import { notFound } from 'next/navigation';
import styles from './page.module.css';

const papers = {
    'egzamin-8-klasisty': {
        'zima-2025': {
            examTitle: 'Egzamin 8-klasisty',
            title: 'Zima 2025',
            tasksCount: 16,
            duration: '120 min',
        },
    },
    'matura-podstawowa': {
        'maj-2026': {
            examTitle: 'Matura Podstawowa',
            title: 'Maj 2026',
            tasksCount: 24,
            duration: '180 min',
        },
    },
    'matura-rozszerzona': {
        'maj-2026': {
            examTitle: 'Matura Rozszerzona',
            title: 'Maj 2026',
            tasksCount: 32,
            duration: '180 min',
        },
    },
};

export default async function PaperPage({ params }) {
    const { examSlug, paperSlug } = await params;
    const paper = papers[examSlug]?.[paperSlug];

    if (!paper) {
        notFound();
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div>
                    <Link href={`/dashboard/egzaminy/${examSlug}`} className={styles.back_link}>
                        ← Wróć do arkuszy
                    </Link>
                    <h1>{paper.examTitle}: {paper.title}</h1>
                    <p>Panel startowy interaktywnego arkusza.</p>
                </div>
                <button className={styles.start_button}>Rozpocznij</button>
            </header>

            <section className={styles.workspace}>
                <aside className={styles.paper_preview}>
                    <div className={styles.paper_sheet}>
                        <span>ARKUSZ</span>
                        <h2>{paper.examTitle}</h2>
                        <p>{paper.title}</p>
                        <div className={styles.fake_line}></div>
                        <div className={styles.fake_line}></div>
                        <div className={styles.fake_line_short}></div>
                    </div>
                </aside>

                <main className={styles.answer_panel}>
                    <div className={styles.meta_grid}>
                        <div>
                            <span>Zadania</span>
                            <strong>{paper.tasksCount}</strong>
                        </div>
                        <div>
                            <span>Czas</span>
                            <strong>{paper.duration}</strong>
                        </div>
                    </div>

                    <h2>Odpowiedzi</h2>
                    <div className={styles.answers_grid}>
                        {Array.from({ length: paper.tasksCount }, (_, index) => (
                            <button key={index + 1} className={styles.answer_button}>
                                {index + 1}
                            </button>
                        ))}
                    </div>
                </main>
            </section>
        </div>
    );
}
