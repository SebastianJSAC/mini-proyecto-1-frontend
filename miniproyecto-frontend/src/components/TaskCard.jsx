import { useState } from "react";
import Swal from "sweetalert2";
import { Trash2, Edit2, Check, X, CalendarDays, Brain } from "lucide-react";

export default function TaskCard({ tarea, setTasks, API_URL }) {
    // --- NUEVOS ESTADOS PARA EDICIÓN ---
    const [isEditing, setIsEditing] = useState(false);
    const [editNombre, setEditNombre] = useState(tarea.nombre);
    const [editDescripcion, setEditDescripcion] = useState(tarea.descripcion || "");
    const [editCarga, setEditCarga] = useState(tarea.carga_mental || "");

    // --- TUS ESTADOS ORIGINALES ---
    const [subtaskInput, setSubtaskInput] = useState("");
    const [open, setOpen] = useState(true);

    const subtasks = tarea.subtareas || [];

    // --- FUNCIÓN PARA GUARDAR CAMBIOS ---
    const handleUpdateTask = async () => {
        if (!editNombre.trim()) return;

        try {
            const response = await fetch(`${API_URL}/tareas/api/tareas/${tarea.id}/`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre: editNombre,
                    descripcion: editDescripcion,
                    carga_mental: editCarga || null
                })
            });

            if (response.ok) {
                const res = await response.json();

                // Actualizamos el estado global en TodayView
                setTasks(prev => prev.map(t =>
                    t.id === tarea.id ? { ...t, ...res.data } : t
                ));

                setIsEditing(false);

                Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "success",
                    title: "Tarea actualizada",
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        } catch (error) {
            console.error("Error al editar:", error);
            Swal.fire({ icon: "error", title: "Error", text: "No se pudo actualizar" });
        }
    };

    // --- TUS FUNCIONES ORIGINALES (SIN CAMBIOS) ---
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

        const taskBackup = { ...tarea };
        const subtasksBackup = [...(tarea.subtareas || [])];

        setTasks(prev => prev.filter(t => t.id !== tarea.id));

        try {
            const response = await fetch(`${API_URL}/tareas/api/tareas/${tarea.id}/`, {
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
                const restoreResponse = await fetch(`${API_URL}/tareas/api/tareas/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        nombre: taskBackup.nombre,
                        completada: taskBackup.completada,
                        parent: taskBackup.parent || null
                    })
                });
                const res = await restoreResponse.json();

                if (restoreResponse.ok) {
                    const newTask = res.data;
                    const restoredSubtasks = [];

                    if (subtasksBackup.length > 0) {
                        const subtaskPromises = subtasksBackup.map(sub =>
                            fetch(`${API_URL}/tareas/api/tareas/`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    nombre: sub.nombre,
                                    completada: sub.completada,
                                    parent: newTask.id
                                })
                            }).then(r => r.json())
                        );
                        const subResults = await Promise.all(subtaskPromises);
                        subResults.forEach(r => { if (r.data) restoredSubtasks.push(r.data); });
                    }
                    setTasks(prev => [...prev, { ...newTask, subtareas: restoredSubtasks }]);
                }
            }
        } catch (error) {
            Swal.fire({ icon: "error", title: "Error", text: "No se pudo eliminar" });
            setTasks(prev => [...prev, tarea]);
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
                        const nuevasSubtareas = t.subtareas.map(s =>
                            s.id === sub.id ? { ...s, completada: nuevoEstadoSubtarea } : s
                        );
                        const todasCompletadas = nuevasSubtareas.length > 0 && nuevasSubtareas.every(s => s.completada);
                        return { ...t, subtareas: nuevasSubtareas, completada: todasCompletadas };
                    }
                    return t;
                }));
            }
        } catch (error) { console.error(error); }
    };

    const toggleComplete = async () => {
        const nuevoEstadoPadre = !tarea.completada;
        const confirm = await Swal.fire({
            title: nuevoEstadoPadre ? "Completar tarea" : "Reabrir tarea",
            icon: "question",
            showCancelButton: true,
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
                setTasks(prev => prev.map(t => t.id === tarea.id ? { ...t, completada: nuevoEstadoPadre } : t));
            }
        } catch (error) { console.error(error); }
    };

    const handleAddSubtask = async () => {
        if (!subtaskInput.trim()) return;
        try {
            const response = await fetch(`${API_URL}/tareas/api/tareas/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre: subtaskInput, parent: tarea.id })
            });
            const res = await response.json();
            if (response.ok) {
                setTasks(prev => prev.map(t => t.id === tarea.id ? { ...t, subtareas: [...(t.subtareas || []), res.data] } : t));
                setSubtaskInput("");
            }
        } catch (error) { console.error(error); }
    };

    return (
        <div className={`bg-white border rounded-xl p-5 shadow-sm space-y-4 transition ${
            isEditing ? "border-emerald-500 ring-2 ring-emerald-50" : "border-gray-200 hover:shadow-md"
        }`}>
            {isEditing ? (
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <input
                            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={editNombre}
                            onChange={(e) => setEditNombre(e.target.value)}
                        />
                        <button onClick={handleUpdateTask} className="p-2 bg-emerald-600 text-white rounded-lg"><Check size={18} /></button>
                        <button onClick={() => setIsEditing(false)} className="p-2 bg-gray-100 text-gray-500 rounded-lg"><X size={18} /></button>
                    </div>
                    <textarea
                        className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
                        value={editDescripcion}
                        onChange={(e) => setEditDescripcion(e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                        <Brain size={14} className="text-gray-400" />
                        <select value={editCarga} onChange={(e) => setEditCarga(e.target.value)} className="text-xs border rounded p-1">
                            <option value="">Carga Mental</option>
                            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                </div>
            ) : (
                <div className="flex items-start gap-3">
                    <button onClick={toggleComplete} className={`mt-1 px-3 py-1 rounded-md text-xs font-bold ${tarea.completada ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                        {tarea.completada ? "Completada" : "○ Pendiente"}
                    </button>
                    <div className="flex-1">
                        <h3 className={`text-lg font-medium ${tarea.completada ? "line-through text-gray-400" : "text-gray-900"}`}>{tarea.nombre}</h3>
                        {tarea.descripcion && <p className="text-sm text-gray-500">{tarea.descripcion}</p>}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-blue-600"><Edit2 size={18} /></button>
                        <button onClick={handleDeleteTask} className="text-gray-400 hover:text-red-600"><Trash2 size={18} /></button>
                        <button onClick={() => setOpen(!open)} className="text-xs text-gray-400 border px-2 py-1 rounded">{open ? "Cerrar" : "Abrir"}</button>
                    </div>
                </div>
            )}

            {open && (
                <div className="space-y-2 ml-6 pt-2 border-t border-gray-50">
                    {subtasks.map(sub => (
                        <div key={sub.id} className="flex items-center gap-2 text-sm bg-gray-50 border border-gray-200 px-3 py-2 rounded-md">
                            <button onClick={() => toggleSubtask(sub)} className={`px-2 py-1 rounded-md text-xs font-bold ${sub.completada ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                                {sub.completada ? "✓" : "○"}
                            </button>
                            <span className={sub.completada ? "line-through text-gray-400" : ""}>{sub.nombre}</span>
                        </div>
                    ))}
                    <div className="flex gap-2 mt-3">
                        <input value={subtaskInput} onChange={(e) => setSubtaskInput(e.target.value)} placeholder="Nueva subtarea..." className="flex-1 px-3 py-1 border rounded-md text-sm outline-none" />
                        <button onClick={handleAddSubtask} className="px-3 py-1 bg-emerald-600 text-white rounded-md">+</button>
                    </div>
                </div>
            )}
        </div>
    );
}