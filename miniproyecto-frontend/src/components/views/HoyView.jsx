import { useOutletContext } from "react-router-dom";
import { ListTodo, ChevronDown, ChevronUp, Info, Check } from "lucide-react";
import TasksView from "./TasksView.jsx";
import { useState } from "react";

const prioridadTooltip =
    "Orden: tareas vencidas primero, luego próximas fechas. Para hoy, en empate por fecha se muestra antes la de menor carga mental.";

export default function HoyView() {
    const { tasks, setTasks, API_URL, openCreateTaskModal } = useOutletContext();
    const [isHoyExpanded, setIsHoyExpanded] = useState(true);

    const hoy = new Date();

    const filterHoy = (t) => {
        if (!t.fecha_entrega || t.completada) return false;
        const f = new Date(t.fecha_entrega);
        return (
            f.getDate() === hoy.getDate() &&
            f.getMonth() === hoy.getMonth() &&
            f.getFullYear() === hoy.getFullYear()
        );
    };

    const getPrioridad = (t) => {
        if (!t.fecha_entrega) return 3;
        const fecha = new Date(t.fecha_entrega);
        const esHoy =
            fecha.getDate() === hoy.getDate() &&
            fecha.getMonth() === hoy.getMonth() &&
            fecha.getFullYear() === hoy.getFullYear();
        if (fecha < hoy) return 0;
        if (esHoy) return 1;
        return 2;
    };

    const tareasHoy = tasks
        .filter(filterHoy)
        .sort((a, b) => {
            const pA = getPrioridad(a);
            const pB = getPrioridad(b);
            if (pA !== pB) return pA - pB;
            return (a.carga_mental ?? 999) - (b.carga_mental ?? 999);
        });

    if (tareasHoy.length === 0) {
        return (
            <div className="w-full flex flex-col items-center justify-center min-h-[calc(100dvh-10rem)] px-6 py-12 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200/80 shadow-sm">
                    <Check size={36} className="text-emerald-600" strokeWidth={2.5} aria-hidden />
                </div>
                <p className="text-slate-800 font-semibold text-xl mt-8">¡Todo listo!</p>
                <p className="text-slate-500 text-sm mt-2 max-w-sm leading-relaxed">
                    No hay tareas con fecha de entrega para hoy. Cuando agregues una con fecha de hoy, aparecerá aquí.
                </p>
                <button
                    type="button"
                    onClick={() => openCreateTaskModal?.()}
                    className="mt-8 inline-flex items-center justify-center px-8 py-3.5 rounded-2xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200/80 active:scale-[0.98] transition-all outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/40 focus-visible:ring-offset-2"
                >
                    Crear tarea
                </button>
            </div>
        );
    }

    return (
        <div className="w-full space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 flex items-center justify-between gap-4 border-b border-slate-100">
                    <div className="flex flex-1 items-center justify-between gap-4 min-w-0">
                        <button
                            type="button"
                            onClick={() => setIsHoyExpanded(!isHoyExpanded)}
                            className="flex flex-1 items-center gap-4 min-w-0 text-left rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 -m-2 p-2 hover:bg-slate-50 transition-colors"
                        >
                            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200 shrink-0">
                                <ListTodo size={20} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-xl font-bold text-slate-900">Tareas para hoy</h2>
                                <p className="text-sm text-slate-500">
                                    {tareasHoy.length}{" "}
                                    {tareasHoy.length === 1 ? "tarea pendiente" : "tareas pendientes"}
                                </p>
                            </div>
                            {isHoyExpanded ? (
                                <ChevronUp className="text-slate-400 shrink-0" aria-hidden />
                            ) : (
                                <ChevronDown className="text-slate-400 shrink-0" aria-hidden />
                            )}
                        </button>
                        <button
                            type="button"
                            className="p-2 rounded-xl text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 shrink-0"
                            title={prioridadTooltip}
                            aria-label="Cómo priorizamos las tareas"
                        >
                            <Info size={20} aria-hidden />
                        </button>
                    </div>
                </div>

                {isHoyExpanded && (
                    <div className="p-6 border-t border-slate-100 bg-slate-50/40">
                        <TasksView
                            tasks={tareasHoy}
                            setTasks={setTasks}
                            API_URL={API_URL}
                            embedded
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
