import { Play, Pause, RotateCcw, Sparkles, CalendarDays, Brain } from "lucide-react";
import { useState, useEffect } from "react";

export function TodayView() {
    const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
    const [timerRunning, setTimerRunning] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(25 * 60);
    const userName = "María";

    const [quickTaskInput, setQuickTaskInput] = useState("");
    const [selectedDueDate, setSelectedDueDate] = useState("");
    const [selectedMentalLoad, setSelectedMentalLoad] = useState(undefined);
    const [isBreakingDown, setIsBreakingDown] = useState(false);
    const [queueTasks, setQueueTasks] = useState([]);

    const handleAddTask = async () => {

    if (!quickTaskInput.trim()) return;

    try {
        const response = await fetch(`${API_URL}/tareas/api/tareas/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            nombre: quickTaskInput
        }),
        });

        const res = await response.json();

        if (response.ok) {
        setQueueTasks(prev => [...prev, res.data]);
        setQuickTaskInput("");
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

    const progressPercentage = ((25 * 60 - timeRemaining) / (25 * 60)) * 100;

    const handleMagicBreakdown = () => {
    if (!quickTaskInput.trim()) return;

    setIsBreakingDown(true);

    setTimeout(() => {
    const subtasks = generateSubtasks(quickTaskInput);

    const newTask = {
        id: Date.now(),
        name: quickTaskInput,
        dueDate: selectedDueDate,
        mentalLoad: selectedMentalLoad,
        subtasks: subtasks,
    };

    setQueueTasks([...queueTasks, newTask]);
    setQuickTaskInput("");
    setSelectedDueDate("");
    setSelectedMentalLoad(undefined);
    setIsBreakingDown(false);
    }, 1500);

    };

    return ( <main className="flex-1 overflow-auto"> <div className="max-w-7xl mx-auto px-8 py-8"> <div className="mb-8"> <h1 className="text-3xl font-light text-gray-900 mb-2">
    Hola, {userName}. <span className="font-medium">Tienes 3 misiones hoy.</span> </h1> <p className="text-base text-gray-500">Viernes, 6 de marzo de 2026</p> </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Area */}
        <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-medium text-gray-900 mb-6">Tu Power 3</h2>

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
                    placeholder="¿Qué tienes pendiente?"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
                </div>

                <div className="flex items-center gap-3 flex-wrap">

                <button
                    onClick={handleMagicBreakdown}
                    disabled={!quickTaskInput.trim() || isBreakingDown}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg"
                >
                    <Sparkles className={`w-4 h-4 ${isBreakingDown ? "animate-spin" : ""}`} />
                    {isBreakingDown ? "Dividiendo..." : "Magia"}
                </button>

                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-lg">
                    <CalendarDays className="w-4 h-4 text-gray-600" />
                    <input
                    type="date"
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
                    disabled={!quickTaskInput.trim()}
                    className="ml-auto px-6 py-2.5 bg-emerald-600 text-white rounded-lg"
                >
                    Agregar
                </button>

                </div>
            </div>
            </div>

            {tasks.map((task, index) => (
            <div
                key={task.id}
                className={`p-8 rounded-2xl border ${
                task.status === "active"
                    ? "bg-white border-emerald-200"
                    : "bg-gray-50 border-gray-200 opacity-60"
                }`}
            >
                <h3 className="text-lg font-medium">{task.name}</h3>

                {task.status === "active" && (
                <button className="mt-4 px-6 py-3 bg-emerald-600 text-white rounded-xl flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Iniciar Cronómetro
                </button>
                )}
            </div>
            ))}
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
