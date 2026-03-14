import TasksView from "./TasksView.jsx";
import { useOutletContext } from "react-router-dom";
import { AlertCircle } from "lucide-react";

export default function TodasView() {
    const { tasks, setTasks, API_URL } = useOutletContext();

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const ahora = new Date();

    // 1. Agrupar y Ordenar según la Regla Base
    const tareasProcesadas = [...tasks].sort((a, b) => {
        // REGLA DE ORO: Completadas siempre al final
        if (a.completada !== b.completada) {
            return a.completada ? 1 : -1;
        }

        const fechaA = a.fecha_entrega ? new Date(a.fecha_entrega) : null;
        const fechaB = b.fecha_entrega ? new Date(b.fecha_entrega) : null;

        // Si alguna no tiene fecha, la mandamos al final del grupo
        if (!fechaA) return 1;
        if (!fechaB) return -1;

        // CATEGORIZACIÓN PARA PRIORIDAD DE GRUPO
        const getGrupo = (fecha) => {
            if (fecha < hoy) return 0; // Vencidas
            if (fecha.toDateString() === hoy.toDateString()) return 1; // Para hoy
            return 2; // Próximas
        };

        const grupoA = getGrupo(fechaA);
        const grupoB = getGrupo(fechaB);

        // Regla: Agrupar por Vencidas -> Hoy -> Próximas
        if (grupoA !== grupoB) return grupoA - grupoB;

        // Regla: Ordenar por fecha (Vencidas antiguas arriba / Próximas cercanas arriba)
        if (fechaA.getTime() !== fechaB.getTime()) {
            return fechaA - fechaB;
        }

        // Regla de Empate: menor carga mental primero
        return (a.carga_mental || 0) - (b.carga_mental || 0);
    });

    return (
        <div className="space-y-6">
            {/* --- MENSAJE DE PRIORIZACIÓN --- */}
            <div
                className="flex items-start gap-2 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-xl p-3">
                <AlertCircle size={16} className="mt-[2px] text-blue-500 shrink-0"/>
                <span>
                    Priorizamos tu éxito: Aqui puedes ver tus tareas en un orden óptimo priorizando lo <strong>Vencido</strong>, después <strong>Lo que tienes para hoy</strong>, luego <strong>Próximas</strong>, después <strong>Completadas</strong>.
                    En caso de empate en fecha, verás primero la tarea de <strong>menor carga mental</strong>.
                </span>
            </div>

            <TasksView
                tasks={tareasProcesadas}
                setTasks={setTasks}
                API_URL={API_URL}
            />
        </div>
    );
}