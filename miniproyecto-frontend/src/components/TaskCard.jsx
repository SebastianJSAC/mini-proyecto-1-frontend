import {useState, useEffect} from "react";
import Swal from "sweetalert2";
import {SubtaskSection} from "./taskCard/SubTaskSection.jsx";
import {TaskView} from "./taskCard/TaskView.jsx";
import {TaskEditForm} from "./taskCard/TaskEditForm.jsx";

export default function TaskCard({tarea, setTasks, API_URL, navigate}) {
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
        const token = localStorage.getItem("token");
        navigate(`/hoy/editar/${tarea.id}`);

        try {
            const response = await fetch(`${API_URL}/tareas/api/tareas/${tarea.id}/`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`},
                body: JSON.stringify({
                    nombre: editData.nombre,
                    descripcion: editData.descripcion,
                    carga_mental: editData.carga_mental || null,
                    fecha_entrega: editData.fecha_entrega ? new Date(editData.fecha_entrega).toISOString() : null,
                    tipo_tarea: editData.tipo_tarea,
                    curso: editData.curso
                })
            });

            if (response.ok) {
                const promesasSubtareas = editData.subtareas.map(sub =>
                    fetch(`${API_URL}/tareas/api/tareas/${sub.id}/`, {
                        method: "PATCH",
                        headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`},
                        body: JSON.stringify({nombre: sub.nombre})
                    })
                );
                await Promise.all(promesasSubtareas);

                const res = await response.json();
                setTasks(prev => prev.map(t => t.id === tarea.id ? {
                    ...t, ...res.data,
                    subtareas: editData.subtareas
                } : t));
                setIsEditing(false);
                Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "success",
                    title: "Actualizado",
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            navigate("/hoy");
        }
    };

    const handleDeleteTask = async () => {
        navigate(`/hoy/eliminar/${tarea.id}`);
        const token = localStorage.getItem("token");
        const confirm = await Swal.fire({
            title: "¿Eliminar?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444"
        });

        if (!confirm.isConfirmed) return navigate("/hoy");

        const backup = {...tarea, subtareas: [...(tarea.subtareas || [])]};
        setTasks(prev => prev.filter(t => t.id !== tarea.id));

        try {
            await fetch(`${API_URL}/tareas/api/tareas/${tarea.id}/`, {
                method: "DELETE",
                headers: {"Authorization": `Bearer ${token}`}
            });
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

                //Restaurar tarea padre
                const restoreRes = await fetch(`${API_URL}/tareas/api/tareas/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        nombre: backup.nombre,
                        descripcion: backup.descripcion,
                        fecha_entrega: backup.fecha_entrega,
                        carga_mental: backup.carga_mental,
                        tipo_tarea: backup.tipo_tarea,
                        curso: backup.curso
                    })
                });

                if (!restoreRes.ok) return;

                const newT = (await restoreRes.json()).data;

                let nuevasSubtareas = [];

                //Restaurar subtareas
                if (backup.subtareas?.length) {

                    const responses = await Promise.all(
                        backup.subtareas.map(sub =>
                            fetch(`${API_URL}/tareas/api/tareas/`, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${token}`
                                },
                                body: JSON.stringify({
                                    nombre: sub.nombre,
                                    parent: newT.id
                                })
                            })
                        )
                    );

                    nuevasSubtareas = await Promise.all(
                        responses.map(r => r.json())
                    );

                    nuevasSubtareas = nuevasSubtareas.map(r => r.data || r);
                }

                //Actualizar estado
                setTasks(prev => [
                    ...prev,
                    {
                        ...newT,
                        subtareas: nuevasSubtareas
                    }
                ]);
            }
        } catch (e) {
            setTasks(prev => [...prev, tarea]);
        } finally {
            navigate("/hoy");
        }
    };

    const toggleSubtask = async (sub) => {
        const token = localStorage.getItem("token");
        const nuevoEstado = !sub.completada;
        try {
            const response = await fetch(`${API_URL}/tareas/api/tareas/${sub.id}/`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`},
                body: JSON.stringify({completada: nuevoEstado})
            });
            if (response.ok) {
                setTasks(prev => prev.map(t => {
                    if (t.id === tarea.id) {
                        const newSubs = t.subtareas.map(s => s.id === sub.id ? {...s, completada: nuevoEstado} : s);
                        return {...t, subtareas: newSubs, completada: newSubs.every(s => s.completada)};
                    }
                    return t;
                }));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddSubtask = async () => {
        if (!subtaskInput.trim()) return;
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_URL}/tareas/api/tareas/`, {
                method: "POST",
                headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`},
                body: JSON.stringify({nombre: subtaskInput, parent: tarea.id})
            });
            if (response.ok) {
                const res = await response.json();
                setTasks(prev => prev.map(t => t.id === tarea.id ? {
                    ...t,
                    subtareas: [...(t.subtareas || []), res.data]
                } : t));
                setSubtaskInput("");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const toggleComplete = async () => {
        const token = localStorage.getItem("token");
        const nuevoEstado = !tarea.completada;
        try {
            const response = await fetch(`${API_URL}/tareas/api/tareas/${tarea.id}/`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`},
                body: JSON.stringify({completada: nuevoEstado})
            });
            if (response.ok) {
                setTasks(prev => prev.map(t => t.id === tarea.id ? {
                    ...t,
                    completada: nuevoEstado,
                    subtareas: t.subtareas.map(s => ({...s, completada: nuevoEstado}))
                } : t));
            }
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