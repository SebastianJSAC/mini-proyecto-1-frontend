import {Link, useLocation, Outlet, useNavigate} from "react-router-dom";
import { PlusCircle, ListTodo, LogOut } from "lucide-react";

export default function Layout() {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

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
                            Mis Tareas
                        </Link>

                        {/*<Link
                            to="/hoy/crear"
                            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                                location.pathname === '/hoy/crear'
                                    ? 'text-emerald-600'
                                    : 'text-gray-500 hover:text-emerald-600'
                            }`}
                        >
                            <PlusCircle size={18} />
                            Nueva Tarea
                        </Link>*/}

                        {/* Logout */}
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

            <Outlet />
        </div>
    );
}