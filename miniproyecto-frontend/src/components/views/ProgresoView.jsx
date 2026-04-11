import { useOutletContext } from "react-router-dom";
import { CheckCircle2, ListTodo, Clock, TrendingUp } from "lucide-react";

export default function ProgresoView() {
    const { tasks } = useOutletContext();

    const roots = tasks.filter((t) => t.parent == null && t.parent_id == null);
    const total = roots.length;
    const completadas = roots.filter((t) => t.completada).length;
    const pendientes = total - completadas;
    const pct = total ? Math.round((completadas / total) * 100) : 0;

    const hoy = new Date();
    const vencidas = roots.filter(
        (t) => t.fecha_entrega && new Date(t.fecha_entrega) < hoy && !t.completada
    ).length;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all focus-within:ring-2 focus-within:ring-emerald-500/30">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Total</p>
                    <p className="text-3xl font-black text-gray-900 mt-1">{total}</p>
                    <ListTodo className="mt-3 text-emerald-500" size={22} />
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all focus-within:ring-2 focus-within:ring-emerald-500/30">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Completadas</p>
                    <p className="text-3xl font-black text-emerald-600 mt-1">{completadas}</p>
                    <CheckCircle2 className="mt-3 text-emerald-500" size={22} />
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:border-amber-300 hover:shadow-md transition-all focus-within:ring-2 focus-within:ring-amber-500/30">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Pendientes</p>
                    <p className="text-3xl font-black text-amber-600 mt-1">{pendientes}</p>
                    <TrendingUp className="mt-3 text-amber-500" size={22} />
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:border-red-300 hover:shadow-md transition-all focus-within:ring-2 focus-within:ring-red-500/30">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Vencidas</p>
                    <p className="text-3xl font-black text-red-600 mt-1">{vencidas}</p>
                    <Clock className="mt-3 text-red-500" size={22} />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Avance general</h2>
                <p className="text-sm text-gray-500 mb-6">
                    Porcentaje de tareas principales marcadas como completadas.
                </p>
                <div className="space-y-4">
                    <div className="flex items-baseline justify-between gap-4">
                        <p className="text-sm text-gray-600">
                            <span className="font-semibold text-gray-900">{completadas}</span> de{" "}
                            <span className="font-semibold text-gray-900">{total}</span> tareas completadas
                        </p>
                        <span className="text-2xl font-black text-emerald-600 tabular-nums">{pct}%</span>
                    </div>
                    <div
                        className="h-4 rounded-full bg-gray-100 overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-emerald-500/40 focus-within:ring-offset-2"
                        role="progressbar"
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    >
                        <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                    {total === 0 && (
                        <p className="text-sm text-slate-500">
                            Crea tu primera tarea desde <strong className="text-slate-700">Hoy</strong>,{" "}
                            <strong className="text-slate-700">Formulario</strong> o el botón flotante.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
