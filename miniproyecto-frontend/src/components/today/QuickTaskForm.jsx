import {CalendarDays, Brain, Sparkles, Plus, X, CheckCircleIcon} from "lucide-react";
import {useState} from "react";
import {mostrarToast} from '../../helpers/taskHelpers.js'
import {useTask} from "../../hooks/useTask.js";

export default function QuickTaskForm({API_URL, setTasks, obtenerTareas, navigate, onClose}) {

    const initialFormState = {
        nombre: "",
        descripcion: "",
        fecha_entrega: "",
        carga_mental: "",
        tipo_tarea: "OT",
        curso: ""
    };

    const [form, setForm] = useState(initialFormState);
    const [tempSubtasks, setTempSubtasks] = useState([]);
    const [currentSubtaskInput, setCurrentSubtaskInput] = useState("");

    const fechaISO = form.fecha_entrega ? new Date(form.fecha_entrega).toISOString() : null;
    const {handleAddTask} = useTask(null, setTasks, API_URL);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const addSubtaskToTempList = () => {
        if (!currentSubtaskInput.trim()) return;

        setTempSubtasks([...tempSubtasks, currentSubtaskInput.trim()]);
        setCurrentSubtaskInput("");
    };

    const onSave = async (keepOpen = false) => {
        if (!form.nombre.trim()) return;

        // Formateamos los datos justo antes de enviar
        const taskData = {
            ...form,
            fecha_entrega: form.fecha_entrega ? new Date(form.fecha_entrega).toISOString() : null,
            carga_mental: form.carga_mental ? Number(form.carga_mental) : null
        };

        const success = await handleAddTask(taskData, tempSubtasks);

        if (success) {
            setForm(initialFormState); // Limpia todo el objeto de un golpe
            setTempSubtasks([]);
            if (!keepOpen) onClose();
        }
    };

    // Validación para deshabilitar botones
    const isInvalid = !form.nombre.trim() || !form.descripcion.trim() || !form.fecha_entrega || !form.carga_mental || !form.curso.trim();

    return (<div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-md space-y-6">
        {/* Nombre de la tarea */}
        <h1>Nueva Tarea</h1>

        <input
            name="nombre"
            type="text"
            value={form.nombre}
            onChange={handleChange}
            placeholder="¿Qué tarea quieres agregar?"
            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />

        {/* Descripción */}
        <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            placeholder="Descripción"
            maxLength={100}
            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <div className="text-right text-xs text-gray-400">
            {100 - form.descripcion.length} caracteres restantes
        </div>

        {/* Subtareas */}
        <div className="space-y-2">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={currentSubtaskInput}
                    onChange={(e) => setCurrentSubtaskInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSubtaskToTempList())}
                    placeholder="Añadir subtarea"
                    className="flex-1 text-sm border-b border-gray-300 focus:outline-none focus:border-emerald-400"
                />
                <button onClick={addSubtaskToTempList} className="text-emerald-600 hover:text-emerald-800">
                    <Plus size={18}/>
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                {tempSubtasks.map((sub, idx) => (<span
                    key={idx}
                    className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs"
                >
              {sub}
                    <X
                        size={12}
                        className="cursor-pointer hover:text-red-500"
                        onClick={() => setTempSubtasks(tempSubtasks.filter((_, i) => i !== idx))}
                    />
            </span>))}
            </div>
        </div>

        {/* Opciones: Fecha, tipo, curso, carga mental */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fecha de entrega */}
            <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Fecha de entrega</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                    <CalendarDays size={16} className="text-gray-500"/>
                    <input
                        name="fecha_entrega"
                        type="datetime-local"
                        value={form.fecha_entrega}
                        onChange={handleChange}
                        className="bg-transparent text-sm w-full focus:outline-none"
                    />
                </div>
            </div>

            {/* Tipo de tarea */}
            <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Tipo de tarea</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                    <Sparkles size={16} className="text-gray-500"/>
                    <select
                        name="tipo_tarea"
                        value={form.tipo_tarea}
                        onChange={handleChange}
                        className="bg-transparent text-sm w-full focus:outline-none"
                    >
                        <option value="EX">Examen</option>
                        <option value="QU">Quiz</option>
                        <option value="TA">Taller</option>
                        <option value="PR">Proyecto</option>
                        <option value="OT">Otro</option>
                    </select>
                </div>
            </div>

            {/* Curso / Materia */}
            <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Curso / Materia</label>
                <input
                    name="curso"
                    type="text"
                    value={form.curso}
                    onChange={handleChange}
                    className="px-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none"
                    placeholder="Nombre del curso"
                />
            </div>

            {/* Carga mental */}
            <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Carga mental</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                    <Brain size={16} className="text-gray-500"/>
                    <select
                        name="carga_mental"
                        value={form.carga_mental}
                        onChange={handleChange}
                        className="bg-transparent text-sm w-full focus:outline-none"
                    >
                        <option value="">Selecciona</option>
                        <option value="1">1 - Muy baja</option>
                        <option value="2">2 - Baja</option>
                        <option value="3">3 - Media</option>
                        <option value="4">4 - Alta</option>
                        <option value="5">5 - Muy alta</option>
                    </select>
                </div>
            </div>
        </div>

        {/* Botón Crear */}
        <button
            onClick={() => onSave(false)}
            disabled={isInvalid}
            className={`w-full py-3 rounded-xl font-semibold transition ${
                isInvalid
                    ? "bg-transparent border border-gray-300 text-gray-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer focus:outline-none"
            }`}
        >
            Crear Tarea
        </button>

        <button
            onClick={() => onSave(true)}
            disabled={isInvalid}
            className={`w-full py-3 rounded-xl font-semibold transition ${
                isInvalid
                    ? "bg-transparent border border-gray-300 text-gray-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer focus:outline-none"
            }`}
        >
            Crear Otra Tarea
        </button>
    </div>);
}