import TasksView from "./TasksView.jsx";
import { useOutletContext } from "react-router-dom";

export default function HoyView() {
    const { tasks, setTasks, API_URL } = useOutletContext();
    const hoy = new Date().toISOString().split("T")[0];

    const tareasHoy = tasks.filter(t =>
        t.carga_mental <= 3 && t.fecha_entrega && t.fecha_entrega.startsWith(hoy) && !t.completada
    );

    return <TasksView tasks={tareasHoy} setTasks={setTasks} API_URL={API_URL} />;
}