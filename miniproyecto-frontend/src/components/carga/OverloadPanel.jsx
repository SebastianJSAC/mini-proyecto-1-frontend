import { AlertTriangle, CalendarClock, Sparkles, ChevronRight } from "lucide-react";
import { formatMinutos } from "../../helpers/cargaHelpers.js";

export default function OverloadPanel({
    resumen,
    recomendacionesPayload,
    loadingRecs,
    onRefreshRecs,
    onApplyAll,
    onApplyOne,
    applying,
}) {
    if (!resumen || resumen.estado_carga !== "overload") return null;

    const recs = recomendacionesPayload?.recomendaciones ?? [];
    const metricas = recomendacionesPayload?.metricas_tras_aplicar_todas;

    return (
        <div
            className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 shadow-sm"
            role="region"
            aria-live="polite"
            aria-label="Sobrecarga del día y sugerencias"
        >
            <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                    <AlertTriangle size={22} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-rose-900">Sobrecarga detectada</h3>
                    <p className="mt-1 text-sm text-rose-800/90">
                        Hoy sumas <strong>{formatMinutos(resumen.total_minutos_planificados)}</strong> planificados
                        y tu límite es <strong>{formatMinutos(resumen.limite_minutos)}</strong>. Eso puede
                        afectar el cumplimiento si no repartes el trabajo.
                    </p>
                    <p className="mt-2 text-sm text-rose-900/80">
                        Puedes <strong>mover tareas sugeridas</strong> a días con cupo o ajustar manualmente la
                        fecha planificada en cada tarea.
                    </p>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={onRefreshRecs}
                    disabled={loadingRecs}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-rose-800 shadow-sm ring-1 ring-rose-200 transition hover:bg-rose-50 disabled:opacity-60 outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
                >
                    <Sparkles size={18} aria-hidden />
                    {loadingRecs ? "Generando…" : "Actualizar sugerencias"}
                </button>
                {recs.length > 0 && (
                    <button
                        type="button"
                        onClick={onApplyAll}
                        disabled={applying}
                        className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-rose-700 disabled:opacity-60 outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
                    >
                        <CalendarClock size={18} aria-hidden />
                        {applying ? "Aplicando…" : `Aplicar ${recs.length} movimientos sugeridos`}
                    </button>
                )}
            </div>

            {metricas && recs.length > 0 && (
                <p className="mt-3 text-xs text-rose-900/70">
                    Tras aplicar todas las sugerencias listadas: ~{formatMinutos(metricas.total_minutos)} en este
                    día (estado: {metricas.estado_carga}).
                </p>
            )}

            {recs.length > 0 && (
                <ul className="mt-4 space-y-2">
                    {recs.map((r) => (
                        <li
                            key={r.tarea_id}
                            className="flex flex-col gap-2 rounded-xl border border-rose-100 bg-white/90 p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="min-w-0">
                                <p className="font-semibold text-slate-900">{r.nombre}</p>
                                <p className="text-xs text-slate-600">{r.motivo_texto}</p>
                                <p className="mt-1 text-xs font-medium text-slate-500">
                                    {formatMinutos(r.duracion_estimada_minutos)} · Impacto entrega:{" "}
                                    <span className="uppercase">{r.impacto_entrega}</span>
                                </p>
                            </div>
                            <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
                                <span className="text-xs text-slate-500">
                                    → {r.fecha_sugerida}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => onApplyOne(r)}
                                    disabled={applying}
                                    className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-50 disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-1"
                                >
                                    Mover solo esta
                                    <ChevronRight size={14} aria-hidden />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {!loadingRecs && recs.length === 0 && (
                <p className="mt-3 text-sm text-rose-800/80">
                    Pulsa «Actualizar sugerencias» para que el sistema proponga qué mover según prioridad, tipo y
                    fecha de entrega.
                </p>
            )}
        </div>
    );
}
