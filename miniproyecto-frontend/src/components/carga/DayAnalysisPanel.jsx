import {
    AlertTriangle,
    Battery,
    BatteryLow,
    BatteryMedium,
    Brain,
    CalendarClock,
    CheckCircle2,
    Clock,
    PauseCircle,
    Sparkles,
    Star,
} from "lucide-react";
import { formatMinutos } from "../../helpers/cargaHelpers.js";

const NIVEL_META = {
    vacio: {
        label: "Sin tareas",
        Icon: Battery,
        wrap: "border-slate-200 bg-slate-50/70",
        chip: "bg-slate-200 text-slate-700",
        title: "text-slate-900",
        body: "text-slate-700",
    },
    subcarga: {
        label: "Subcarga (< 1 h)",
        Icon: BatteryLow,
        wrap: "border-sky-200 bg-sky-50/70",
        chip: "bg-sky-200 text-sky-900",
        title: "text-sky-900",
        body: "text-sky-900/85",
    },
    ok: {
        label: "Carga adecuada",
        Icon: CheckCircle2,
        wrap: "border-emerald-200 bg-emerald-50/70",
        chip: "bg-emerald-200 text-emerald-900",
        title: "text-emerald-900",
        body: "text-emerald-900/85",
    },
    warning: {
        label: "Cerca del tope",
        Icon: BatteryMedium,
        wrap: "border-amber-200 bg-amber-50/70",
        chip: "bg-amber-200 text-amber-900",
        title: "text-amber-900",
        body: "text-amber-900/85",
    },
    overload: {
        label: "Sobrecarga",
        Icon: AlertTriangle,
        wrap: "border-rose-200 bg-rose-50/80",
        chip: "bg-rose-200 text-rose-900",
        title: "text-rose-900",
        body: "text-rose-900/85",
    },
};

const TIPO_META = {
    priorizar: {
        label: "Priorizar",
        Icon: Star,
        chip: "bg-rose-100 text-rose-800 border-rose-200",
        wrap: "border-rose-200 bg-white",
        descripcion: "Hazlas primero: vencidas o de prioridad alta con entrega hoy.",
    },
    cambiar_horario: {
        label: "Cambiar de horario",
        Icon: Clock,
        wrap: "border-indigo-200 bg-white",
        chip: "bg-indigo-100 text-indigo-800 border-indigo-200",
        descripcion: "Alta carga mental + entrega cercana: prográmalas en tu mejor franja.",
    },
    posponer: {
        label: "Posponer",
        Icon: PauseCircle,
        wrap: "border-amber-200 bg-white",
        chip: "bg-amber-100 text-amber-800 border-amber-200",
        descripcion: "Baja prioridad sin entrega inmediata: pospón para liberar tiempo.",
    },
    reprogramar: {
        label: "Reprogramar a otro día",
        Icon: CalendarClock,
        wrap: "border-violet-200 bg-white",
        chip: "bg-violet-100 text-violet-800 border-violet-200",
        descripcion: "Hay cupo en otro día cercano: cambia la fecha planificada manualmente.",
    },
    opcional: {
        label: "Opcional para llenar el día",
        Icon: Sparkles,
        wrap: "border-sky-200 bg-white",
        chip: "bg-sky-100 text-sky-800 border-sky-200",
        descripcion: "Día con baja ocupación: tareas pendientes que podrías adelantar sin pasarte del límite.",
    },
};

const ORDEN_TIPOS = ["priorizar", "cambiar_horario", "posponer", "reprogramar", "opcional"];

const PRIORIDAD_LABEL = { ALTA: "Alta", MEDIA: "Media", BAJA: "Baja" };

function PriorityChip({ prioridad }) {
    const tone =
        prioridad === "ALTA"
            ? "bg-rose-100 text-rose-800 border-rose-200"
            : prioridad === "MEDIA"
              ? "bg-amber-100 text-amber-800 border-amber-200"
              : "bg-slate-100 text-slate-700 border-slate-200";
    return (
        <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tone}`}>
            Prioridad {PRIORIDAD_LABEL[prioridad] || prioridad || "—"}
        </span>
    );
}

function MentalChip({ valor }) {
    if (!valor) return null;
    const tone =
        valor >= 4
            ? "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200"
            : valor === 3
              ? "bg-indigo-100 text-indigo-800 border-indigo-200"
              : "bg-slate-100 text-slate-700 border-slate-200";
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tone}`}
            title={`Carga mental ${valor}/5`}
        >
            <Brain size={12} aria-hidden /> {valor}/5
        </span>
    );
}

export default function DayAnalysisPanel({ analisis, loading }) {
    if (loading && !analisis) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
                Calculando análisis del día…
            </div>
        );
    }
    if (!analisis) return null;

    const meta = NIVEL_META[analisis.nivel_carga] || NIVEL_META.ok;
    const Icon = meta.Icon;

    const recsPorTipo = ORDEN_TIPOS.map((tipo) => ({
        tipo,
        items: (analisis.recomendaciones || []).filter((r) => r.tipo === tipo),
    })).filter((g) => g.items.length > 0);

    const hayRecomendaciones = recsPorTipo.length > 0;
    const altoImpacto = analisis.tareas_alto_impacto_mental || [];

    return (
        <section
            className={`rounded-2xl border p-5 shadow-sm ${meta.wrap}`}
            aria-label="Análisis de carga diaria"
        >
            <header className="flex flex-wrap items-start gap-4">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${meta.chip}`}>
                    <Icon size={22} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className={`text-lg font-bold ${meta.title}`}>Análisis del día</h3>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold uppercase ${meta.chip}`}>
                            {meta.label}
                        </span>
                    </div>
                    <p className={`mt-1 text-sm ${meta.body}`}>{analisis.descripcion_estado}</p>
                </div>
            </header>

            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl bg-white/80 p-3 ring-1 ring-slate-200">
                    <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        Total programado
                    </dt>
                    <dd className="mt-1 text-base font-bold text-slate-900">
                        {analisis.total_horas} h
                        <span className="ml-1 text-xs font-medium text-slate-500">
                            ({formatMinutos(analisis.total_minutos)})
                        </span>
                    </dd>
                </div>
                <div className="rounded-xl bg-white/80 p-3 ring-1 ring-slate-200">
                    <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        Límite diario
                    </dt>
                    <dd className="mt-1 text-base font-bold text-slate-900">
                        {analisis.limite_horas} h
                        <span className="ml-1 text-xs font-medium text-slate-500">({analisis.pct_uso}%)</span>
                    </dd>
                </div>
                <div className="rounded-xl bg-white/80 p-3 ring-1 ring-slate-200">
                    <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        Mínimo recomendado
                    </dt>
                    <dd className="mt-1 text-base font-bold text-slate-900">
                        {analisis.minimo_recomendado_horas} h
                    </dd>
                </div>
                <div className="rounded-xl bg-white/80 p-3 ring-1 ring-slate-200">
                    <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        {analisis.exceso_minutos > 0 ? "Exceso" : "Disponible"}
                    </dt>
                    <dd className="mt-1 text-base font-bold text-slate-900">
                        {analisis.exceso_minutos > 0
                            ? formatMinutos(analisis.exceso_minutos)
                            : formatMinutos(analisis.minutos_disponibles)}
                    </dd>
                </div>
            </dl>

            {altoImpacto.length > 0 && (
                <div className="mt-5 rounded-xl border border-fuchsia-200 bg-fuchsia-50/60 p-3">
                    <p className="flex items-center gap-2 text-sm font-bold text-fuchsia-900">
                        <Brain size={16} aria-hidden /> Tareas con mayor impacto mental
                    </p>
                    <ul className="mt-2 space-y-1.5">
                        {altoImpacto.map((t) => (
                            <li
                                key={`mental-${t.id}`}
                                className="flex flex-wrap items-center justify-between gap-2 text-sm"
                            >
                                <span className="min-w-0 truncate font-medium text-slate-900">{t.nombre}</span>
                                <span className="flex shrink-0 flex-wrap items-center gap-1.5 text-xs text-slate-600">
                                    <MentalChip valor={t.carga_mental} />
                                    <PriorityChip prioridad={t.prioridad} />
                                    <span className="text-slate-500">
                                        · {formatMinutos(t.duracion_estimada_minutos)}
                                    </span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {hayRecomendaciones ? (
                <div className="mt-5 space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Recomendaciones (no se aplican automáticamente)
                    </p>
                    {recsPorTipo.map(({ tipo, items }) => {
                        const tmeta = TIPO_META[tipo];
                        const TIcon = tmeta.Icon;
                        return (
                            <article key={tipo} className={`rounded-xl border p-3 ${tmeta.wrap}`}>
                                <header className="flex flex-wrap items-center gap-2">
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${tmeta.chip}`}
                                    >
                                        <TIcon size={14} aria-hidden />
                                        {tmeta.label}
                                        <span className="ml-1 rounded-full bg-white/70 px-1.5 text-[11px] font-bold text-slate-700">
                                            {items.length}
                                        </span>
                                    </span>
                                    <p className="text-xs text-slate-600">{tmeta.descripcion}</p>
                                </header>
                                <ul className="mt-2 space-y-2">
                                    {items.map((r, idx) => (
                                        <li
                                            key={`${tipo}-${r.tarea_id}-${idx}`}
                                            className="rounded-lg border border-slate-100 bg-slate-50/70 p-3"
                                        >
                                            <div className="flex flex-wrap items-start justify-between gap-2">
                                                <p className="min-w-0 truncate font-semibold text-slate-900">
                                                    {r.nombre}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <PriorityChip prioridad={r.prioridad} />
                                                    <MentalChip valor={r.carga_mental} />
                                                    <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                                        {formatMinutos(r.duracion_estimada_minutos)}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="mt-1.5 text-sm text-slate-700">{r.motivo}</p>
                                            {(r.fecha_sugerida || r.fecha_actual) && (
                                                <p className="mt-1 text-[11px] font-medium text-slate-500">
                                                    {r.fecha_actual && (
                                                        <span>Planificada: {r.fecha_actual}</span>
                                                    )}
                                                    {r.fecha_actual && r.fecha_sugerida && " · "}
                                                    {r.fecha_sugerida && (
                                                        <span>Sugerida: {r.fecha_sugerida}</span>
                                                    )}
                                                </p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </article>
                        );
                    })}
                </div>
            ) : (
                <p className={`mt-4 text-sm ${meta.body}`}>
                    No hay recomendaciones específicas para este día. Mantén el plan actual y revisa el avance al
                    final del día.
                </p>
            )}
        </section>
    );
}
