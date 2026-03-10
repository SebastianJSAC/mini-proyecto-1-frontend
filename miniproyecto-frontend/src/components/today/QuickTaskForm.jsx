import {CalendarDays, Brain, Sparkles, Plus, X} from "lucide-react";
import {useState} from "react";
import Swal from "sweetalert2";

export default function QuickTaskForm({API_URL, obtenerTareas, navigate}) {

    const [quickTaskInput, setQuickTaskInput] = useState("");
    const [descripcionInput, setDescripcionInput] = useState("");
    const [selectedDueDate, setSelectedDueDate] = useState("");
    const [selectedMentalLoad, setSelectedMentalLoad] = useState(undefined);
    const [selectedTipoTarea, setSelectedTipoTarea] = useState("OT");
    const [cursoInput, setCursoInput] = useState("");

    const [tempSubtasks, setTempSubtasks] = useState([]);
    const [currentSubtaskInput, setCurrentSubtaskInput] = useState("");

    const fechaISO = selectedDueDate ? new Date(selectedDueDate).toISOString() : null;

    const addSubtaskToTempList = () => {

        if (!currentSubtaskInput.trim()) return;

        setTempSubtasks([...tempSubtasks, currentSubtaskInput.trim()]);

        setCurrentSubtaskInput("");
    };

    const handleAddTask = async () => {

        if (!quickTaskInput.trim()) return;

        const token = localStorage.getItem("token");

        navigate("/hoy/crear");

        try {
            const response = await fetch(`${API_URL}/tareas/api/tareas/`, {
                method: "POST", headers: {
                    "Content-Type": "application/json", "Authorization": `Bearer ${token}`
                }, body: JSON.stringify({
                    nombre: quickTaskInput,
                    descripcion: descripcionInput || "Descripcion de la tarea vacia",
                    fecha_entrega: fechaISO,
                    carga_mental: selectedMentalLoad || null,
                    tipo_tarea: selectedTipoTarea,
                    curso: cursoInput || null
                }),
            });

            const res = await response.json();

            if (response.ok) {

                const tareaPadre = res.data || res;

                if (tempSubtasks.length > 0) {

                    const promesas = tempSubtasks.map(subNombre => fetch(`${API_URL}/tareas/api/tareas/`, {
                        method: "POST", headers: {
                            "Content-Type": "application/json", "Authorization": `Bearer ${token}`
                        }, body: JSON.stringify({
                            nombre: subNombre, parent: tareaPadre.id
                        })
                    }));

                    await Promise.all(promesas);
                }

                await obtenerTareas(API_URL);

                setQuickTaskInput("");
                setDescripcionInput("");
                setSelectedDueDate("");
                setSelectedMentalLoad(undefined);
                setCursoInput("");
                setSelectedTipoTarea("OT");
                setTempSubtasks([]);

                navigate("/hoy");

                await Swal.fire({
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    icon: "success",
                    title: "Tarea agregada",
                    timer: 4000,
                    timerProgressBar: true
                });

            }

        } catch (error) {
            console.error("Error creando tarea:", error);
        }
    };

    return (<div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-md space-y-6">
        {/* Nombre de la tarea */}
        <input
            type="text"
            value={quickTaskInput}
            onChange={(e) => setQuickTaskInput(e.target.value)}
            placeholder="¿Qué tarea quieres agregar?"
            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />

        {/* Descripción */}
        <textarea
            value={descripcionInput}
            onChange={(e) => setDescripcionInput(e.target.value)}
            placeholder="Descripción (opcional)..."
            maxLength={100}
            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <div className="text-right text-xs text-gray-400">
            {100 - descripcionInput.length} caracteres restantes
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
                        type="datetime-local"
                        value={selectedDueDate}
                        onChange={(e) => setSelectedDueDate(e.target.value)}
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
                        value={selectedTipoTarea}
                        onChange={(e) => setSelectedTipoTarea(e.target.value)}
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
                    type="text"
                    value={cursoInput}
                    onChange={(e) => setCursoInput(e.target.value)}
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
                        value={selectedMentalLoad ?? ""}
                        onChange={(e) =>
                            setSelectedMentalLoad(e.target.value ? Number(e.target.value) : undefined)
                        }
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
            onClick={handleAddTask}
            disabled={
                !quickTaskInput.trim() ||
                !descripcionInput.trim() ||
                !selectedDueDate ||
                !selectedTipoTarea ||
                !cursoInput.trim() ||
                selectedMentalLoad === undefined
            }
            className={`w-full py-3 rounded-xl font-semibold transition
    ${
                !quickTaskInput.trim() ||
                !descripcionInput.trim() ||
                !selectedDueDate ||
                !selectedTipoTarea ||
                !cursoInput.trim() ||
                selectedMentalLoad === undefined
                    ? "bg-transparent border border-gray-300 text-gray-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer focus:outline-none"
            }
  `}
        >
            Crear Tarea
        </button>
    </div>);
}