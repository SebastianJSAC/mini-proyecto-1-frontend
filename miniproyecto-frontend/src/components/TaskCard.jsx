import { useState } from "react";
import Swal from "sweetalert2";
import { Trash2 } from "lucide-react";

export default function TaskCard({ tarea, setTasks, API_URL }) {

    const [subtaskInput, setSubtaskInput] = useState("");
    const [open, setOpen] = useState(true);

    const subtasks = tarea.subtareas || [];
    subtasks.filter(s => s.completada).length;

    const handleDeleteTask = async () => {

        const confirm = await Swal.fire({
            title: "Eliminar tarea",
            text: "¿Seguro que quieres eliminar esta tarea?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#ef4444"
        });

        if (!confirm.isConfirmed) return;

        const deletedTask = tarea;

        // Guardamos una copia profunda de la tarea y sus subtareas antes de borrar
        const taskBackup = { ...tarea };
        const subtasksBackup = [...(tarea.subtareas || [])];

        // eliminar de UI inmediatamente
        setTasks(prev => prev.filter(t => t.id !== tarea.id));

        try {
            await fetch(`${API_URL}/tareas/api/tareas/${tarea.id}/`, {
                method: "DELETE"
            });

            const result = await Swal.fire({
                toast: true,
                position: "bottom-end",
                icon: "info",
                title: "Tarea eliminada",
                showConfirmButton: true,
                confirmButtonText: "Restaurar",
                timer: 4000,
                timerProgressBar: true
            });

            if (result.isConfirmed) {
                const response = await fetch(`${API_URL}/tareas/api/tareas/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        nombre: taskBackup.nombre,
                        completada: taskBackup.completada, //Mantener estado original
                        parent: taskBackup.parent || null
                    })
                });
                const res = await response.json();

                if (response.ok) {
                    const newTask = res.data;
                    const restoredSubtasks = [];

                    //Restaurar cada subtarea vinculándola al nuevo ID del padre
                    if (subtasksBackup.length > 0) {
                        const subtaskPromises = subtasksBackup.map(sub =>
                            fetch(`${API_URL}/tareas/api/tareas/`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    nombre: sub.nombre,
                                    completada: sub.completada,
                                    parent: newTask.id // El nuevo ID generado por la DB
                                })
                            }).then(r => r.json())
                        );

                        const subResults = await Promise.all(subtaskPromises);
                        subResults.forEach(r => {
                            if (r.data) restoredSubtasks.push(r.data);
                        });
                    }

                    //Actualizar la UI con la tarea y sus subtareas
                    setTasks(prev => [...prev, { ...newTask, subtareas: restoredSubtasks }]);

                    await Swal.fire({
                        toast: true,
                        position: "top-end",
                        icon: "success",
                        title: "Tarea y subtareas restauradas",
                        showConfirmButton: false,
                        timer: 1500
                    });
                }
            }

            // eslint-disable-next-line no-unused-vars
        } catch (error) {

            await Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo eliminar la tarea"
            });

            // restaurar en UI si falla
            setTasks(prev => [...prev, deletedTask]);
        }
    };

    const toggleSubtask = async (sub) => {
        const nuevoEstadoSubtarea = !sub.completada;

        try {
            const response = await fetch(`${API_URL}/tareas/api/tareas/${sub.id}/`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completada: nuevoEstadoSubtarea })
            });

            if (response.ok) {
                setTasks(prev => prev.map(t => {
                    if (t.id === tarea.id) {
                        // 1. Actualizamos la subtarea específica
                        const nuevasSubtareas = t.subtareas.map(s =>
                            s.id === sub.id ? { ...s, completada: nuevoEstadoSubtarea } : s
                        );

                        // 2. Verificamos si TODAS están completadas ahora
                        const todasCompletadas = nuevasSubtareas.length > 0 &&
                            nuevasSubtareas.every(s => s.completada);

                        // 3. Si el estado de la tarea principal debe cambiar, disparamos el PATCH al padre
                        if (todasCompletadas !== t.completada) {
                            actualizarEstadoPadre(t.id, todasCompletadas);
                        }

                        return { ...t, subtareas: nuevasSubtareas, completada: todasCompletadas };
                    }
                    return t;
                }));
            }
        } catch (error) {
            console.error("Error al actualizar subtarea", error);
        }
    };

    // Función auxiliar para sincronizar el estado del padre en la API
    const actualizarEstadoPadre = async (id, estado) => {
        await fetch(`${API_URL}/tareas/api/tareas/${id}/`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completada: estado })
        });
    };

    const toggleComplete = async () => {

        const nuevoEstadoPadre = !tarea.completada;

        const confirm = await Swal.fire({
            title: nuevoEstadoPadre ? "Completar tarea" : "Reabrir tarea",
            text: nuevoEstadoPadre
                ? "¿Quieres marcar esta tarea como completada?"
                : "¿Quieres marcar esta tarea como pendiente nuevamente?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: nuevoEstadoPadre ? "Sí, completar" : "Sí, reabrir",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#10b981"
        });

        if (!confirm.isConfirmed) return;

        try {

            const response = await fetch(`${API_URL}/tareas/api/tareas/${tarea.id}/`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completada: nuevoEstadoPadre })
            });

            if (response.ok) {

                const promesas = subtasks.map(sub =>
                    fetch(`${API_URL}/tareas/api/tareas/${sub.id}/`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ completada: nuevoEstadoPadre })
                    })
                );

                await Promise.all(promesas);

                setTasks(prev => prev.map(t => {
                    if (t.id === tarea.id) {
                        return {
                            ...t,
                            completada: nuevoEstadoPadre,
                            subtareas: t.subtareas.map(s => ({
                                ...s,
                                completada: nuevoEstadoPadre
                            }))
                        };
                    }
                    return t;
                }));

                await Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "success",
                    title: nuevoEstadoPadre
                        ? "Tarea completada 🎉"
                        : "Tarea marcada como pendiente",
                    showConfirmButton: false,
                    timer: 1500
                });

            }

        } catch (error) {

            await Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo actualizar la tarea"
            });

        }
    };

    const handleAddSubtask = async () => {

        if (!subtaskInput.trim()) {
            await Swal.fire({
                icon: "warning",
                title: "Subtarea vacía",
                text: "Escribe algo antes de agregar."
            });
            return;
        }

        try {

            const response = await fetch(`${API_URL}/tareas/api/tareas/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nombre: subtaskInput,
                    parent: tarea.id
                })
            });

            const res = await response.json();

            if (response.ok) {

                setTasks(prev =>
                    prev.map(t =>
                        t.id === tarea.id
                            ? {
                                ...t,
                                subtareas: [...(t.subtareas || []), res.data]
                            }
                            : t
                    )
                );

                setSubtaskInput("");

                await Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "success",
                    title: "Subtarea agregada",
                    showConfirmButton: false,
                    timer: 1500
                });

            }
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            await Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo crear la subtarea"
            });

        }

    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4 hover:shadow-md transition">
            {/* header */}
            <div className="flex items-center gap-3">
                <button
                    onClick={toggleComplete}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${tarea.completada
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600"
                        }`}
                >
                    {tarea.completada ? "Completada" : "○ Pendiente"}
                </button>

                <h3 className={`flex-1 text-lg font-medium ${tarea.completada ? "line-through text-gray-400" : "text-gray-900"
                    }`}>
                    {tarea.nombre}
                </h3>

                <button
                    onClick={handleDeleteTask}
                    className="text-red-500 hover:text-red-700"
                >
                    <Trash2 size={18} />
                </button>

                <button
                    onClick={() => setOpen(!open)}
                    className="text-sm text-gray-400"
                >
                    {open ? "Ocultar" : "Ver"}
                </button>
            </div>

            {/* subtareas */}
            {open && (
                <div className="space-y-2 ml-6">
                    {subtasks.map(sub => (
                        <div
                            key={sub.id}
                            className="flex items-center gap-2 text-sm bg-gray-50 border border-gray-200 px-3 py-2 rounded-md"
                        >

                            <button
                                onClick={() => toggleSubtask(sub)}
                                className={`px-2 py-1 rounded-md text-xs font-bold transition-all ${sub.completada
                                    ? "bg-green-100 text-green-700"
                                    : "bg-slate-100 text-slate-600"
                                    }`}
                            >
                                {sub.completada ? "✓" : "○"}
                            </button>

                            <span className={`${sub.completada ? "line-through text-gray-400" : "text-gray-700"}`}>
                                {sub.nombre}
                            </span>
                        </div>
                    ))}
                    {subtasks.length === 0 && (
                        <p className="text-xs text-gray-400">
                            No hay subtareas
                        </p>
                    )}
                    {/* agregar subtarea */}
                    <div className="flex gap-2 mt-3">

                        <input
                            value={subtaskInput}
                            onChange={(e) => setSubtaskInput(e.target.value)}
                            placeholder="Nueva subtarea..."
                            className="flex-1 px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        />

                        <button
                            onClick={handleAddSubtask}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm"
                        >
                            +
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}