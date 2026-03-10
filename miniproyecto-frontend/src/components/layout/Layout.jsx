import {Link, useLocation, Outlet, useNavigate} from "react-router-dom";
import { Plus, ListTodo, LogOut, X } from "lucide-react";
import {useEffect, useState} from "react";
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

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">F</span>
                        </div>
                        <span className="text-xl font-semibold text-gray-900">FocusFlow</span>
                    </div>

                    {/* Menu */}
                    <div className="flex gap-6 items-center">
                        <Link
                            to="/hoy"
                            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                                location.pathname === '/hoy'
                                    ? 'text-emerald-600'
                                    : 'text-gray-500 hover:text-emerald-600'
                            }`}
                        >
                            <ListTodo size={18} />
                            Hoy
                        </Link>

                        <Link
                            to="/completadas"
                            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                                location.pathname === '/completadas'
                                    ? 'text-emerald-600'
                                    : 'text-gray-500 hover:text-emerald-600'
                            }`}
                        >
                            Completadas
                        </Link>

                        <Link
                            to="/vencidas"
                            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                                location.pathname === '/vencidas'
                                    ? 'text-emerald-600'
                                    : 'text-gray-500 hover:text-emerald-600'
                            }`}
                        >
                            Vencidas
                        </Link>

                        <Link
                            to="/urgentes"
                            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                                location.pathname === '/urgentes'
                                    ? 'text-emerald-600'
                                    : 'text-gray-500 hover:text-emerald-600'
                            }`}
                        >
                            Urgentes
                        </Link>

                        <Link
                            to="/todas"
                            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                                location.pathname === '/todas'
                                    ? 'text-emerald-600'
                                    : 'text-gray-500 hover:text-emerald-600'
                            }`}
                        >
                            Todas
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Outlet de las vistas */}
            <Outlet context={{ tasks, setTasks, API_URL }} />

            {/* Botón flotante + */}
            <button
                onClick={() => setShowQuickTaskModal(true)}
                className="fixed bottom-8 right-8 bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-500 transition z-50"
            >
                <Plus size={24} />
            </button>

            {/* Modal QuickTaskForm */}
            {showQuickTaskModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-4xl overflow-auto relative shadow-xl">
                        <button
                            onClick={() => setShowQuickTaskModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
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