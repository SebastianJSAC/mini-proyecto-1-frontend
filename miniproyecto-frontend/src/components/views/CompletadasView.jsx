import TasksView from "./TasksView.jsx";
import { useOutletContext } from "react-router-dom";

export default function CompletadasView() {
    const { tasks, setTasks, API_URL } = useOutletContext();
    const tareasCompletadas = tasks.filter(t => t.completada);
    return <TasksView tasks={tareasCompletadas} setTasks={setTasks} API_URL={API_URL} />;
}