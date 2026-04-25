import { BookOpen, Trash2, Edit2, CalendarDays, Clock, Timer, Flag } from "lucide-react";
import { getTiempoRestante, formatDuracionEstimadaHoras } from "../../helpers/taskHelpers.js";

// --- VISTA DE LECTURA ---
export const TaskView = ({
    tarea,
    onEdit,
    onDelete,
    onToggleComplete,
    onToggleOpen,
    isOpen,
    getMentalLoadConfig,
    formatearFecha,
    verticalLayout = false,
    compact = false,
    onDetailsClick,
}) => {
    const tipoLabels = { 'EX': 'Examen', 'QU': 'Quiz', 'TA': 'Taller', 'PR': 'Proyecto', 'OT': 'Otro' };
    const prioridadLabels = { BAJA: "Prioridad baja", MEDIA: "Prioridad media", ALTA: "Prioridad alta" };

    //Calcular tiempo restante
    const tiempo = getTiempoRestante(tarea.fecha_entrega);

    const completeBtn = (
        <button
            type="button"
            onClick={onToggleComplete}
            className={`px-3 py-1.5 rounded-md text-xs font-bold flex-shrink-0 transition-colors border border-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${tarea.completada ? "bg-green-100 text-green-700 border-green-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:border-slate-300"}`}
        >
            {tarea.completada ? "Completada" : "○ Pendiente"}
        </button>
    );

    const actionButtons = (
        <div className="flex gap-1 flex-shrink-0">
            <button type="button" onClick={onEdit} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"><Edit2 size={16}/></button>
            <button type="button" onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1"><Trash2 size={16}/></button>
            <button type="button" onClick={onToggleOpen} className="text-xs font-medium text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg transition-colors border border-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-1">
                {isOpen ? "Contraer" : "Detalle"}
            </button>
        </div>
    );

    const details = (
        <div className={verticalLayout ? "w-full min-w-0" : "flex-1"}>
            <div className={`flex flex-wrap items-center gap-2 ${compact ? "mb-0.5" : "mb-1"}`}>
                <h3 className={`${compact ? "text-base" : "text-lg"} font-semibold leading-snug ${tarea.completada ? "line-through text-gray-400" : "text-gray-900"}`}>
                    {tarea.nombre}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold uppercase">
                    {tipoLabels[tarea.tipo_tarea] || 'Otro'}
                </span>
                {tarea.curso && (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-medium flex items-center gap-1">
                        <BookOpen size={10}/> {tarea.curso}
                    </span>
                )}
                {tarea.carga_mental && (
                    <span
                        className={`px-2 py-0.5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 flex-shrink-0 ${getMentalLoadConfig(tarea.carga_mental).chip}`}
                    >
                        {getMentalLoadConfig(tarea.carga_mental).label}
                    </span>
                )}
                {tarea.duracion_estimada_minutos != null && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold uppercase flex items-center gap-1">
                        <Timer size={10} aria-hidden />
                        {formatDuracionEstimadaHoras(tarea.duracion_estimada_minutos)}
                    </span>
                )}
                {tarea.prioridad && (
                    <span
                        className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100 text-[10px] font-bold uppercase flex items-center gap-1"
                        title={prioridadLabels[tarea.prioridad] || tarea.prioridad}
                    >
                        <Flag size={10} aria-hidden />
                        {tarea.prioridad}
                    </span>
                )}
            </div>

            {tarea.descripcion && <p className="text-sm text-gray-500 line-clamp-2">{tarea.descripcion}</p>}

            <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <CalendarDays className="w-3 h-3 shrink-0"/>
                Entrega: {formatearFecha(tarea.fecha_entrega)}
            </div>

            {tiempo && !tarea.completada && (
                <div className={`mt-2.5 w-fit flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border shadow-sm ${tiempo.color}`}>
                    <Clock size={12} strokeWidth={2.5}/>
                    {tiempo.texto}
                </div>
            )}
        </div>
    );

    const detailsInteractive = onDetailsClick ? (
        <div
            role="button"
            tabIndex={0}
            onClick={onDetailsClick}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onDetailsClick();
                }
            }}
            className={`min-w-0 rounded-lg px-1 py-0.5 -mx-1 outline-none transition-colors hover:bg-slate-50/90 focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${!isOpen ? "cursor-pointer" : "cursor-default"}`}
            aria-expanded={isOpen}
            aria-label={isOpen ? "Contenido de la tarea" : "Expandir tarjeta y ver subtareas"}
        >
            {details}
        </div>
    ) : (
        details
    );

    if (verticalLayout) {
        return (
            <div className={`flex flex-col w-full ${compact ? "gap-3" : "gap-4"}`}>
                <div className={`flex flex-wrap items-center justify-between ${compact ? "gap-2" : "gap-3"}`}>
                    {completeBtn}
                    {actionButtons}
                </div>
                {detailsInteractive}
            </div>
        );
    }

    return (
        <div className="flex items-start gap-3">
            <div className="mt-1">{completeBtn}</div>
            {detailsInteractive}
            {actionButtons}
        </div>
    );
};