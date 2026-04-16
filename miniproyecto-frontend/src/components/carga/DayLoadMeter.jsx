import { formatMinutos } from "../../helpers/cargaHelpers.js";

export default function DayLoadMeter({ resumen, onAdjustLimit }) {
    if (!resumen) return null;

    const { limite_minutos, total_minutos_planificados, estado_carga, pct_uso, advertencia_umbral_pct } =
        resumen;
    const pctVisual = limite_minutos > 0 ? Math.min(100, (100 * total_minutos_planificados) / limite_minutos) : 0;

    let barColor = "bg-emerald-500";
    if (estado_carga === "warning") barColor = "bg-amber-500";
    if (estado_carga === "overload") barColor = "bg-rose-500";

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Carga de hoy</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                        {formatMinutos(total_minutos_planificados)} de {formatMinutos(limite_minutos)}
                    </p>
                    <p className="text-xs text-slate-500">
                        {estado_carga === "ok" && `Dentro del límite (${pct_uso}% usado).`}
                        {estado_carga === "warning" &&
                            `Cerca del tope: ${pct_uso}% (aviso desde ${advertencia_umbral_pct}%).`}
                        {estado_carga === "overload" &&
                            `Sobrecarga: ${formatMinutos(resumen.exceso_minutos)} por encima del límite.`}
                    </p>
                </div>
                {onAdjustLimit && (
                    <button
                        type="button"
                        onClick={onAdjustLimit}
                        className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                    >
                        Ajustar límite
                    </button>
                )}
            </div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuemin={0} aria-valuemax={limite_minutos} aria-valuenow={total_minutos_planificados}>
                <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${pctVisual}%` }}
                />
            </div>
        </div>
    );
}
