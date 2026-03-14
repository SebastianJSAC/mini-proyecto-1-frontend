import TasksView from "./TasksView.jsx";
import { useOutletContext } from "react-router-dom";

export default function VencidasView() {
    const { tasks, setTasks, API_URL } = useOutletContext();
    const ahora = new Date();

    const tareasVencidas = tasks
        .filter(t => t.fecha_entrega && new Date(t.fecha_entrega) < ahora && !t.completada)
        .sort((a, b) => {
            const fechaDiff = new Date(a.fecha_entrega) - new Date(b.fecha_entrega);
            if (fechaDiff !== 0) return fechaDiff; // Más antigua arriba
            return (a.carga_mental || 0) - (b.carga_mental || 0); // Empate por esfuerzo
        });

    return <TasksView tasks={tareasVencidas} setTasks={setTasks} API_URL={API_URL} />;
}