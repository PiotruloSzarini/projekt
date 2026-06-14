"use client";

import TopBar from '@/app/dashboard/components/DashboardComponents/TopBar/TopBar';

export default function AdminDashboardWrapper({ children }) {
    return (
        <TopBar>
            {children}
        </TopBar>
    );
}
