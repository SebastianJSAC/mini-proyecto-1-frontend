import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, Mail, Lock, User, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";

export default function Registro() {
    const [datos, setDatos] = useState({ username: "", email: "", password: "" });
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

    const manejarRegistro = async (e) => {
        e.preventDefault();
        setCargando(true);
        try {
            const response = await fetch(`${API_URL}/tareas/api/registro/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos),
            });
            const res = await response.json();
            if (response.ok) {
                await Swal.fire({ icon: "success", title: "¡Todo listo!", text: "Cuenta creada con éxito.", confirmButtonColor: "#10b981" });
                navigate("/login");
            } else {
                Swal.fire("Error", res.errores?.username?.[0] || "Datos inválidos", "error");
            }
        } catch (error) {
            Swal.fire("Error", "Servidor no disponible", "error");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-emerald-100 border border-slate-100 p-10 relative">
                <Link to="/login" className="absolute top-8 left-8 text-slate-400 hover:text-emerald-600 transition-colors">
                    <ArrowLeft size={20} />
                </Link>

                <div className="text-center mb-8 pt-4">
                    <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserPlus className="text-emerald-600 w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800">Crea tu cuenta</h2>
                    <p className="text-slate-500 text-sm mt-1">Únete a la comunidad FocusFlow</p>
                </div>

                <form onSubmit={manejarRegistro} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Usuario</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="text"
                                required
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                placeholder="usuario_cool"
                                onChange={(e) => setDatos({ ...datos, username: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="email"
                                required
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                placeholder="ejemplo@email.com"
                                onChange={(e) => setDatos({ ...datos, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Contraseña</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="password"
                                required
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                placeholder="••••••••"
                                onChange={(e) => setDatos({ ...datos, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={cargando}
                        className="w-full py-4 rounded-2xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all active:scale-[0.98] disabled:bg-slate-300"
                    >
                        {cargando ? "Procesando..." : "Registrarme"}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-slate-50 pt-6">
                    <p className="text-slate-500 text-sm">
                        ¿Ya tienes cuenta?{" "}
                        <Link to="/login" className="text-emerald-600 font-bold hover:underline">
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}