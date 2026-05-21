"use client";
import { useState } from 'react';
import styles from './layout.module.css';
import Menu from "@/app/dashboard/components/DashboardComponents/Menu/Menu";
import TopBar from "@/app/dashboard/components/DashboardComponents/TopBar/TopBar";

export default function DashboardClientWrapper({ children }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className={styles.container}>
            <Menu 
                isCollapsed={isCollapsed} 
                onToggle={() => setIsCollapsed(!isCollapsed)} 
            />
            <TopBar>
                {children}
            </TopBar>
        </div>
    );
}