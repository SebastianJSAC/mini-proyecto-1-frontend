import { useOutletContext, useNavigate } from "react-router-dom";
import { ListTodo, CheckCircle2, Clock, AlertCircle, LayoutGrid, ChevronDown, ChevronUp } from "lucide-react";
import TasksView from "./TasksView.jsx";
import { useState } from "react";

export default function HoyView() {
    const { tasks, setTasks, API_URL } = useOutletContext();
    const navigate = useNavigate();
    const [isHoyExpanded, setIsHoyExpanded] = useState(true);

    const hoy = new Date();
    const ahora = new Date();
    const limite = new Date();
    limite.setDate(ahora.getDate() + 2);

    // --- LÓGICA DE FILTRADO ---
    const filterHoy = (t) => {
        if (!t.fecha_entrega || t.completada) return false;
        const f = new Date(t.fecha_entrega);
        return f.getDate() === hoy.getDate() && f.getMonth() === hoy.getMonth() && f.getFullYear() === hoy.getFullYear();
    };

    const tareasHoy = tasks.filter(filterHoy);
    const urgentes = tasks.filter(t => {
        if (!t.fecha_entrega || t.completada) return false;
        const f = new Date(t.fecha_entrega);
        return f >= ahora && f <= limite;
    }).length;
    const completadas = tasks.filter(t => t.completada).length;
    const vencidas = tasks.filter(t => t.fecha_entrega && new Date(t.fecha_entrega) < hoy && !t.completada).length;
    const todas = tasks.length;

    // --- COMPONENTE DE TARJETA ESTADÍSTICA ---
    const StatCard = ({ title, count, icon: Icon, color, path, isLarge = false }) => (
        <div
            onClick={() => path && navigate(path)}
            className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group ${isLarge ? 'md:col-span-2' : ''}`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900 mt-1">{count}</h3>
                </div>
                <div className={`p-3 rounded-xl ${color} text-white group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* --- GRID DE ESTADÍSTICAS --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Todas" count={todas} icon={LayoutGrid} color="bg-blue-500" path="/todas" />
                <StatCard title="Urgentes" count={urgentes} icon={AlertCircle} color="bg-orange-500" path="/urgentes" />
                <StatCard title="Vencidas" count={vencidas} icon={Clock} color="bg-red-500" path="/vencidas" />
                <StatCard title="Completadas" count={completadas} icon={CheckCircle2} color="bg-emerald-500" path="/completadas" />
            </div>

            {/* --- TARJETA EXPANDIBLE DE HOY --- */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div
                    onClick={() => setIsHoyExpanded(!isHoyExpanded)}
                    className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                            <ListTodo size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Tareas para Hoy</h2>
                            <p className="text-sm text-gray-500">Tienes {tareasHoy.length} tareas pendientes</p>
                        </div>
                    </div>
                    {isHoyExpanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                </div>

                {isHoyExpanded && (
                    <div className="p-6 border-t border-gray-100 bg-gray-50/30">
                        {tareasHoy.length > 0 ? (
                            <TasksView tasks={tareasHoy} setTasks={setTasks} API_URL={API_URL} />
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-gray-400 font-medium">No hay tareas programadas para hoy. ¡Día libre!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}