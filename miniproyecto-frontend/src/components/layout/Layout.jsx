import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { Plus, ListTodo, LogOut, X, CheckCircle2, AlertCircle, Clock, LayoutGrid } from "lucide-react";
import { useEffect, useState } from "react";
import QuickTaskForm from "../today/QuickTaskForm.jsx";
import { obtenerTareas } from "../../services/taskService.js";

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
        { to: "/completadas", label: "Completadas", icon: CheckCircle2 },
        { to: "/vencidas", label: "Vencidas", icon: Clock },
        { to: "/proximas", label: "Proximas", icon: AlertCircle },
        { to: "/todas", label: "Todas", icon: LayoutGrid },
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* --- PANEL IZQUIERDO (SIDEBAR) --- */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
                {/* Logo Section */}
                <div className="p-6 flex items-center gap-3 border-b border-gray-50">
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                        <span className="text-white font-bold text-xl">F</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900 tracking-tight">FocusFlow</span>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.to;
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                    isActive
                                        ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-emerald-600'
                                }`}
                            >
                                <Icon size={20} className={isActive ? 'text-emerald-600' : ''} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section / Logout */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={20} />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Header Superior (Opcional, para títulos o acciones rápidas) */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-8 z-10">
                    <h1 className="text-lg font-semibold text-gray-800 capitalize">
                        {location.pathname.replace("/", "") || "Dashboard"}
                    </h1>
                </header>

                {/* Área de scroll para las vistas */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-5xl mx-auto">
                        <Outlet context={{ tasks, setTasks, API_URL }} />
                    </div>
                </div>

                {/* Botón flotante (+) ajustado a la derecha del contenido */}
                <button
                    onClick={() => setShowQuickTaskModal(true)}
                    className="absolute bottom-8 right-8 bg-emerald-600 text-white p-4 rounded-full shadow-xl hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all z-40 group"
                >
                    <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
            </main>

            {/* --- MODAL --- */}
            {showQuickTaskModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setShowQuickTaskModal(false)}
                            className="absolute top-6 right-6 p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>
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
        </div>
    );
}