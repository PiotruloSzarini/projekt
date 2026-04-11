import styles from './layout.module.css';
import Menu from "@/app/dashboard/components/DashboardComponents/Menu/Menu";
import TopBar from "@/app/dashboard/components/DashboardComponents/TopBar/TopBar";
import { CourseProvider } from '@/app/context/CourseContext';


export default function DashboardLayout({ children }) {
    return (
    <CourseProvider>
    <div className={styles.container}>
        <Menu />
        <TopBar>
            {children}
        </TopBar>
    </div>
    </CourseProvider>
    );
}
