import Link from "next/link";


export default function testing() {
    return (
        <div>
            <Link href="/dashboard/testing/time-counter">
                time counter
            </Link>
            <br></br>
            <Link href="/dashboard/testing/rozdzial-info">
                rozdzial info
            </Link>
            <br></br>
            <Link href="/dashboard/testing/temat-info">
                temat info
            </Link>
            <br></br>
            <Link href="/dashboard/testing/course-components">
                course components
            </Link>
            <br></br>
            <Link href="/dashboard/testing/lesson-components">
                lesson components
            </Link>
            <br></br>
            <Link href="/dashboard/testing/task-components">
                task components
            </Link>
            <br></br>
            <Link href="/dashboard/testing/menu-components">
                menu components
            </Link>
            <br></br>
            <Link href="/dashboard/testing/home-components">
                home components
            </Link>
        </div>
    );
}