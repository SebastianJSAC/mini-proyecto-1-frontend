import { LogOut } from "lucide-react";
import { Link } from "react-router-dom";

const ErrorPage = () => {
    return (
        <div className="bg-slate-50 font-sans antialiased text-slate-800 min-h-screen flex flex-col">
            <main className="flex-grow flex items-center justify-center p-6">
                <div className="max-w-2xl w-full text-center space-y-8">
                    {/* Ilustración SVG */}
                    <div className="flex justify-center">
                        <svg aria-hidden="true" fill="none" height="300" viewBox="0 0 400 300" width="400" xmlns="http://www.w3.org/2000/svg">
                            <rect fill="white" fillOpacity="0.6" height="300" rx="20" width="400"></rect>
                            <circle cx="200" cy="120" fill="#EEF2FF" r="80"></circle>
                            <path d="M160 120C160 120 175 100 200 100C225 100 240 120 240 120" stroke="#50C878" strokeLinecap="round" strokeWidth="8"></path>
                            <circle cx="170" cy="140" fill="#50C878" r="10"></circle>
                            <circle cx="230" cy="140" fill="#50C878" r="10"></circle>
                        </svg>
                    </div>

                    {/* Mensaje de Error */}
                    <section className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                            404 - Página no encontrada
                        </h1>
                        <p className="text-lg text-slate-600 max-w-md mx-auto leading-relaxed">
                            ¡Vaya! Parece que te has desviado del tablero. La ruta que buscas no existe o ha sido movida a una lista diferente.
                        </p>
                    </section>

                    {/* Acciones de Navegación */}
                    <nav className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-emerald-500 hover:bg-emerald-600 transition-all duration-200 shadow-lg shadow-emerald-200 w-full sm:w-auto"
                        >
                            Volver a FocusFlow
                        </Link>
                        <LogOut size={18}
                            to="/login"
                            className="inline-flex items-center justify-center gap-2 px-8 py-3 border border-slate-200 text-base font-medium rounded-xl text-slate-600 bg-white hover:bg-slate-50 transition-all duration-200 w-full sm:w-auto"
                            onClick={() => localStorage.removeItem("token")} />
                        Cerrar sesión
                    </nav>
                </div>
            </main>

            <footer className="py-8 text-center">
                <p className="text-slate-400 text-sm">
                    © {new Date().getFullYear()} TaskMaster App. Manteniendo tu productividad en orden.
                </p>
            </footer>
        </div>
    );
};

export default ErrorPage;