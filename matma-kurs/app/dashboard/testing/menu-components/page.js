import Menu from "@/app/dashboard/components/DashboardComponents/Menu/Menu";
import TopBar from "@/app/dashboard/components/DashboardComponents/TopBar/TopBar";


export default function menu_components() {
    return (
        <div style={{ display: 'flex',flexDirection: 'column', gap: '20px'}}>
            <Menu />
            <TopBar />
        </div>
    );
}