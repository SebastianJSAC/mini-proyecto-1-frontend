import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, Mail, Lock, User } from "lucide-react"; // Usando tus iconos
import Swal from "sweetalert2";

export default function Registro() {
    const [datos, setDatos] = useState({
        username: "",
        email: "",
        password: ""
    });
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

    const manejarRegistro = async (e) => {
        e.preventDefault();

        // Validación básica en el Front
        if (!datos.username || !datos.password) {
            return Swal.fire("Campos obligatorios", "El usuario y la contraseña son necesarios", "warning");
        }

        setCargando(true);
        try {
            const response = await fetch(`${API_URL}/tareas/api/registro/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datos),
            });

            const res = await response.json();

            if (response.ok) {
                await Swal.fire({
                    icon: "success",
                    title: "¡Cuenta creada!",
                    text: res.mensaje || "Ahora puedes iniciar sesión con tus credenciales.",
                    confirmButtonColor: "#10b981"
                });
                navigate("/login");
            } else {
                // Si el usuario ya existe, Django nos enviará el error aquí
                const errorMsg = res.errores?.username?.[0] || res.mensaje || "Error al registrarse";
                Swal.fire("Error", errorMsg, "error");
            }
        } catch (error) {
            console.error("Error en registro:", error);
            Swal.fire("Error", "No se pudo conectar con el servidor", "error");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
                <div className="text-center mb-8">
                    <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserPlus className="text-emerald-600 w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Únete a FocusFlow</h2>
                    <p className="text-slate-500 text-sm">Organiza tus misiones diarias hoy mismo</p>
                </div>

                <form onSubmit={manejarRegistro} className="space-y-5">
                    {/* Usuario */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de Usuario</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                required
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                placeholder="Ej: maria_dev"
                                onChange={(e) => setDatos({ ...datos, username: e.target.value })}
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                                * Sin espacios. Solo letras, números y guiones (_ o -).
                            </p>
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <input
                                type="email"
                                required
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                placeholder="tu@correo.com"
                                onChange={(e) => setDatos({ ...datos, email: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                            <input
                                type="password"
                                required
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                placeholder="••••••••"
                                onChange={(e) => setDatos({ ...datos, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={cargando}
                        className={`w-full py-3 rounded-xl font-bold text-white transition-all transform active:scale-95 ${
                            cargando ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                        }`}
                    >
                        {cargando ? "Creando cuenta..." : "Comenzar ahora"}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-slate-100 pt-6">
                    <p className="text-slate-600 text-sm">
                        ¿Ya tienes una cuenta?{" "}
                        <Link to="/login" className="text-emerald-600 font-bold hover:underline">
                            Inicia sesión aquí
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}