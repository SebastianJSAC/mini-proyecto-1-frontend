import { BookOpen, Trash2, Edit2, CalendarDays, Clock } from "lucide-react";
import {getTiempoRestante} from "../../helpers/taskHelpers.js";

// --- VISTA DE LECTURA ---
export const TaskView = ({ tarea, onEdit, onDelete, onToggleComplete, onToggleOpen, isOpen, getMentalLoadConfig, formatearFecha }) => {
    const tipoLabels = { 'EX': 'Examen', 'QU': 'Quiz', 'TA': 'Taller', 'PR': 'Proyecto', 'OT': 'Otro' };

    //Calcular tiempo restante
    const tiempo = getTiempoRestante(tarea.fecha_entrega);

    return (
        <div className="flex items-start gap-3">
            <button onClick={onToggleComplete}
                    className={`mt-1 px-3 py-1 rounded-md text-xs font-bold flex-shrink-0 transition-colors ${tarea.completada ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {tarea.completada ? "Completada" : "○ Pendiente"}
            </button>

            <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className={`text-lg font-medium leading-tight ${tarea.completada ? "line-through text-gray-400" : "text-gray-900"}`}>
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
                        <span className={`px-2 py-0.5 rounded-full flex items-center justify-center text-[10px] font-bold border flex-shrink-0 ${getMentalLoadConfig(tarea.carga_mental).color}`}>
                            {getMentalLoadConfig(tarea.carga_mental).label}
                        </span>
                    )}
                </div>

                {tarea.descripcion && <p className="text-sm text-gray-500 line-clamp-2">{tarea.descripcion}</p>}

                <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-medium">
                    <CalendarDays className="w-3 h-3"/>
                    Entrega: {formatearFecha(tarea.fecha_entrega)}
                </div>

                {/* Tiempo restante de tarea - Con separación y colores dinámicos */}
                {tiempo && !tarea.completada && (
                    <div className={`mt-2.5 w-fit flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border shadow-sm ${tiempo.color}`}>
                        <Clock size={12} strokeWidth={2.5}/>
                        {tiempo.texto}
                    </div>
                )}
            </div>

            <div className="flex gap-1 flex-shrink-0">
                <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16}/></button>
                <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                <button onClick={onToggleOpen} className="text-xs font-medium text-gray-400 hover:text-gray-600 px-2 py-1 transition-colors">
                    {isOpen ? "Contraer" : "Detalle"}
                </button>
            </div>
        </div>
    );
};