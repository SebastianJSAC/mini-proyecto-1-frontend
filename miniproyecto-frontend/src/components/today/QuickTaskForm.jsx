import { CalendarDays, Brain, Sparkles, Plus, X } from "lucide-react";
import { useState } from "react";
import { useTask } from "../../hooks/useTask.js";

const inputClass =
    "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm placeholder:text-slate-400 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 hover:border-slate-300";

const labelClass = "block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1";

export default function QuickTaskForm({ API_URL, setTasks, obtenerTareas, onClose }) {
    const initialFormState = {
        nombre: "",
        descripcion: "",
        fecha_entrega: "",
        carga_mental: "",
        tipo_tarea: "OT",
        curso: "",
    };

    const [form, setForm] = useState(initialFormState);
    const [tempSubtasks, setTempSubtasks] = useState([]);
    const [currentSubtaskInput, setCurrentSubtaskInput] = useState("");

    const { handleAddTask } = useTask(null, setTasks, API_URL);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const addSubtaskToTempList = () => {
        if (!currentSubtaskInput.trim()) return;
        setTempSubtasks([...tempSubtasks, currentSubtaskInput.trim()]);
        setCurrentSubtaskInput("");
    };

    const onSave = async () => {
        if (!form.nombre.trim()) return;

        const taskData = {
            ...form,
            fecha_entrega: form.fecha_entrega ? new Date(form.fecha_entrega).toISOString() : null,
            carga_mental: form.carga_mental ? Number(form.carga_mental) : null,
        };

        const success = await handleAddTask(taskData, tempSubtasks);

        if (success) {
            setForm(initialFormState);
            setTempSubtasks([]);
            if (typeof obtenerTareas === "function") await obtenerTareas();
            if (onClose) onClose();
        }
    };

    const isInvalid =
        !form.nombre.trim() ||
        !form.descripcion.trim() ||
        !form.fecha_entrega ||
        !form.carga_mental ||
        !form.curso.trim();

    return (
        <div className="space-y-4">
            <h1 id="quick-task-title" className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight pr-10">
                Nueva tarea
            </h1>

            <div>
                <label htmlFor="qt-nombre" className={labelClass}>
                    Título
                </label>
                <input
                    id="qt-nombre"
                    name="nombre"
                    type="text"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="¿Qué tarea quieres agregar?"
                    className={inputClass}
                />
            </div>

            <div>
                <label htmlFor="qt-desc" className={labelClass}>
                    Descripción
                </label>
                <textarea
                    id="qt-desc"
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    placeholder="Descripción"
                    maxLength={100}
                    rows={2}
                    className={`${inputClass} resize-none min-h-[72px]`}
                />
                <div className="text-right text-xs text-slate-400 mt-1">{100 - form.descripcion.length} restantes</div>
            </div>

            <div>
                <span className={labelClass}>Subtareas</span>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={currentSubtaskInput}
                        onChange={(e) => setCurrentSubtaskInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                addSubtaskToTempList();
                            }
                        }}
                        placeholder="Añadir subtarea"
                        className={inputClass}
                    />
                    <button
                        type="button"
                        onClick={addSubtaskToTempList}
                        className="shrink-0 px-4 py-3 rounded-2xl border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                        aria-label="Añadir subtarea"
                    >
                        <Plus size={20} />
                    </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                    {tempSubtasks.map((sub, idx) => (
                        <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-700"
                        >
                            {sub}
                            <button
                                type="button"
                                className="p-0.5 rounded text-slate-500 hover:text-red-600 outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                                onClick={() => setTempSubtasks(tempSubtasks.filter((_, i) => i !== idx))}
                                aria-label={`Quitar ${sub}`}
                            >
                                <X size={14} />
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="qt-fecha" className={labelClass}>
                        Fecha de entrega
                    </label>
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all">
                        <CalendarDays size={18} className="text-slate-400 shrink-0" />
                        <input
                            id="qt-fecha"
                            name="fecha_entrega"
                            type="datetime-local"
                            value={form.fecha_entrega}
                            onChange={handleChange}
                            className="bg-transparent text-sm w-full outline-none text-slate-800"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="qt-tipo" className={labelClass}>
                        Tipo de tarea
                    </label>
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all">
                        <Sparkles size={18} className="text-slate-400 shrink-0" />
                        <select
                            id="qt-tipo"
                            name="tipo_tarea"
                            value={form.tipo_tarea}
                            onChange={handleChange}
                            className="bg-transparent text-sm w-full outline-none text-slate-800 cursor-pointer"
                        >
                            <option value="EX">Examen</option>
                            <option value="QU">Quiz</option>
                            <option value="TA">Taller</option>
                            <option value="PR">Proyecto</option>
                            <option value="OT">Otro</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="qt-curso" className={labelClass}>
                        Curso / materia
                    </label>
                    <input
                        id="qt-curso"
                        name="curso"
                        type="text"
                        value={form.curso}
                        onChange={handleChange}
                        placeholder="Nombre del curso"
                        className={inputClass}
                    />
                </div>

                <div>
                    <label htmlFor="qt-carga" className={labelClass}>
                        Carga mental
                    </label>
                    <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all">
                        <Brain size={18} className="text-slate-400 shrink-0" />
                        <select
                            id="qt-carga"
                            name="carga_mental"
                            value={form.carga_mental}
                            onChange={handleChange}
                            className="bg-transparent text-sm w-full outline-none text-slate-800 cursor-pointer"
                        >
                            <option value="">Selecciona</option>
                            <option value="1">1 — Muy baja</option>
                            <option value="2">2 — Baja</option>
                            <option value="3">3 — Media</option>
                            <option value="4">4 — Alta</option>
                            <option value="5">5 — Muy alta</option>
                        </select>
                    </div>
                </div>
            </div>

            <button
                type="button"
                onClick={onSave}
                disabled={isInvalid}
                className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/40 focus-visible:ring-offset-2 ${
                    isInvalid
                        ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                        : "bg-emerald-600 text-white border border-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200/60 active:scale-[0.99]"
                }`}
            >
                Crear tarea
            </button>
        </div>
    );
}
