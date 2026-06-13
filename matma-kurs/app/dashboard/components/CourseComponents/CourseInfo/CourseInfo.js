import { Children } from 'react';
import styles from './CourseInfo.module.css';
import Link from 'next/link';

export default function CourseInfo({
    link1,
    link2,
    children
}) {
    const childrenArray = Children.toArray(children);

    const ownedCourses = childrenArray.filter(child => child.props['data-owned'] === true);
    const otherCourses = childrenArray.filter(child => child.props['data-owned'] !== true);

    return (
        <div className={styles.course_info_container}>
            <div className={styles.course_info_owned}> 
                
                {ownedCourses.length > 0 && (
                    <>
                        <div className={styles.course_info_owned_top}>
                            <p>Posiadane:</p>
                            <Link href={link1} style={{ textDecoration: 'none' }}>
                                <p className={styles.course_info_owned_continue}>KONTYNUUJ NAUKĘ</p>
                            </Link>
                        </div>
                        <div className={styles.course_info_owned_children}>
                            {ownedCourses}
                        </div>
                    </>
                )}
            </div>
            <div className={styles.course_info_not_owned}>
                {otherCourses.length > 0 && (
                    <>
                        <div className={styles.course_info_not_owned_top}>
                            <p>Pozostałe kursy:</p>
                            <Link href={link2} style={{ textDecoration: 'none' }}>
                                <p className={styles.course_info_not_owned_buy}>OTWÓRZ SKLEP</p>
                            </Link>
                        </div>
                        <div className={styles.course_info_not_owned_children}>
                            {otherCourses}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
