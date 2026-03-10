import {useState, useEffect} from "react";
import Swal from "sweetalert2";
import {SubtaskSection} from "./taskCard/SubTaskSection.jsx";
import {TaskView} from "./taskCard/TaskView.jsx";
import {TaskEditForm} from "./taskCard/TaskEditForm.jsx";
import {actualizarTarea, eliminarTarea, crearTarea} from "../services/taskService";

export default function TaskCard({tarea, setTasks, API_URL}) {
    const [isEditing, setIsEditing] = useState(false);
    const [open, setOpen] = useState(true);
    const [subtaskInput, setSubtaskInput] = useState("");

    // Estado único para edición
    const [editData, setEditData] = useState({
        nombre: "",
        descripcion: "",
        carga_mental: "",
        fecha_entrega: "",
        tipo_tarea: "OT",
        curso: "",
        subtareas: []
    });

    useEffect(() => {
        setEditData({
            nombre: tarea.nombre,
            descripcion: tarea.descripcion || "",
            carga_mental: tarea.carga_mental,
            fecha_entrega: tarea.fecha_entrega ? tarea.fecha_entrega.slice(0, 16) : "",
            tipo_tarea: tarea.tipo_tarea || "OT",
            curso: tarea.curso || "",
            subtareas: tarea.subtareas || []
        });
    }, [tarea, isEditing]);

    const getMentalLoadConfig = (level) => {
        const configs = {
            1: {color: "bg-green-100 text-green-700 border-green-200", label: "Muy Baja"},
            2: {color: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Baja"},
            3: {color: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "Media"},
            4: {color: "bg-orange-100 text-orange-700 border-orange-200", label: "Alta"},
            5: {color: "bg-red-100 text-red-700 border-red-200", label: "Muy Alta"},
        };
        return configs[level] || {color: "bg-gray-100 text-gray-500 border-gray-200", label: "N/A"};
    };

    const formatearFecha = (fechaStr) => {
        if (!fechaStr) return "Sin fecha";
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString() + " " + fecha.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    };


    const handleUpdateTask = async () => {
        try {

            const res = await actualizarTarea(API_URL, tarea.id, {
                nombre: editData.nombre,
                descripcion: editData.descripcion,
                carga_mental: editData.carga_mental || null,
                fecha_entrega: editData.fecha_entrega
                    ? new Date(editData.fecha_entrega).toISOString()
                    : null,
                tipo_tarea: editData.tipo_tarea,
                curso: editData.curso
            });

            setTasks(prev =>
                prev.map(t =>
                    t.id === tarea.id
                        ? {...t, ...res.data, subtareas: editData.subtareas}
                        : t
                )
            );

            setIsEditing(false);

            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: "Actualizado",
                showConfirmButton: false,
                timer: 1500
            });

        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteTask = async () => {

        const confirm = await Swal.fire({
            title: "¿Eliminar?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444"
        });

        if (!confirm.isConfirmed) return;

        const backup = {...tarea, subtareas: [...(tarea.subtareas || [])]};

        setTasks(prev => prev.filter(t => t.id !== tarea.id));

        try {
            await eliminarTarea(API_URL, tarea.id);

            const result = await Swal.fire({
                toast: true,
                position: "bottom-end",
                icon: "info",
                title: "Eliminado",
                showConfirmButton: true,
                confirmButtonText: "Restaurar",
                timer: 4000
            });

            if (result.isConfirmed) {

                const newTask = await crearTarea(API_URL, {
                    nombre: backup.nombre,
                    descripcion: backup.descripcion,
                    fecha_entrega: backup.fecha_entrega,
                    carga_mental: backup.carga_mental,
                    tipo_tarea: backup.tipo_tarea,
                    curso: backup.curso
                });

                const restoredSubs = await Promise.all(
                    backup.subtareas.map(sub =>
                        crearTarea(API_URL, {
                            nombre: sub.nombre,
                            parent: newTask.data.id
                        })
                    )
                );

                setTasks(prev => [
                    ...prev, {...newTask.data, subtareas: restoredSubs.map(r => r.data)}
                ]);
            }

        } catch (e) {
            setTasks(prev => [...prev, tarea]);
        }
    };

    const toggleSubtask = async (sub) => {
        const nuevoEstado = !sub.completada;

        try {
            await actualizarTarea(API_URL, sub.id, {
                completada: nuevoEstado
            });

            setTasks(prev => prev.map(t => {
                    if (t.id === tarea.id) {
                        const newSubs = t.subtareas.map(s => s.id === sub.id ? {...s, completada: nuevoEstado} : s);

                        return {
                            ...t,
                            subtareas: newSubs,
                            completada: newSubs.every(s => s.completada)
                        };
                    }

                    return t;
                })
            );

        } catch (e) {
            console.error(e);
        }
    };

    const handleAddSubtask = async () => {

        if (!subtaskInput.trim()) return;

        try {
            const res = await crearTarea(API_URL, {
                nombre: subtaskInput,
                parent: tarea.id
            });

            setTasks(prev => prev.map(t => t.id === tarea.id ? {
                ...t,
                subtareas: [...(t.subtareas || []), res.data]
            } : t));

            setSubtaskInput("");

        } catch (e) {
            console.error(e);
        }
    };

    const toggleComplete = async () => {
        const nuevoEstado = !tarea.completada;

        try {

            await actualizarTarea(API_URL, tarea.id, {
                completada: nuevoEstado
            });

            setTasks(prev => prev.map(t => t.id === tarea.id
                    ? {...t, completada: nuevoEstado, subtareas: t.subtareas.map(s => ({
                            ...s, completada: nuevoEstado
                        }))
                    }
                    : t
                )
            );

        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div
            className={`bg-white border rounded-xl p-5 shadow-sm space-y-4 transition ${isEditing ? "border-emerald-500 ring-2 ring-emerald-50" : "border-gray-200 hover:shadow-md"}`}>
            {isEditing ? (
                <TaskEditForm
                    editData={editData} setEditData={setEditData}
                    onSave={handleUpdateTask} onCancel={() => setIsEditing(false)}
                    getMentalLoadConfig={getMentalLoadConfig}
                />
            ) : (
                <TaskView
                    tarea={tarea} onEdit={() => setIsEditing(true)} onDelete={handleDeleteTask}
                    onToggleComplete={toggleComplete} onToggleOpen={() => setOpen(!open)}
                    isOpen={open} getMentalLoadConfig={getMentalLoadConfig} formatearFecha={formatearFecha}
                />
            )}

            {open && (
                <SubtaskSection
                    subtareas={tarea.subtareas || []} subtaskInput={subtaskInput}
                    setSubtaskInput={setSubtaskInput} onAdd={handleAddSubtask} onToggle={toggleSubtask}
                />
            )}
        </div>
    );
}