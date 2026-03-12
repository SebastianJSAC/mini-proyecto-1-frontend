import TasksView from "./TasksView.jsx";
import { useOutletContext } from "react-router-dom";

export default function HoyView() {
    const { tasks, setTasks, API_URL } = useOutletContext();

    const tareasHoy = tasks.filter(t => {
        if (!t.fecha_entrega || t.completada) return false;

        // Fecha de hoy local
        const hoy = new Date();
        // Fecha de la tarea
        const fechaTarea = new Date(t.fecha_entrega);

        // Comparamos año, mes y día (Ignorando la hora)
        return (
            fechaTarea.getDate() === hoy.getDate() &&
            fechaTarea.getMonth() === hoy.getMonth() &&
            fechaTarea.getFullYear() === hoy.getFullYear()
        );
    });

    return <TasksView tasks={tareasHoy} setTasks={setTasks} API_URL={API_URL} />;
}