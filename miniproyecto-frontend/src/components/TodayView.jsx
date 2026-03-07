import { Play, Pause, RotateCcw, Sparkles, CalendarDays, Brain } from "lucide-react";
import { useState, useEffect } from "react";
import TaskCard from "./TaskCard.jsx";
import Swal from "sweetalert2";
import { useSearchParams, useNavigate } from "react-router-dom";

export function TodayView() {
    const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
    const [timerRunning, setTimerRunning] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(25 * 60);
    const userName = "María";
    const [selectedDueDate, setSelectedDueDate] = useState("");

    const fechaISO = selectedDueDate ? new Date(selectedDueDate).toISOString() : null;

    const [quickTaskInput, setQuickTaskInput] = useState("");
    const [selectedMentalLoad, setSelectedMentalLoad] = useState(undefined);
    const [descripcionInput, setDescripcionInput] = useState("");

    const [tasks, setTasks] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const obtenerTareas = async () => {
        try {
            const response = await fetch(`${API_URL}/tareas/api/tareas/`);
            const data = await response.json();

            console.log("Tareas recibidas desde la API:", data);

            if (Array.isArray(data)) {
                setTasks(data);
            }
        } catch (error) {
            console.error("Error cargando tareas:", error);
        }
    };

    useEffect(() => {
        obtenerTareas().then()
    }, []);

    const handleAddTask = async () => {
        if (!quickTaskInput.trim()) return;

        //Ruta crear
        navigate("/hoy/crear");

        try {
            const response = await fetch(`${API_URL}/tareas/api/tareas/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nombre: quickTaskInput,
                    descripcion: descripcionInput || "Descripcion de la tarea vacia",
                    fecha_entrega: fechaISO,
                    carga_mental: selectedMentalLoad || null
                }),
            });

            const res = await response.json();

            if (response.ok) {
                setTasks(prev => [...prev, res.data]);

                setDescripcionInput("");

                setQuickTaskInput("");
                setSelectedDueDate("");
                setSelectedMentalLoad(undefined);

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

    useEffect(() => {
        let interval;
        if (timerRunning && timeRemaining > 0) {
            interval = window.setInterval(() => {
                setTimeRemaining((time) => time - 1);
            }, 1000);
        } else if (timeRemaining === 0) {
            setTimerRunning(false);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [timerRunning, timeRemaining]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const resetTimer = () => {
        setTimeRemaining(25 * 60);
        setTimerRunning(false);
    };

    const tareasPendientes = tasks.filter(t =>
        (t.parent === null || t.parent_id === null) && t.completada === false
    );

    const totalMisiones = tareasPendientes.length;

    const hoy = new Date().toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const tareasPendientesOrdenadas = tasks
        .filter(t => (t.parent === null || t.parent_id === null) && !t.completada)
        .sort((a, b) => {
            if (!a.fecha_entrega) return 1;
            if (!b.fecha_entrega) return -1;
            return new Date(a.fecha_entrega) - new Date(b.fecha_entrega);
        });

    const tareaMasCercana = tareasPendientesOrdenadas[0];

    const subts = tareaMasCercana?.subtareas || [];

    const completadas = subts.filter(st => st.completada).length;
    const totalSubtareas = subts.length;

    const progresoSubtareas = totalSubtareas > 0
        ? Math.round((completadas / totalSubtareas) * 100)
        : 0;

    return (<main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-8 py-8">
            <div className="mb-8"><h1 className="text-3xl font-light text-gray-900 mb-2">
                Hola, {userName}. <span
                    className="font-medium">Tienes {totalMisiones} {totalMisiones === 1 ? "tarea" : "tareas"} actualmente.</span>
            </h1> <p className="text-base text-gray-500">{hoy}</p></div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Area */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Quick Add */}
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
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                />

                                <textarea
                                    value={descripcionInput}
                                    onChange={(e) => setDescripcionInput(e.target.value)}
                                    placeholder="Descripción de la tarea..."
                                    className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500"
                                    maxlength="100"
                                />

                                <div className={`absolute bottom-2 right-2 text-[10px] font-mono px-1.5 py-0.5 rounded shadow-sm border ${descripcionInput.length >= 90
                                        ? "bg-red-50 text-red-600 border-red-100"
                                        : "bg-gray-50 text-gray-400 border-gray-100"
                                    }`}>
                                    {100 - descripcionInput.length}
                                </div>

                            </div>

                            <div className="flex items-center gap-3 flex-wrap">

                                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-lg">
                                    <CalendarDays className="w-4 h-4 text-gray-600" />
                                    <input
                                        type="datetime-local"
                                        value={selectedDueDate}
                                        onChange={(e) => setSelectedDueDate(e.target.value)}
                                        className="bg-transparent text-sm focus:outline-none"
                                    />
                                </div>

                                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-lg">
                                    <Brain className="w-4 h-4 text-gray-600" />
                                    <select
                                        value={selectedMentalLoad ?? ""}
                                        onChange={(e) =>
                                            setSelectedMentalLoad(
                                                e.target.value ? Number(e.target.value) : undefined
                                            )
                                        }
                                        className="bg-transparent text-sm focus:outline-none"
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
                                    // Verificamos que todos los campos tengan contenido
                                    disabled={
                                        !quickTaskInput.trim() ||
                                        !descripcionInput.trim() ||
                                        !selectedDueDate ||
                                        selectedMentalLoad === undefined
                                    }
                                    className={`ml-auto px-6 py-2.5 rounded-lg transition-colors ${(!quickTaskInput.trim() || !descripcionInput.trim() || !selectedDueDate || selectedMentalLoad === undefined)
                                        ? "bg-gray-300 cursor-not-allowed text-gray-500" // Estilo deshabilitado
                                        : "bg-emerald-600 text-white hover:bg-emerald-700" // Estilo activo
                                        }`}
                                >
                                    Crear Tarea
                                </button>

                            </div>
                        </div>
                    </div>

                    {tareaMasCercana && (
                        <div className="relative overflow-hidden bg-white border-2 border-emerald-100 rounded-2xl p-6 mt-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-emerald-500/10">

                            {/* Decoración de fondo para resaltar */}
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-50 rounded-full blur-3xl opacity-50" />

                            <div className="relative">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                                            Prioridad Inmediata
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                                        <span>Próximo cierre</span>
                                    </div>
                                </div>

                                <h3 className="text-xl font-semibold text-gray-900 mb-2 decoration-emerald-500/30 decoration-2">
                                    {tareaMasCercana.nombre}
                                </h3>

                                <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
                                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                        <p>Entrega: </p>
                                        <CalendarDays className="w-4 h-4 text-emerald-500" />
                                        <span className="font-medium text-gray-700">
                                            {tareaMasCercana.fecha_entrega
                                                ? new Date(tareaMasCercana.fecha_entrega).toLocaleString([], {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                                : "Sin fecha de entrega"}
                                        </span>
                                    </div>

                                    {tareaMasCercana.carga_mental && (
                                        <div className="flex items-center gap-1 text-sm text-amber-600">
                                            <Brain className="w-4 h-4" />
                                            <span className="text-xs font-medium">Dificultad: Nivel {tareaMasCercana.carga_mental}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-semibold text-emerald-700">
                                            Progreso de la tarea
                                        </span>
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                            {progresoSubtareas}%
                                        </span>
                                    </div>

                                    {/* Contenedor de la barra */}
                                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden border border-gray-50">
                                        <div
                                            className="bg-emerald-500 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                                            style={{ width: `${progresoSubtareas}%` }}
                                        />
                                    </div>

                                    <p className="text-[10px] text-gray-400 mt-2 text-right italic">
                                        {completadas} de {totalSubtareas} subtareas finalizadas
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3 mt-6">

                        {tasks.length === 0 && (
                            <p className="text-gray-400 text-sm">
                                No hay tareas todavía.
                            </p>
                        )}

                        {tasks
                            .filter((t) => !t.parent && !t.parent_id)
                            .map((tarea) => (

                                <TaskCard
                                    key={tarea.id}
                                    tarea={tarea}
                                    tasks={tasks}
                                    setTasks={setTasks}
                                    navigate={navigate}
                                    API_URL={API_URL}
                                />

                            ))}

                    </div>

                </div>

                {/* Timer */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">

                        <div className="text-center mb-6">
                            <div className="text-5xl font-light mb-2">{formatTime(timeRemaining)}</div>
                            <div className="text-sm text-gray-500">
                                {timerRunning ? "En progreso" : "Pomodoro"}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setTimerRunning(!timerRunning)}
                                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl flex items-center justify-center gap-2"
                            >
                                {timerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                {timerRunning ? "Pausar" : "Iniciar"}
                            </button>

                            <button
                                onClick={resetTimer}
                                className="px-4 py-3 bg-gray-100 rounded-xl"
                            >
                                <RotateCcw className="w-5 h-5" />
                            </button>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    </main>
    );
}
