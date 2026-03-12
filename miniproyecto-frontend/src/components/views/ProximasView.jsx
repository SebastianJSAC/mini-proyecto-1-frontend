import TasksView from "./TasksView.jsx";
import { useOutletContext } from "react-router-dom";

export default function ProximasView() {
    const { tasks, setTasks, API_URL } = useOutletContext();

    const hoy = new Date();
    const limiteUrgencia = new Date();
    // Definimos urgencia como tareas que vencen en las próximas 48 horas
    limiteUrgencia.setDate(hoy.getDate() + 2);

    const tareasUrgentes = tasks
        .filter(t => {
            if (!t.fecha_entrega || t.completada) return false;
            const fechaTarea = new Date(t.fecha_entrega);
            // Filtramos: que la fecha sea mayor a ahora (no vencida) y menor al límite
            return fechaTarea >= hoy && fechaTarea <= limiteUrgencia;
        })
        .sort((a, b) => new Date(a.fecha_entrega) - new Date(b.fecha_entrega));

    return (
        <TasksView
            tasks={tareasUrgentes}
            setTasks={setTasks}
            API_URL={API_URL}
        />
    );
}