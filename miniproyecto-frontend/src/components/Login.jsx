import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, Lock, User, ShieldCheck } from "lucide-react";
import Swal from "sweetalert2";

export default function Login() {
    const [form, setForm] = useState({ username: "", password: "" });
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);
        try {
            const res = await fetch(`${API_URL}/tareas/api/login/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem("token", data.access);
                navigate("/hoy");
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Acceso denegado",
                    text: "Usuario o contraseña incorrectos",
                    confirmButtonColor: "#ef4444"
                });
            }
        } catch (error) {
            Swal.fire("Error", "No se pudo conectar con el servidor", "error");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-emerald-100 border border-slate-100 p-10">
                <div className="text-center mb-10">
                    <div className="bg-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg rotate-3">
                        <ShieldCheck className="text-white w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">FocusFlow</h2>
                    <p className="text-slate-500 text-sm mt-2">Bienvenido de nuevo, te extrañábamos</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">Usuario</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="text"
                                required
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                placeholder="Tu nombre de usuario"
                                onChange={e => setForm({...form, username: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">Contraseña</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="password"
                                required
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                placeholder="••••••••"
                                onChange={e => setForm({...form, password: e.target.value})}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={cargando}
                        className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-200 active:scale-[0.98] transition-all disabled:bg-slate-300 flex items-center justify-center gap-2"
                    >
                        {cargando ? "Validando..." : <><LogIn size={20} /> Entrar ahora</>}
                    </button>
                </form>

                <div className="mt-10 text-center border-t border-slate-100 pt-8">
                    <p className="text-slate-500 text-sm">
                        ¿Nuevo por aquí?{" "}
                        <Link to="/registro" className="text-emerald-600 font-bold hover:underline">
                            Crea una cuenta gratis
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}