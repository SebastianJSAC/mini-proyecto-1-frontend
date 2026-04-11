import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { Plus, ListTodo, LogOut, X, LayoutGrid, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import QuickTaskForm from "../today/QuickTaskForm.jsx";
import { obtenerTareas } from "../../services/taskService.js";

const pathTitles = {
    "/hoy": "Hoy",
    "/actividades": "Actividades",
    "/progreso": "Progreso",
};

export default function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

    const [showQuickTaskModal, setShowQuickTaskModal] = useState(false);
    const [tasks, setTasks] = useState([]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    useEffect(() => {
        const cargar = async () => {
            const data = await obtenerTareas(API_URL);
            if (Array.isArray(data)) setTasks(data);
        };
        cargar();
    }, []);

    const menuItems = [
        { to: "/hoy", label: "Hoy", icon: ListTodo },
        { to: "/actividades", label: "Actividades", icon: LayoutGrid },
        { to: "/progreso", label: "Progreso", icon: BarChart3 },
    ];

    const headerTitle = pathTitles[location.pathname] || "FocusFlow";

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full">
                <div className="p-6 flex items-center gap-3 border-b border-slate-100">
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200/80">
                        <span className="text-white font-bold text-xl">F</span>
                    </div>
                    <span className="text-xl font-bold text-slate-900 tracking-tight">FocusFlow</span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto" aria-label="Principal">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.to;
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all border border-transparent outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                                    isActive
                                        ? "bg-emerald-50 text-emerald-800 border-emerald-100 shadow-sm"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-emerald-700 border-transparent"
                                }`}
                            >
                                <Icon size={20} className={isActive ? "text-emerald-600" : "text-slate-500"} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 border border-transparent outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 transition-colors"
                    >
                        <LogOut size={20} />
                        Cerrar sesión
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col relative overflow-hidden">
                <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-10">
                    <h1 className="text-lg font-semibold text-slate-800">{headerTitle}</h1>
                </header>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-5xl mx-auto">
                        <Outlet
                            context={{
                                tasks,
                                setTasks,
                                API_URL,
                                openCreateTaskModal: () => setShowQuickTaskModal(true),
                            }}
                        />
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setShowQuickTaskModal(true)}
                    title="Nueva tarea"
                    aria-label="Nueva tarea"
                    className="absolute bottom-8 right-8 bg-emerald-600 text-white p-4 rounded-full shadow-xl shadow-emerald-200/60 hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all z-40 group outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/50 focus-visible:ring-offset-2"
                >
                    <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
            </main>

            {showQuickTaskModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div
                        className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-2xl overflow-hidden relative shadow-2xl border border-slate-100"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="quick-task-title"
                    >
                        <button
                            type="button"
                            onClick={() => setShowQuickTaskModal(false)}
                            className="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                        >
                            <X size={24} />
                        </button>
                        <QuickTaskForm
                            API_URL={API_URL}
                            obtenerTareas={async () => {
                                const data = await obtenerTareas(API_URL);
                                if (Array.isArray(data)) setTasks(data);
                            }}
                            onClose={() => setShowQuickTaskModal(false)}
                            setTasks={setTasks}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
