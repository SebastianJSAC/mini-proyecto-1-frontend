import { AlertTriangle, RefreshCcw, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

const Error500Page = () => {

    return (
        <div className="bg-slate-50 font-sans antialiased text-slate-800 min-h-screen flex flex-col">
            <main className="flex-grow flex items-center justify-center p-6">
                <div className="max-w-2xl w-full text-center space-y-8">

                    {/* Icono */}
                    <div className="flex justify-center">
                        <div className="p-6 rounded-full bg-red-100 text-red-500">
                            <AlertTriangle size={64} />
                        </div>
                    </div>

                    {/* Mensaje */}
                    <section className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                            500 - Error interno
                        </h1>

                        <p className="text-lg text-slate-600 max-w-md mx-auto leading-relaxed">
                            Algo salió mal en el sistema. Nuestro equipo ya está
                            trabajando para solucionarlo.
                        </p>

                    </section>

                    {/* Acciones */}
                    <nav className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">

                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center justify-center gap-2 px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-emerald-500 hover:bg-emerald-600 transition-all duration-200 shadow-lg shadow-emerald-200 w-full sm:w-auto"
                        >
                            <RefreshCcw size={18} />
                            Reintentar
                        </button>

                        <Link
                            to="/login"
                            onClick={() => localStorage.removeItem("token")}
                            className="inline-flex items-center justify-center gap-2 px-8 py-3 border border-slate-200 text-base font-medium rounded-xl text-slate-600 bg-white hover:bg-slate-50 transition-all duration-200 w-full sm:w-auto"
                        >
                            <LogOut size={18} />
                            Cerrar sesión
                        </Link>

                    </nav>
                </div>
            </main>

            <footer className="py-8 text-center">
                <p className="text-slate-400 text-sm">
                    © {new Date().getFullYear()} FocusFlow App. Manteniendo tu productividad en orden.
                </p>
            </footer>
        </div>
    );
};

export default Error500Page;