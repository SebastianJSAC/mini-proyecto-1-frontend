import { useOutletContext } from "react-router-dom";
import { ListTodo, ChevronDown, ChevronUp, Info, PauseCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import TasksView from "./TasksView.jsx";
import DayLoadMeter from "../carga/DayLoadMeter.jsx";
import OverloadPanel from "../carga/OverloadPanel.jsx";
import { fechaPlanTarea, toYMDLocal } from "../../helpers/cargaHelpers.js";
import { mostrarToast } from "../../helpers/taskHelpers.js";
import {
    actualizarCargaConfig,
    obtenerCargaConfig,
    obtenerRecomendacionesDia,
    obtenerResumenDia,
    obtenerTareas as fetchTareasList,
    reprogramarTareasDia,
} from "../../services/taskService.js";

const prioridadTooltip =
    "Orden: tareas vencidas primero, luego próximas fechas. Para hoy, en empate por fecha se muestra antes la de menor carga mental.";

export default function HoyView() {
    const { tasks, setTasks, API_URL, openCreateTaskModal } = useOutletContext();
    const [isHoyExpanded, setIsHoyExpanded] = useState(true);
    const [isPospExpanded, setIsPospExpanded] = useState(true);

    const hoy = new Date();
    const todayStr = toYMDLocal(hoy);

    const [resumen, setResumen] = useState(null);
    const [recPayload, setRecPayload] = useState(null);
    const [loadingRecs, setLoadingRecs] = useState(false);
    const [applying, setApplying] = useState(false);
    const [showLimit, setShowLimit] = useState(false);
    const [limiteHoras, setLimiteHoras] = useState(6);

    const reloadTasks = useCallback(async () => {
        if (!API_URL) return;
        try {
            const data = await fetchTareasList(API_URL);
            if (Array.isArray(data)) setTasks(data);
        } catch (e) {
            console.error(e);
        }
    }, [API_URL, setTasks]);

    const loadResumen = useCallback(async () => {
        if (!API_URL) return;
        try {
            const r = await obtenerResumenDia(API_URL, todayStr);
            setResumen(r);
        } catch (e) {
            console.error(e);
            setResumen(null);
        }
    }, [API_URL, todayStr]);

    useEffect(() => {
        loadResumen();
    }, [loadResumen, tasks]);

    const loadRecomendaciones = useCallback(async () => {
        if (!API_URL) return;
        setLoadingRecs(true);
        try {
            const data = await obtenerRecomendacionesDia(API_URL, todayStr, {});
            setRecPayload(data);
        } catch {
            mostrarToast("No se pudieron cargar las sugerencias", "error");
        } finally {
            setLoadingRecs(false);
        }
    }, [API_URL, todayStr]);

    useEffect(() => {
        if (resumen?.estado_carga === "overload") {
            loadRecomendaciones();
        } else {
            setRecPayload(null);
        }
    }, [resumen?.estado_carga, loadRecomendaciones]);

    useEffect(() => {
        if (!showLimit || !API_URL) return;
        (async () => {
            try {
                const cfg = await obtenerCargaConfig(API_URL);
                const mins = Math.min(360, Math.max(30, cfg.limite_minutos_diario || 360));
                setLimiteHoras(mins / 60);
            } catch {
                setLimiteHoras(6);
            }
        })();
    }, [showLimit, API_URL]);

    const guardarLimite = async () => {
        if (!API_URL) return;
        const raw = Number(limiteHoras);
        if (Number.isNaN(raw) || raw < 0.5 || raw > 6) {
            mostrarToast("Indica entre 0,5 y 6 horas. El máximo permitido es 6 h por día.", "error");
            return;
        }
        const minutos = Math.round(raw * 60);
        if (minutos < 30) {
            mostrarToast("El límite mínimo es 30 minutos (0,5 h).", "error");
            return;
        }
        if (minutos > 360) {
            mostrarToast("El límite máximo es 6 horas (360 minutos).", "error");
            return;
        }
        try {
            await actualizarCargaConfig(API_URL, { limite_minutos_diario: minutos });
            mostrarToast("Límite diario actualizado", "success");
            setShowLimit(false);
            await loadResumen();
        } catch (e) {
            mostrarToast(e.message || "No se pudo guardar el límite", "error");
        }
    };

    const applyMovs = async (movimientos) => {
        if (!API_URL || !movimientos.length) return;
        setApplying(true);
        try {
            await reprogramarTareasDia(API_URL, todayStr, movimientos);
            mostrarToast(`Se reprogramaron ${movimientos.length} tarea(s).`, "success");
            await reloadTasks();
            await loadResumen();
        } catch (e) {
            mostrarToast(e.message || "Error al reprogramar", "error");
        } finally {
            setApplying(false);
        }
    };

    const onApplyAll = () => {
        const recs = recPayload?.recomendaciones ?? [];
        if (!recs.length) return;
        const movimientos = recs.map((r) => ({
            tarea_id: r.tarea_id,
            nueva_fecha_planificada: r.fecha_sugerida,
        }));
        applyMovs(movimientos);
    };

    const onApplyOne = (r) => {
        applyMovs([{ tarea_id: r.tarea_id, nueva_fecha_planificada: r.fecha_sugerida }]);
    };

    const filterHoy = (t) => {
        if (t.completada) return false;
        // Tareas pospuestas no aparecen en hoy hasta que se reanuden
        if (t.pospuesta) return false;
        if (t.parent != null) return false;
        const fp = fechaPlanTarea(t);
        return fp === todayStr;
    };

    const getPrioridad = (t) => {
        if (!t.fecha_entrega) return 3;
        const fecha = new Date(t.fecha_entrega);
        const esHoy =
            fecha.getDate() === hoy.getDate() &&
            fecha.getMonth() === hoy.getMonth() &&
            fecha.getFullYear() === hoy.getFullYear();
        if (fecha < hoy) return 0;
        if (esHoy) return 1;
        return 2;
    };

    const tareasHoy = tasks
        .filter(filterHoy)
        .sort((a, b) => {
            const pA = getPrioridad(a);
            const pB = getPrioridad(b);
            if (pA !== pB) return pA - pB;
            return (a.carga_mental ?? 999) - (b.carga_mental ?? 999);
        });

    /** Raíces pospuestas cuya fecha planificada efectiva es hoy: salieron de «Hoy» y se listan aquí. */
    const filterPospuestasHoy = (t) => {
        if (t.completada) return false;
        if (t.parent != null) return false;
        if (!t.pospuesta) return false;
        const fp = fechaPlanTarea(t);
        return fp === todayStr;
    };

    const tareasPospuestasHoy = tasks
        .filter(filterPospuestasHoy)
        .sort((a, b) => {
            const pA = getPrioridad(a);
            const pB = getPrioridad(b);
            if (pA !== pB) return pA - pB;
            return (a.carga_mental ?? 999) - (b.carga_mental ?? 999);
        });

    const showMainHoy = tareasHoy.length > 0;
    const showPospuestas = tareasPospuestasHoy.length > 0;

    const cargaBloque = (
        <>
            <DayLoadMeter resumen={resumen} onAdjustLimit={() => setShowLimit((s) => !s)} />
            {showLimit && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-800">Límite de trabajo por día</p>
                    <p className="mt-1 text-xs text-slate-600">
                        Máximo <strong>6 horas</strong> por día (regla del producto). Mínimo 0,5 h (30 min).
                    </p>
                    <div className="mt-3 flex flex-wrap items-end gap-3">
                        <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                            Horas
                            <input
                                type="number"
                                min={0.5}
                                max={6}
                                step={0.5}
                                value={limiteHoras}
                                onChange={(e) => setLimiteHoras(e.target.value)}
                                className="w-28 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                            />
                        </label>
                        <button
                            type="button"
                            onClick={guardarLimite}
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                        >
                            Guardar
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowLimit(false)}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
            <OverloadPanel
                resumen={resumen}
                recomendacionesPayload={recPayload}
                loadingRecs={loadingRecs}
                onRefreshRecs={loadRecomendaciones}
                onApplyAll={onApplyAll}
                onApplyOne={onApplyOne}
                applying={applying}
            />
        </>
    );

    if (!showMainHoy && !showPospuestas) {
        return (
            <div className="mx-auto w-full max-w-3xl space-y-6">
                {cargaBloque}
                <div className="flex min-h-[40vh] w-full flex-col items-center justify-center px-6 text-center">
                    <div
                        className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-100 text-emerald-700 shadow-sm"
                        aria-hidden
                    >
                        <ListTodo size={36} strokeWidth={2} />
                    </div>
                    <p className="mt-8 text-lg font-semibold text-slate-800">No hay tareas planificadas para hoy.</p>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                        Las tareas aparecen aquí según su <strong>fecha planificada</strong> o, si no tienes una, la
                        fecha de entrega. Añade duración estimada al crear tareas para que la barra de carga sea
                        precisa.
                    </p>
                    <button
                        type="button"
                        onClick={() => openCreateTaskModal?.()}
                        className="mt-8 inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200/80 outline-none transition-all hover:bg-emerald-700 focus-visible:ring-4 focus-visible:ring-emerald-400/40 focus-visible:ring-offset-2 active:scale-[0.98]"
                    >
                        Crear tarea
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-3xl space-y-6">
            {cargaBloque}

            {!showMainHoy && showPospuestas && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-5 py-4 text-center text-sm text-slate-600">
                    No tienes tareas activas en la lista de hoy. Las que pospusiste para esta fecha aparecen en la
                    sección siguiente; no cuentan para la barra de carga ni para las sugerencias de sobrecarga.
                </div>
            )}

            {showMainHoy && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-6">
                        <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
                            <button
                                type="button"
                                onClick={() => setIsHoyExpanded(!isHoyExpanded)}
                                className="-m-2 flex min-w-0 flex-1 items-center gap-4 rounded-xl p-2 text-left outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                            >
                                <div className="shrink-0 rounded-lg border border-emerald-200 bg-emerald-100 p-2 text-emerald-700">
                                    <ListTodo size={20} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-xl font-bold text-slate-900">Tareas para hoy</h2>
                                    <p className="text-sm text-slate-500">
                                        {tareasHoy.length}{" "}
                                        {tareasHoy.length === 1 ? "tarea pendiente" : "tareas pendientes"}
                                    </p>
                                </div>
                                {isHoyExpanded ? (
                                    <ChevronUp className="shrink-0 text-slate-400" aria-hidden />
                                ) : (
                                    <ChevronDown className="shrink-0 text-slate-400" aria-hidden />
                                )}
                            </button>
                            <button
                                type="button"
                                className="shrink-0 rounded-xl border border-transparent p-2 text-slate-400 outline-none transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                                title={prioridadTooltip}
                                aria-label="Cómo priorizamos las tareas"
                            >
                                <Info size={20} aria-hidden />
                            </button>
                        </div>
                    </div>

                    {isHoyExpanded && (
                        <div className="border-t border-slate-100 bg-slate-50/40 p-6">
                            <TasksView tasks={tareasHoy} setTasks={setTasks} API_URL={API_URL} embedded />
                        </div>
                    )}
                </div>
            )}

            {showPospuestas && (
                <div className="overflow-hidden rounded-2xl border border-amber-200/90 bg-amber-50/30 shadow-sm">
                    <button
                        type="button"
                        onClick={() => setIsPospExpanded(!isPospExpanded)}
                        className="flex w-full items-center justify-between gap-4 border-b border-amber-100/80 bg-amber-50/50 p-6 text-left outline-none transition-colors hover:bg-amber-50/80 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
                    >
                        <div className="flex min-w-0 flex-1 items-center gap-4">
                            <div className="shrink-0 rounded-lg border border-amber-200 bg-amber-100 p-2 text-amber-800">
                                <PauseCircle size={20} aria-hidden />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-xl font-bold text-slate-900">Tareas pospuestas (hoy)</h2>
                                <p className="text-sm text-amber-900/80">
                                    {tareasPospuestasHoy.length}{" "}
                                    {tareasPospuestasHoy.length === 1
                                        ? "tarea en pausa"
                                        : "tareas en pausa"}{" "}
                                    · no suman a la carga del día
                                </p>
                            </div>
                        </div>
                        {isPospExpanded ? (
                            <ChevronUp className="shrink-0 text-amber-700/70" aria-hidden />
                        ) : (
                            <ChevronDown className="shrink-0 text-amber-700/70" aria-hidden />
                        )}
                    </button>

                    {isPospExpanded && (
                        <div className="border-t border-amber-100 bg-white/70 p-6">
                            <TasksView
                                tasks={tareasPospuestasHoy}
                                setTasks={setTasks}
                                API_URL={API_URL}
                                embedded
                            />
                        </div>
                    )}
                </div>
            )}

            {!showMainHoy && showPospuestas && (
                <div className="flex justify-center pb-4">
                    <button
                        type="button"
                        onClick={() => openCreateTaskModal?.()}
                        className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                    >
                        Crear tarea
                    </button>
                </div>
            )}
        </div>
    );
}
