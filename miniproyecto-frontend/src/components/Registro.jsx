import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, Mail, Lock, User, ArrowLeft, UserCircle2 } from "lucide-react";
import Swal from "sweetalert2";

const inputClass =
    "w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 hover:border-slate-300";

const labelClass = "block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1";

export default function Registro() {
    const [datos, setDatos] = useState({
        nombre: "",
        apellido: "",
        username: "",
        email: "",
        password: "",
        password_confirm: "",
    });
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

    const manejarRegistro = async (e) => {
        e.preventDefault();

        const regexUsuario = /^[\w.-]+$/;
        if (!regexUsuario.test(datos.username)) {
            return Swal.fire({
                icon: "warning",
                title: "Usuario inválido",
                text: "Usa solo letras, números, guion bajo, guion medio o punto, sin espacios.",
                confirmButtonColor: "#f59e0b",
            });
        }

        if (!(datos.nombre || "").trim()) {
            return Swal.fire({
                icon: "warning",
                title: "Nombre obligatorio",
                text: "Indica tu nombre.",
                confirmButtonColor: "#f59e0b",
            });
        }

        if (datos.password !== datos.password_confirm) {
            return Swal.fire({
                icon: "warning",
                title: "Contraseñas distintas",
                text: "La confirmación debe coincidir con la contraseña.",
                confirmButtonColor: "#f59e0b",
            });
        }

        if (datos.password.length < 8) {
            return Swal.fire({
                icon: "warning",
                title: "Contraseña corta",
                text: "Usa al menos 8 caracteres.",
                confirmButtonColor: "#f59e0b",
            });
        }

        setCargando(true);
        try {
            const response = await fetch(`${API_URL}/tareas/api/registro/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre: datos.nombre.trim(),
                    apellido: (datos.apellido || "").trim(),
                    username: datos.username.trim(),
                    email: datos.email.trim(),
                    password: datos.password,
                    password_confirm: datos.password_confirm,
                }),
            });
            const res = await response.json();
            if (response.ok) {
                await Swal.fire({
                    icon: "success",
                    title: "¡Todo listo!",
                    text: "Cuenta creada con éxito.",
                    confirmButtonColor: "#10b981",
                });
                navigate("/login");
            } else {
                const errs = res.errores || {};
                const first =
                    errs.password_confirm?.[0] ||
                    errs.password?.[0] ||
                    errs.username?.[0] ||
                    errs.email?.[0] ||
                    errs.nombre?.[0] ||
                    (typeof errs === "string" ? errs : null) ||
                    (errs.non_field_errors && errs.non_field_errors[0]) ||
                    "Revisa los datos e inténtalo de nuevo.";
                Swal.fire("Error en el registro", first, "error");
            }
        } catch {
            Swal.fire("Error", "Servidor no disponible", "error");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-emerald-100 border border-slate-200 p-10 relative">
                <Link
                    to="/login"
                    className="absolute top-8 left-8 text-slate-400 hover:text-emerald-600 transition-colors rounded-lg p-1 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                    <ArrowLeft size={20} />
                </Link>

                <div className="text-center mb-8 pt-4">
                    <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                        <UserPlus className="text-emerald-600 w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-800">Crea tu cuenta</h2>
                    <p className="text-slate-500 text-sm mt-1">Únete a FocusFlow</p>
                </div>

                <form onSubmit={manejarRegistro} className="space-y-4">
                    <div>
                        <label htmlFor="reg-nombre" className={labelClass}>
                            Nombre
                        </label>
                        <div className="relative group">
                            <UserCircle2 className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
                            <input
                                id="reg-nombre"
                                type="text"
                                required
                                autoComplete="given-name"
                                className={inputClass}
                                placeholder="Tu nombre"
                                value={datos.nombre}
                                onChange={(e) => setDatos({ ...datos, nombre: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="reg-apellido" className={labelClass}>
                            Apellido
                        </label>
                        <div className="relative group">
                            <UserCircle2 className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
                            <input
                                id="reg-apellido"
                                type="text"
                                autoComplete="family-name"
                                className={inputClass}
                                placeholder="Opcional"
                                value={datos.apellido}
                                onChange={(e) => setDatos({ ...datos, apellido: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="reg-user" className={labelClass}>
                            Usuario
                        </label>
                        <div className="relative group">
                            <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
                            <input
                                id="reg-user"
                                type="text"
                                required
                                autoComplete="username"
                                className={inputClass}
                                placeholder="usuario_ejemplo"
                                value={datos.username}
                                onChange={(e) => setDatos({ ...datos, username: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="reg-email" className={labelClass}>
                            Email
                        </label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
                            <input
                                id="reg-email"
                                type="email"
                                required
                                autoComplete="email"
                                className={inputClass}
                                placeholder="ejemplo@email.com"
                                value={datos.email}
                                onChange={(e) => setDatos({ ...datos, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="reg-pass" className={labelClass}>
                            Contraseña
                        </label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
                            <input
                                id="reg-pass"
                                type="password"
                                required
                                autoComplete="new-password"
                                className={inputClass}
                                placeholder="Mínimo 8 caracteres"
                                value={datos.password}
                                onChange={(e) => setDatos({ ...datos, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="reg-pass2" className={labelClass}>
                            Confirmar contraseña
                        </label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
                            <input
                                id="reg-pass2"
                                type="password"
                                required
                                autoComplete="new-password"
                                className={`${inputClass} ${
                                    datos.password_confirm && datos.password !== datos.password_confirm
                                        ? "border-amber-400 focus:border-amber-500 focus:ring-amber-500/10"
                                        : ""
                                }`}
                                placeholder="Repite la contraseña"
                                value={datos.password_confirm}
                                onChange={(e) => setDatos({ ...datos, password_confirm: e.target.value })}
                            />
                        </div>
                        {datos.password_confirm && datos.password !== datos.password_confirm && (
                            <p className="text-xs text-amber-700 mt-1.5 ml-1">Las contraseñas no coinciden.</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={cargando}
                        className="w-full py-4 rounded-2xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200/80 transition-all active:scale-[0.98] disabled:bg-slate-300 outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/40 focus-visible:ring-offset-2 mt-2"
                    >
                        {cargando ? "Procesando..." : "Registrarme"}
                    </button>
                </form>

                <div className="mt-8 text-center border-t border-slate-100 pt-6">
                    <p className="text-slate-500 text-sm">
                        ¿Ya tienes cuenta?{" "}
                        <Link to="/login" className="text-emerald-600 font-bold hover:underline outline-none rounded focus-visible:ring-2 focus-visible:ring-emerald-500">
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
