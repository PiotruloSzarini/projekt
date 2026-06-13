'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import { useCourseNavigation } from '@/app/hooks/useCourseNavigation';

function formatCoursePrice(index) {
    const base = 119;
    return base + index * 20;
}

export default function ShopPage() {
    const searchParams = useSearchParams();
    const { loading, courses } = useCourseNavigation();

    const selectedSlug = searchParams.get('course');

    const preparedCourses = useMemo(() => {
        return courses.map((course, index) => ({
            ...course,
            price: formatCoursePrice(index),
        }));
    }, [courses]);

    const selectedCourse =
        preparedCourses.find((course) => course.slug === selectedSlug) ||
        preparedCourses.find((course) => !course.owned) ||
        preparedCourses[0] ||
        null;

    const ownedCourses = preparedCourses.filter((course) => course.owned);
    const lockedCourses = preparedCourses.filter((course) => !course.owned);

    if (loading) {
        return <div className={styles.loader}>Ładowanie sklepu...</div>;
    }

    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.hero_copy}>
                    <span className={styles.badge}>Sklep z kursami</span>
                    <h1>Odblokuj kurs i przejdź do nauki bez przestojów</h1>
                    <p>
                        To jest panel zakupowy zrobiony pod wygląd produktu. Na razie działa jako
                        prezentacja, ale od razu pokazuje, co kupujesz, ile kosztuje kurs i co dostajesz.
                    </p>
                    <div className={styles.hero_actions}>
                        <Link href="/dashboard/kursy" className={styles.primary_action}>
                            Wróć do kursów
                        </Link>
                        <Link href="/dashboard/profil" className={styles.secondary_action}>
                            Mój profil
                        </Link>
                    </div>
                </div>

                <aside className={styles.summary_card}>
                    <div className={styles.summary_row}>
                        <span>Posiadane kursy</span>
                        <strong>{ownedCourses.length}</strong>
                    </div>
                    <div className={styles.summary_row}>
                        <span>Dostępne do kupienia</span>
                        <strong>{lockedCourses.length}</strong>
                    </div>
                    <div className={styles.summary_row}>
                        <span>Najczęstszy koszt</span>
                        <strong>od {selectedCourse?.price || 0} zł</strong>
                    </div>
                </aside>
            </section>

            <section className={styles.shop_layout}>
                <div className={styles.selected_panel}>
                    {selectedCourse ? (
                        <>
                            <div
                                className={styles.course_visual}
                                style={{ backgroundColor: selectedCourse.color || '#1180f6' }}
                            >
                                <span className={styles.course_label}>
                                    {selectedCourse.owned ? 'Masz już ten kurs' : 'Kurs zablokowany'}
                                </span>
                                <h2>{selectedCourse.title}</h2>
                                <p>
                                    {selectedCourse.total_tasks || 0} zadań • {selectedCourse.total_videos || 0} lekcji
                                </p>
                            </div>

                            <div className={styles.details_grid}>
                                <div className={styles.detail_box}>
                                    <span>Cena</span>
                                    <strong>{selectedCourse.price} zł</strong>
                                </div>
                                <div className={styles.detail_box}>
                                    <span>Postęp</span>
                                    <strong>{selectedCourse.progress || 0}%</strong>
                                </div>
                                <div className={styles.detail_box}>
                                    <span>Status</span>
                                    <strong>{selectedCourse.owned ? 'Kupione' : 'Do kupienia'}</strong>
                                </div>
                                <div className={styles.detail_box}>
                                    <span>Tryb</span>
                                    <strong>{selectedCourse.owned ? 'Pełny dostęp' : 'Podgląd zakupowy'}</strong>
                                </div>
                            </div>

                            <div className={styles.purchase_panel}>
                                <div>
                                    <h3>{selectedCourse.owned ? 'Ten kurs jest odblokowany' : 'Wygląd przycisku zakupu'}</h3>
                                    <p>
                                        {selectedCourse.owned
                                            ? 'Nie trzeba go kupować ponownie. Kliknij kurs i wróć do nauki.'
                                            : 'W tym miejscu później podepniemy płatność. Na teraz pokazujemy panel i stan kursu.'}
                                    </p>
                                </div>
                                <button type="button" className={styles.purchase_button} disabled>
                                    {selectedCourse.owned ? 'Kurs już kupiony' : `Kup teraz za ${selectedCourse.price} zł`}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className={styles.empty_state}>
                            <h2>Brak kursów do wyświetlenia</h2>
                            <p>Jeśli konto nie ma jeszcze przypisanych kursów, panel pokaże się tutaj po ich dodaniu.</p>
                        </div>
                    )}
                </div>

                <aside className={styles.catalog_panel}>
                    <div className={styles.catalog_head}>
                        <h3>Wszystkie kursy</h3>
                        <p>Kliknij kartę, żeby zobaczyć podgląd zakupu.</p>
                    </div>

                    <div className={styles.catalog_list}>
                        {preparedCourses.map((course) => (
                            <Link
                                key={course.course_id}
                                href={`/dashboard/sklep?course=${course.slug}`}
                                className={`${styles.catalog_item} ${selectedCourse?.course_id === course.course_id ? styles.catalog_item_active : ''}`}
                            >
                                <div>
                                    <strong>{course.title}</strong>
                                    <span>{course.owned ? 'Kupiony' : 'Zablokowany'}</span>
                                </div>
                                <b>{course.price} zł</b>
                            </Link>
                        ))}
                    </div>
                </aside>
            </section>
        </div>
    );
}
