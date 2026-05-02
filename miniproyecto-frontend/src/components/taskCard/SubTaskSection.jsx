import { StickyNote } from "lucide-react";

// --- SECCIÓN DE SUBTAREAS ---
// Cada subtarea soporta tres estados visuales: pendiente, completada y pospuesta.
// "Pospuesta" se muestra con badge ámbar y la nota debajo (si existe).
export const SubtaskSection = ({
    subtareas,
    subtaskInput,
    setSubtaskInput,
    onAdd,
    onToggle,
    onPosponer,
}) => {
    // Conteo X/Y de avance considerando solo activas (no pospuestas) como denominador
    const total = subtareas.length;
    const activas = subtareas.filter((s) => !s.pospuesta);
    const completadas = activas.filter((s) => s.completada).length;
    const denominador = activas.length;

    return (
        <div className="space-y-2 ml-6 pt-3 border-t border-gray-50">
            {total > 0 && (
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <span>
                        Avance: <span className="text-slate-800">{completadas}/{denominador}</span>
                        {total !== denominador && (
                            <span className="ml-1 text-amber-700 normal-case font-semibold">
                                · {total - denominador} pospuesta(s)
                            </span>
                        )}
                    </span>
                </div>
            )}

            {total > 0 ? (
                subtareas.map((sub) => {
                    const isPospuesta = !!sub.pospuesta;
                    const isCompleta = !!sub.completada;
                    return (
                        <div
                            key={sub.id}
                            className={`flex flex-col gap-1 text-sm border px-3 py-2 rounded-lg ${isPospuesta ? "bg-amber-50/70 border-amber-200" : "bg-gray-50 border-gray-200"}`}
                        >
                            <div className="flex items-center gap-2">
                                {/* Estado completada / pendiente */}
                                <button
                                    type="button"
                                    onClick={() => onToggle(sub)}
                                    disabled={isPospuesta}
                                    title={isPospuesta ? "Reanúdala para completarla" : isCompleta ? "Marcar pendiente" : "Marcar completada"}
                                    className={`px-2 py-0.5 rounded text-[10px] font-black transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-1 ${isCompleta ? "bg-green-200 text-green-800" : "bg-white text-slate-400 border"} ${isPospuesta ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    {isCompleta ? "✓" : "○"}
                                </button>

                                <span
                                    className={`flex-1 ${isCompleta ? "line-through text-gray-400" : isPospuesta ? "text-amber-900/80" : "text-gray-700"}`}
                                >
                                    {sub.nombre}
                                </span>

                                {/* Badge de estado pospuesta */}
                                {isPospuesta && (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold uppercase">
                                        Pospuesta
                                    </span>
                                )}

                                {/* Posponer / reanudar */}
                                {onPosponer && !isCompleta && (
                                    <button
                                        type="button"
                                        onClick={() => onPosponer(sub)}
                                        title={isPospuesta ? "Reanudar subtarea" : "Posponer con una nota"}
                                        className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-black uppercase tracking-wide transition-colors outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-1 ${isPospuesta ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100" : "border-amber-200 bg-white text-amber-800 hover:bg-amber-50"}`}
                                    >
                                        {isPospuesta ? "Reanudar" : "Posponer"}
                                    </button>
                                )}
                            </div>

                            {/* Nota de posposición */}
                            {isPospuesta && sub.nota_posponer && (
                                <div className="flex items-start gap-1.5 text-[11px] text-amber-900/90 pl-7">
                                    <StickyNote size={11} className="mt-0.5 shrink-0" aria-hidden />
                                    <span className="italic">{sub.nota_posponer}</span>
                                </div>
                            )}
                        </div>
                    );
                })
            ) : (
                <p className="text-xs text-gray-400 italic">No hay subtareas pendientes.</p>
            )}

            <div className="flex gap-2 mt-4">
                <input
                    value={subtaskInput}
                    onChange={(e) => setSubtaskInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onAdd()}
                    placeholder="Añadir subtarea..."
                    className="flex-1 px-3 py-1.5 border rounded-lg text-sm outline-none focus:border-emerald-500"
                />
                <button
                    onClick={onAdd}
                    disabled={!subtaskInput.trim()}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold ${!subtaskInput.trim() ? "bg-gray-200" : "bg-emerald-600 text-white"}`}
                >
                    +
                </button>
            </div>
        </div>
    );
};
