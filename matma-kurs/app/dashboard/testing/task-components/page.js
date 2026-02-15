import TaskSelect from "@/app/dashboard/components/TasksComponents/TaskSelect/TaskSelect";

export default function task_components() {
    return (
        <div style={{
            display: "flex",
            flexDirection: "row",
            gap: "10px"
        }}>
            <TaskSelect int="1" backgroundColor="#1180F6" active={true} link="/dashboard/" />
            <TaskSelect int="2" backgroundColor="#1180F6" active={false} link="/dashboard/" />
            <TaskSelect int="3" backgroundColor="#1180F6" active={false} link="/dashboard/" />
        </div>
    );
}