'use client';
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { useUser } from '@/app/context/UserContext';

const CLOUDINARY_UPLOAD_PRESET = 'omm_photos';
const CLOUDINARY_CLOUD_NAME = 'ds6xrritb';

export default function ProfilePage() {
    const { userId, user, loading, refresh } = useUser();
    const [name, setName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [ownedCourses, setOwnedCourses] = useState([]);
    const [coursesLoading, setCoursesLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setAvatarUrl(user.avatar_url || '');
        }
    }, [user]);

    useEffect(() => {
        const loadOwnedCourses = async () => {
            if (!userId) {
                setCoursesLoading(false);
                return;
            }

            setCoursesLoading(true);
            try {
                const res = await fetch(`/api/courses?userId=${userId}`);
                const data = await res.json();
                setOwnedCourses(Array.isArray(data) ? data.filter((course) => course.owned) : []);
            } catch (err) {
                console.error(err);
            } finally {
                setCoursesLoading(false);
            }
        };

        loadOwnedCourses();
    }, [userId]);

    const uploadAvatar = async (file) => {
        if (!file) return null;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();
        if (!data.secure_url) {
            throw new Error(data.error?.message || 'Nie udało się wgrać zdjęcia');
        }

        return data.secure_url;
    };

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setError('');
        setUploading(true);
        try {
            const url = await uploadAvatar(file);
            setAvatarUrl(url);
            setMessage('Zdjęcie zostało dodane do formularza. Kliknij "Zapisz profil".');
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
            event.target.value = '';
        }
    };

    const handleSave = async () => {
        setMessage('');
        setError('');
        setSaving(true);

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    avatar_url: avatarUrl,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Nie udało się zapisać profilu');
            }

            setMessage('Profil zapisany pomyślnie.');
            await refresh();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const avatarPreview = avatarUrl || '/assets/img/topbar/user-icon.svg';

    if (loading) {
        return <div className={styles.loading}>Ładowanie profilu...</div>;
    }

    return (
        <div className={styles.page}>
            <section className={styles.hero}>
                <div className={styles.hero_copy}>
                    <span className={styles.kicker}>Panel użytkownika</span>
                    <h1>Twoje konto w jednym miejscu</h1>
                    <p>
                        Zmieniaj nazwę, avatar i wracaj do kupionych kursów bez szukania po całym serwisie.
                    </p>
                </div>

                <div className={styles.hero_card}>
                    <div className={styles.avatar_wrap}>
                        <img src={avatarPreview} alt="Avatar użytkownika" className={styles.avatar} />
                    </div>
                    <div className={styles.hero_name}>{name || 'Użytkownik'}</div>
                    <div className={styles.hero_meta}>ID: {userId}</div>

                    <div className={styles.badges}>
                        <span>Poziom {user?.level ?? 1}</span>
                        <span>{user?.total_points ?? 0} pkt</span>
                        <span>{user?.current_streak ?? 0} dni streaku</span>
                    </div>
                </div>
            </section>

            <section className={styles.grid}>
                <div className={styles.card}>
                    <div className={styles.card_header}>
                        <h2>Edytuj profil</h2>
                        <span>Wszystko zapisujesz jednym przyciskiem</span>
                    </div>

                    <div className={styles.form}>
                        <label className={styles.field}>
                            <span>Nazwa widoczna dla innych</span>
                            <input
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                placeholder="Wpisz swoją nazwę"
                            />
                        </label>

                        <label className={styles.field}>
                            <span>Adres zdjęcia</span>
                            <input
                                value={avatarUrl}
                                onChange={(event) => setAvatarUrl(event.target.value)}
                                placeholder="Wklej link do zdjęcia lub wgraj plik"
                            />
                        </label>

                        <label className={styles.upload_box}>
                            <span>Wgraj nowe zdjęcie</span>
                            <input type="file" accept="image/*" onChange={handleFileChange} />
                            <small>Plik trafi do bazy przez Cloudinary i od razu będzie gotowy do zapisania.</small>
                        </label>

                        <div className={styles.actions}>
                            <button type="button" className={styles.primary} onClick={handleSave} disabled={saving || uploading}>
                                {saving ? 'Zapisywanie...' : 'Zapisz profil'}
                            </button>
                            <button type="button" className={styles.secondary} onClick={() => setAvatarUrl('')} disabled={saving}>
                                Usuń zdjęcie
                            </button>
                        </div>

                        {message && <div className={styles.success}>{message}</div>}
                        {error && <div className={styles.error}>{error}</div>}
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.card_header}>
                        <h2>Moje kursy</h2>
                        <span>Kursy, które są już Twoje</span>
                    </div>

                    <div className={styles.course_list}>
                        {coursesLoading ? (
                            <div className={styles.empty_state}>Ładowanie kursów...</div>
                        ) : ownedCourses.length > 0 ? (
                            ownedCourses.map((course) => (
                                <Link key={course.course_id} href={`/dashboard/kursy/${course.slug}`} className={styles.course_item}>
                                    <div className={styles.course_top}>
                                        <div>
                                            <h3>{course.title}</h3>
                                            <p>{course.total_tasks || 0} zadań • {course.total_videos || 0} filmów</p>
                                        </div>
                                        <span className={styles.course_badge}>{course.progress || 0}%</span>
                                    </div>
                                    <div className={styles.progress_bar}>
                                        <span style={{ width: `${course.progress || 0}%`, background: course.color || '#1180F6' }} />
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className={styles.empty_state}>
                                Nie masz jeszcze kupionych kursów.
                                <Link href="/dashboard/kursy">Przejdź do kursów</Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.card}>
                    <div className={styles.card_header}>
                        <h2>Szybkie informacje</h2>
                        <span>Najważniejsze liczby na dziś</span>
                    </div>

                    <div className={styles.stats_grid}>
                        <div className={styles.stat_box}>
                            <strong>{user?.global_rank ?? '-'}</strong>
                            <span>Pozycja globalna</span>
                        </div>
                        <div className={styles.stat_box}>
                            <strong>{user?.tasks_completed ?? 0}</strong>
                            <span>Ukończone zadania</span>
                        </div>
                        <div className={styles.stat_box}>
                            <strong>{user?.videos_watched ?? 0}</strong>
                            <span>Obejrzane lekcje</span>
                        </div>
                        <div className={styles.stat_box}>
                            <strong>{user?.daily_completed ?? 0}</strong>
                            <span>Daily challenge</span>
                        </div>
                    </div>

                    <div className={styles.quick_links}>
                        <Link href="/dashboard" className={styles.quick_link}>Wróć do dashboardu</Link>
                        <Link href="/dashboard/kursy" className={styles.quick_link}>Zobacz wszystkie kursy</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
