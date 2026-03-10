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

    const fechaISO = selectedDueDate
        ? new Date(selectedDueDate).toISOString()
        : null;

    const addSubtaskToTempList = () => {

        if (!currentSubtaskInput.trim()) return;

        setTempSubtasks([
            ...tempSubtasks,
            currentSubtaskInput.trim()
        ]);

        setCurrentSubtaskInput("");
    };

    const handleAddTask = async () => {

        if (!quickTaskInput.trim()) return;

        const token = localStorage.getItem("token");

        // 👇 SE MANTIENE EXACTAMENTE COMO PEDISTE
        navigate("/hoy/crear");

        try {

            const response = await fetch(`${API_URL}/tareas/api/tareas/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
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

                    const promesas = tempSubtasks.map(subNombre =>
                        fetch(`${API_URL}/tareas/api/tareas/`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                nombre: subNombre,
                                parent: tareaPadre.id
                            })
                        })
                    );

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

                await Swal.fire({
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    icon: "success",
                    title: "Tarea agregada",
                    timer: 4000,
                    timerProgressBar: true
                });

                setTimeout(() => navigate("/hoy"), 500);
            }

        } catch (error) {
            console.error("Error creando tarea:", error);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
            <div className="space-y-4">
                <div className="relative">
                    <input
                        type="text"
                        value={quickTaskInput}
                        onChange={(e) => setQuickTaskInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleAddTask();
                            }
                        }}
                        placeholder="¿Qué tarea tienes para agregar?"
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    />

                    <textarea
                        value={descripcionInput}
                        onChange={(e) => setDescripcionInput(e.target.value)}
                        placeholder="Descripción de la tarea..."
                        maxLength="100"
                        className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl"
                    />

                    <div className="absolute bottom-2 right-2 text-[10px] text-gray-400">
                        {100 - descripcionInput.length}
                    </div>

                </div>

                {/* SUBTAREAS */}
                <div className="flex gap-2">

                    <input
                        type="text"
                        value={currentSubtaskInput}
                        onChange={(e) => setCurrentSubtaskInput(e.target.value)}
                        onKeyDown={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), addSubtaskToTempList())
                        }
                        placeholder="Añadir subtarea"
                        className="flex-1 text-sm border-b border-gray-200"
                    />

                    <button
                        onClick={addSubtaskToTempList}
                        className="text-emerald-600"
                    >
                        <Plus size={16}/>
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">

                    {tempSubtasks.map((sub, idx) => (
                        <span
                            key={idx}
                            className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs"
                        >

                            {sub}

                            <X
                                size={12}
                                className="cursor-pointer"
                                onClick={() =>
                                    setTempSubtasks(
                                        tempSubtasks.filter((_, i) => i !== idx)
                                    )
                                }
                            />
                        </span>
                    ))}
                </div>

                {/* OPCIONES */}
                <div className="flex gap-3 flex-wrap">

                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">

                        <CalendarDays size={16}/>

                        <input
                            type="datetime-local"
                            value={selectedDueDate}
                            onChange={(e) => setSelectedDueDate(e.target.value)}
                            className="bg-transparent text-sm"
                        />

                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">

                        <Sparkles size={16}/>

                        <select
                            value={selectedTipoTarea}
                            onChange={(e) => setSelectedTipoTarea(e.target.value)}
                            className="bg-transparent text-xs"
                        >
                            <option value="EX">Examen</option>
                            <option value="QU">Quiz</option>
                            <option value="TA">Taller</option>
                            <option value="PR">Proyecto</option>
                            <option value="OT">Otro</option>
                        </select>

                    </div>

                    <input
                        type="text"
                        value={cursoInput}
                        onChange={(e) => setCursoInput(e.target.value)}
                        placeholder="Curso/Materia"
                        className="px-3 py-2 bg-gray-100 rounded-lg text-xs"
                    />

                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">

                        <Brain size={16}/>

                        <select
                            value={selectedMentalLoad ?? ""}
                            onChange={(e) =>
                                setSelectedMentalLoad(
                                    e.target.value
                                        ? Number(e.target.value)
                                        : undefined
                                )
                            }
                            className="bg-transparent text-sm"
                        >
                            <option value="">Carga Mental</option>
                            <option value="1">1 - Muy baja</option>
                            <option value="2">2 - Baja</option>
                            <option value="3">3 - Media</option>
                            <option value="4">4 - Alta</option>
                            <option value="5">5 - Muy alta</option>
                        </select>

                    </div>

                    <button
                        onClick={handleAddTask}
                        disabled={
                            !quickTaskInput.trim() ||
                            !descripcionInput.trim() ||
                            !selectedDueDate ||
                            selectedMentalLoad === undefined
                        }
                        className="ml-auto px-6 py-2 bg-emerald-600 text-white rounded-lg"
                    >
                        Crear Tarea
                    </button>
                </div>
            </div>
        </div>
    );
}