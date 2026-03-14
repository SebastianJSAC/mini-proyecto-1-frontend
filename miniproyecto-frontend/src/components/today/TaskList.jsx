import { Check, Clock, CalendarDays, AlertCircle, CheckCheck } from "lucide-react";
import TaskCard from "../TaskCard.jsx";
import {useTask} from "../../hooks/useTask.js";

export default function TaskList({ tasks, setTasks, navigate, API_URL }) {

    //Custom Hook useTask
    const action = useTask(tasks, setTasks, API_URL);

    // Agrupar tareas
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const grupos = {
        vencidas: tasks.filter(t => !t.completada && t.fecha_entrega && new Date(t.fecha_entrega) < hoy),
        hoy: tasks.filter(t => !t.completada && t.fecha_entrega && new Date(t.fecha_entrega).toDateString() === hoy.toDateString()),
        proximas: tasks.filter(t => !t.completada && t.fecha_entrega && new Date(t.fecha_entrega) > new Date(hoy.getTime() + 86400000 - 1)),
        completadas: tasks.filter(t => t.completada)
    };

    // Helper para renderizar un grupo
    const RenderGrupo = ({ titulo, lista, icon: Icon, colorClass, action }) => {
        if (lista.length === 0) return null;

        return (
            <div className="mb-8">
                {/* Contenedor del Título + Botón */}
                <div className={`flex items-center justify-between mb-4 pb-2 border-b border-gray-100 ${colorClass}`}>
                    <div className="flex items-center gap-2">
                        <Icon size={18} />
                        <h2 className="font-bold uppercase tracking-wider text-xs">{titulo} ({lista.length})</h2>
                    </div>

                    {/* Renderizamos el botón solo si existe una acción (para vencidas) */}
                    {action && (
                        <button
                            onClick={action.handler}
                            className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg text-[10px] font-bold transition-all border border-emerald-100 shadow-sm active:scale-95"
                        >
                            <CheckCheck size={12} />
                            {action.label}
                        </button>
                    )}
                </div>

                <div className="space-y-3">
                    {lista.map(tarea => (
                        <TaskCard
                            key={tarea.id}
                            tarea={tarea}
                            tasks={tasks}
                            setTasks={setTasks}
                            navigate={navigate}
                            API_URL={API_URL}
                        />
                    ))}
                </div>
            </div>
        );
    };

    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check size={36} className="text-emerald-500" strokeWidth={3} />
                </div>
                <div className="text-center">
                    <p className="text-slate-800 font-semibold text-lg">¡Todo listo!</p>
                    <p className="text-slate-400 text-sm mt-1">No hay tareas pendientes aquí.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-6">
            <div className="mt-6">
                <RenderGrupo
                    titulo="Vencidas"
                    lista={grupos.vencidas}
                    icon={AlertCircle}
                    colorClass="text-red-500 border-red-100"
                    action={{
                        label: "Completar todas",
                        handler: () => action.handleCompleteAllVencidas(grupos.vencidas)
                    }}
                />
            </div>

            <RenderGrupo
                titulo="Para Hoy"
                lista={grupos.hoy}
                icon={Clock}
                colorClass="text-amber-500 border-amber-100"
            />

            <RenderGrupo
                titulo="Próximas"
                lista={grupos.proximas}
                icon={CalendarDays}
                colorClass="text-blue-500 border-blue-100"
            />

            <RenderGrupo
                titulo="Completadas"
                lista={grupos.completadas}
                icon={Check}
                colorClass="text-emerald-500 border-emerald-100"
            />
        </div>
    );
}