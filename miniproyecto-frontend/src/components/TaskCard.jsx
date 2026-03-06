import { useState } from "react";
import Swal from "sweetalert2";

export default function TaskCard({ tarea, tasks, setTasks, API_URL }) {

    const [subtaskInput, setSubtaskInput] = useState("");
    const [open, setOpen] = useState(true);

    const subtasks = tarea.subtareas || [];

    const completadas = subtasks.filter(s => s.completada).length;

    const toggleSubtask = async (sub) => {

        try {

            const response = await fetch(`${API_URL}/tareas/api/tareas/${sub.id}/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    completada: !sub.completada
                })
            });

            if (response.ok) {

                setTasks(prev =>
                    prev.map(t => {

                        if (t.id === tarea.id) {

                            return {
                                ...t,
                                subtareas: t.subtareas.map(s =>
                                    s.id === sub.id
                                        ? { ...s, completada: !s.completada }
                                        : s
                                )
                            };

                        }

                        return t;

                    })
                );

            }

        } catch (error) {

            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo actualizar la subtarea"
            });

        }

    };

    const toggleComplete = async () => {

        try {

            const response = await fetch(`${API_URL}/tareas/api/tareas/${tarea.id}/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    completada: !tarea.completada
                })
            });

            if (response.ok) {

                const updated = tasks.map(t =>
                    t.id === tarea.id
                        ? { ...t, completada: !t.completada }
                        : t
                );

                setTasks(updated);

            }

        } catch (error) {

            Swal.fire({
                icon: "error",
                title: "Error",
                text: "No se pudo actualizar la tarea"
            });

        }

    };

    const handleAddSubtask = async () => {

        if (!subtaskInput.trim()) {
            Swal.fire({
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

                setTasks(prev => [...prev, res.data]);

                setSubtaskInput("");

                Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "success",
                    title: "Subtarea agregada",
                    showConfirmButton: false,
                    timer: 1500
                });

            }

        } catch (error) {

            Swal.fire({
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

                <input
                    type="checkbox"
                    checked={tarea.completada || false}
                    onChange={toggleComplete}
                    className="w-5 h-5"
                />

                <h3 className={`flex-1 text-lg font-medium ${tarea.completada ? "line-through text-gray-400" : "text-gray-900"}`}>
                    {tarea.nombre}
                </h3>

                <span className="text-xs text-gray-400">
                    {completadas}/{subtasks.length}
                </span>

                <button
                    onClick={() => setOpen(!open)}
                    className="text-sm text-gray-400 hover:text-gray-700"
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

                            <input
                                type="checkbox"
                                checked={sub.completada || false}
                                onChange={() => toggleSubtask(sub)}
                                className="w-4 h-4 cursor-pointer"
                            />

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