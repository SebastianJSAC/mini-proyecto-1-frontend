import { useState } from "react";
import Swal from "sweetalert2";

export default function TaskCard({ tarea, tasks, setTasks, API_URL }) {

    const [subtaskInput, setSubtaskInput] = useState("");
    const [open, setOpen] = useState(true);

    const subtasks = tasks.filter(t => t.parent === tarea.id);

    const toggleComplete = () => {

        const updated = tasks.map(t =>
            t.id === tarea.id
                ? { ...t, completed: !t.completed }
                : t
        );

        setTasks(updated);
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

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">

            {/* header */}

            <div className="flex items-center gap-3">

                <input
                    type="checkbox"
                    checked={tarea.completed || false}
                    onChange={toggleComplete}
                    className="w-5 h-5"
                />

                <h3 className={`flex-1 text-lg font-medium ${tarea.completed ? "line-through text-gray-400" : "text-gray-900"}`}>
                    {tarea.nombre}
                </h3>

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
                            className="flex items-center gap-2 text-sm"
                        >

                            <input type="checkbox" />

                            <span className="text-gray-700">
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

                    <div className="flex gap-2 mt-2">

                        <input
                            value={subtaskInput}
                            onChange={(e) => setSubtaskInput(e.target.value)}
                            placeholder="Nueva subtarea..."
                            className="flex-1 px-3 py-1 border rounded-md text-sm"
                        />

                        <button
                            onClick={handleAddSubtask}
                            className="px-3 py-1 bg-emerald-600 text-white rounded-md text-sm"
                        >
                            +
                        </button>

                    </div>

                </div>

            )}

        </div>
    );
}