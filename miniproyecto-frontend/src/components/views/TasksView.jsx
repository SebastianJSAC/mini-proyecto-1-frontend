import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import PriorityTask from "../today/PriorityTask.jsx";
import TaskList from "../today/TaskList.jsx";
import PomodoroTimer from "../today/PomodoroTimer.jsx";
import {obtenerTareas} from "../../services/taskService.js";
import QuickTaskForm from "../today/QuickTaskForm.jsx";
import { Plus, X, ChevronDown, Brain, Tag } from "lucide-react";


export default function TasksView({ tasks, setTasks }) {

    const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
    const navigate = useNavigate();

    //const [tasks, setTasks] = useState([]);
    const [showQuickTaskModal, setShowQuickTaskModal] = useState(false);

    //Filtros
    const [tipoFiltro, setTipoFiltro] = useState("todos");
    const [cargaFiltro, setCargaFiltro] = useState("todas");

    const tareasPendientes = tasks.filter(
        t => (t.parent === null || t.parent_id === null) && !t.completada
    );

    const tareasFiltradas = tareasPendientes.filter(t => {
        const tipoOk =
            tipoFiltro === "todos" ||
            t.tipo_tarea.toUpperCase() === tipoFiltro.toUpperCase();

        const cargaOk =
            cargaFiltro === "todas" ||
            Number(t.carga_mental) === Number(cargaFiltro);

        return tipoOk && cargaOk;
    });

    const totalMisiones = tareasFiltradas.length;

    const tareasPendientesOrdenadas = [...tareasFiltradas].sort((a,b)=>{
        if(!a.fecha_entrega) return 1;
        if(!b.fecha_entrega) return -1;
        return new Date(a.fecha_entrega) - new Date(b.fecha_entrega);
    });

    const tareaMasCercana = tareasPendientesOrdenadas[0];

    const hoy = new Date().toLocaleDateString("es-ES",{
        weekday:"long",
        year:"numeric",
        month:"long",
        day:"numeric"
    });

    return (
        <main className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-light text-gray-900 mb-2">
                        Mis tareas ({totalMisiones})
                    </h1>

                    <p className="text-gray-500">{hoy}</p>
                </div>

                {/* Contenedor de Filtros */}
                <div className="flex flex-wrap items-center gap-4 mt-6 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <p>Filtrar</p>
                    {/* Filtro Tipo */}
                    <div className="relative flex-1 min-w-[160px]">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <select
                            value={tipoFiltro}
                            onChange={(e) => setTipoFiltro(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 appearance-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer shadow-sm"
                        >
                            <option value="todos">Todos los tipos</option>
                            <option value="EX">Examen</option>
                            <option value="QU">Quiz</option>
                            <option value="TA">Taller</option>
                            <option value="PR">Proyecto</option>
                            <option value="OT">Otro</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>

                    {/* Filtro Carga Mental */}
                    <div className="relative flex-1 min-w-[160px]">
                        <Brain className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <select
                            value={cargaFiltro}
                            onChange={(e) => setCargaFiltro(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 appearance-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer shadow-sm"
                        >
                            <option value="todas">Carga mental</option>
                            <option value="1">Muy baja</option>
                            <option value="2">Baja</option>
                            <option value="3">Media</option>
                            <option value="4">Alta</option>
                            <option value="5">Muy alta</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>

                    {/* Botón Reset (Opcional) */}
                    {(tipoFiltro !== "todos" || cargaFiltro !== "todas") && (
                        <button
                            onClick={() => {setTipoFiltro("todos"); setCargaFiltro("todas");}}
                            className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors px-2 cursor-pointer"
                        >
                            Limpiar filtros
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {tareaMasCercana && (
                            <PriorityTask tarea={tareaMasCercana}/>
                        )}

                        <TaskList
                            tasks={tareasFiltradas}
                            setTasks={setTasks}
                            navigate={navigate}
                            API_URL={API_URL}
                        />
                    </div>

                    <PomodoroTimer/>
                </div>
            </div>

            {/* Botón flotante */}
            <button
                onClick={() => setShowQuickTaskModal(true)}
                className="fixed bottom-8 right-8 bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-500 transition"
            >
                <Plus size={24} />
            </button>

            {/* Modal QuickTaskForm */}
            {showQuickTaskModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-4xl overflow-auto relative shadow-xl">

                        {/* Botón de cerrar */}
                        <button
                            onClick={() => setShowQuickTaskModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            <X size={24} />
                        </button>

                        {/* Formulario */}
                        <QuickTaskForm
                            API_URL={API_URL}
                            obtenerTareas={async () => {
                                const data = await obtenerTareas(API_URL);
                                if (Array.isArray(data)) setTasks(data);
                            }}
                            navigate={navigate}
                        />
                    </div>
                </div>
            )}
        </main>
    );
}