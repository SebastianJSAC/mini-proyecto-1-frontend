import {useState, useEffect} from "react";
import {BookOpen, Sparkles} from "lucide-react";
import Swal from "sweetalert2";
import {Trash2, Edit2, Check, X, CalendarDays, Brain} from "lucide-react";

export default function TaskCard({descripcionInput, tarea, setTasks, API_URL, navigate}) {
    const [isEditing, setIsEditing] = useState(false);
    const [editNombre, setEditNombre] = useState(tarea.nombre);
    const [editDescripcion, setEditDescripcion] = useState(tarea.descripcion || "");
    const [editCarga, setEditCarga] = useState(tarea.carga_mental || "");
    const [editFechaEntrega, setEditFechaEntrega] = useState(tarea.fecha_entrega ? tarea.fecha_entrega.slice(0, 16) : "");
    const [editSubtareas, setEditSubtareas] = useState(tarea.subtareas || []);
    const [editTipo, setEditTipo] = useState(tarea.tipo_tarea || "OT");
    const [editCurso, setEditCurso] = useState(tarea.curso || "");
    const [subtaskInput, setSubtaskInput] = useState("");
    const [open, setOpen] = useState(true);

    const subtasks = tarea.subtareas || [];

    // Mapeo para mostrar etiquetas legibles del Enum
    const tipoTareaLabels = {
        'EX': 'Examen',
        'QU': 'Quiz',
        'TA': 'Taller',
        'PR': 'Proyecto',
        'OT': 'Otro'
    };

    useEffect(() => {
        if (isEditing) {
            setEditNombre(tarea.nombre);
            setEditSubtareas(tarea.subtareas || []);
        }
    }, [isEditing, tarea]);

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

    const handleCancelEdit = () => {
        // Restauramos todos los estados a los valores originales de la tarea
        setEditNombre(tarea.nombre);
        setEditDescripcion(tarea.descripcion || "");
        setEditCarga(tarea.carga_mental);
        setEditFechaEntrega(tarea.fecha_entrega ? tarea.fecha_entrega.slice(0, 16) : "");
        setEditTipo(tarea.tipo_tarea || "OT");
        setEditCurso(tarea.curso || "");

        // Restaurar las subtareas a su estado original
        setEditSubtareas(tarea.subtareas || []);

        // Finalmente cerramos el modo edición
        setIsEditing(false);

        // Limpiamos la ruta para el profesor
        navigate("/hoy");
    };

    const handleUpdateTask = async () => {
        if (!editNombre.trim()) return;

        navigate(`/hoy/editar/${tarea.id}`);

        try {
            // Actualizar Tarea Padre
            const response = await fetch(`${API_URL}/tareas/api/tareas/${tarea.id}/`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    nombre: editNombre,
                    descripcion: editDescripcion,
                    carga_mental: editCarga || null,
                    fecha_entrega: editFechaEntrega ? new Date(editFechaEntrega).toISOString() : null,
                    tipo_tarea: editTipo,
                    curso: editCurso
                })
            });

            if (response.ok) {
                // Actualizar Subtareas (una por una)
                const promesasSubtareas = editSubtareas.map(sub =>
                    fetch(`${API_URL}/tareas/api/tareas/${sub.id}/`, {
                        method: "PATCH",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({nombre: sub.nombre})
                    }).then(r => r.json())
                );

                await Promise.all(promesasSubtareas);

                // Refrescar estado local
                const res = await response.json();
                setTasks(prev => prev.map(t =>
                    t.id === tarea.id ? {...t, ...res.data, subtareas: editSubtareas} : t
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
                setTimeout(() => navigate("/hoy"), 1000);
            }
        } catch (error) {
            console.error("Error:", error);
            navigate("/hoy");
        }
    };

    const handleDeleteTask = async () => {
        //Ruta crear
        navigate(`/hoy/eliminar/${tarea.id}`);

        const confirm = await Swal.fire({
            title: "Eliminar tarea",
            text: "¿Seguro que quieres eliminar esta tarea?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#ef4444"
        });

        if (!confirm.isConfirmed) {
            setTimeout(() => navigate("/hoy"), 1500);
            return;
        }

        const taskBackup = {...tarea};
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
                confirmButtonText: "Restaurar tarea",
                timer: 4000,
                timerProgressBar: true
            });

            //Restaurar
            if (result.isConfirmed) {
                navigate(`/hoy/restaurar/${tarea.id}`);

                const restoreResponse = await fetch(`${API_URL}/tareas/api/tareas/`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        nombre: taskBackup.nombre,
                        completada: taskBackup.completada,
                        parent: taskBackup.parent || null,
                        carga_mental: taskBackup.carga_mental,
                        fecha_entrega: taskBackup.fecha_entrega,
                        curso: taskBackup.curso,
                        tipo_tarea: taskBackup.tipo_tarea,
                        fecha_creacion: taskBackup.fecha_creacion || taskBackup.created_at
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
                                headers: {"Content-Type": "application/json"},
                                body: JSON.stringify({
                                    nombre: sub.nombre,
                                    completada: sub.completada,
                                    parent: newTask.id,
                                    carga_mental: sub.carga_mental || null,
                                    fecha_entrega: sub.fecha_entrega || null
                                })
                            }).then(r => r.json())
                        );
                        const subResults = await Promise.all(subtaskPromises);
                        subResults.forEach(r => {
                            if (r.data) restoredSubtasks.push(r.data);
                        });
                    }
                    setTasks(prev => [...prev, {...newTask, subtareas: restoredSubtasks}]);
                }
            }
        } catch (error) {
            Swal.fire({icon: "error", title: "Error", text: "No se pudo eliminar"});
            setTasks(prev => [...prev, tarea]);
        } finally {
            setTimeout(() => navigate("/hoy"), 500);
        }
    };

    const toggleSubtask = async (sub) => {
        const nuevoEstadoSubtarea = !sub.completada;
        try {
            const response = await fetch(`${API_URL}/tareas/api/tareas/${sub.id}/`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({completada: nuevoEstadoSubtarea})
            });
            if (response.ok) {
                setTasks(prevTasks => prevTasks.map(t => {
                    if (t.id === tarea.id) {
                        // Actualizamos la lista de subtareas
                        const nuevasSubtareas = (t.subtareas || []).map(s =>
                            s.id === sub.id ? {...s, completada: nuevoEstadoSubtarea} : s
                        );

                        // Opcional: Si quieres que el padre se complete solo si todas están listas
                        const todasCompletadas = nuevasSubtareas.length > 0 && nuevasSubtareas.every(s => s.completada);

                        // Si se acaban de completar todas, lanzamos el mensaje de éxito
                        if (todasCompletadas && !tarea.completada) {
                            Swal.fire({
                                toast: true,
                                position: 'top-end',
                                text: '¡Misión cumplida! Todas las subtareas listas.',
                                showConfirmButton: false,
                                timer: 2000,
                                icon: 'success'
                            });
                        }

                        return {
                            ...t,
                            subtareas: nuevasSubtareas,
                            completada: todasCompletadas
                        };
                    }
                    return t;
                }));

                setTasks(prev => prev.map(t => {
                    if (t.id === tarea.id) {
                        const nuevasSubtareas = t.subtareas.map(s =>
                            s.id === sub.id ? {...s, completada: nuevoEstadoSubtarea} : s
                        );
                        const todasCompletadas = nuevasSubtareas.length > 0 && nuevasSubtareas.every(s => s.completada);
                        return {...t, subtareas: nuevasSubtareas, completada: todasCompletadas};
                    }
                    return t;
                }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const toggleComplete = async () => {
        const nuevoEstadoPadre = !tarea.completada;

        const confirm = await Swal.fire({
            title: nuevoEstadoPadre ? "¿Marcar tarea como completada?" : "¿Reabrir tarea?",
            text: nuevoEstadoPadre ? "Esto completará también todas las subtareas." : "Se reabrirá la tarea principal y todas sus Sub-Tareas.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#10b981",
            confirmButtonText: "Sí, cambiar",
            cancelButtonText: "Cancelar"
        });

        if (!confirm.isConfirmed) return;

        try {
            const response = await fetch(`${API_URL}/tareas/api/tareas/${tarea.id}/`, {
                method: "PATCH",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({completada: nuevoEstadoPadre})
            });

            if (response.ok) {

                if (!tarea.completada) {
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        text: 'Tarea completada',
                        showConfirmButton: false,
                        icon: 'success'
                    });
                }

                if (!nuevoEstadoPadre) {
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        text: 'Tarea y subtareas reabiertas',
                        showConfirmButton: false,
                        timer: 1500,
                        icon: 'info'
                    });
                }

                setTasks(prev => prev.map(t => {
                    if (t.id === tarea.id) {
                        // Si completamos el padre, completamos todas las subtareas localmente
                        const subtareasActualizadas = (t.subtareas || []).map(sub => ({
                            ...sub,
                            completada: nuevoEstadoPadre
                        }));

                        return {
                            ...t,
                            completada: nuevoEstadoPadre,
                            subtareas: subtareasActualizadas
                        };
                    }
                    return t;
                }));
            }
        } catch (error) {
            console.error("Error al actualizar estado de la tarea:", error);
        }
    };

    const handleAddSubtask = async () => {
        if (!subtaskInput.trim()) return;

        //Ruta crear
        navigate(`/hoy/subtarea/${tarea.id}`);

        try {
            const response = await fetch(`${API_URL}/tareas/api/tareas/`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({nombre: subtaskInput, parent: tarea.id})
            });
            const res = await response.json();
            if (response.ok) {
                setTasks(prev => prev.map(t => t.id === tarea.id ? {
                    ...t,
                    subtareas: [...(t.subtareas || []), res.data]
                } : t));
                setSubtaskInput("");

                await Swal.fire({
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    icon: "success",
                    title: "Sub-Tarea agregada",
                    timer: 4000,
                    timerProgressBar: true
                });
            }

            setTimeout(() => navigate("/hoy"), 1500);
        } catch (error) {
            console.error(error);
        }
    };

    const formatearFecha = (fechaStr) => {
        if (!fechaStr) return "Sin fecha";
        const fecha = new Date(fechaStr);
        return fecha.toLocaleDateString() + " " + fecha.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    };

    return (
        <div className={`bg-white border rounded-xl p-5 shadow-sm space-y-4 transition ${isEditing ? "border-emerald-500 ring-2 ring-emerald-50" : "border-gray-200 hover:shadow-md"}`}>
            {isEditing ? (
                <div className="space-y-4">
                    {/* Cabecera de Edición: Nombre y Botones de Acción */}
                    <div className="flex gap-2">
                        <input
                            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                            value={editNombre}
                            onChange={(e) => setEditNombre(e.target.value)}
                            placeholder="Nombre de la tarea"
                        />
                        <button
                            onClick={handleUpdateTask}
                            disabled={!editNombre.trim() || !editFechaEntrega || editCarga === "" || editSubtareas.some(sub => !sub.nombre.trim())}
                            className={`p-2 rounded-lg transition-colors ${(!editNombre.trim() || !editFechaEntrega || !editCarga)
                                ? "bg-gray-300 cursor-not-allowed text-gray-500"
                                : "bg-emerald-600 text-white hover:bg-emerald-700"
                            }`}
                        >
                            <Check size={18}/>
                        </button>
                        <button
                            onClick={handleCancelEdit}
                            className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <X size={18}/>
                        </button>
                    </div>

                    {/* Curso y Tipo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Curso / Materia:</label>
                            <div className="flex items-center gap-2 border rounded-lg px-2 py-1.5 bg-gray-50 focus-within:bg-white focus-within:border-emerald-500 transition-all">
                                <BookOpen size={14} className="text-gray-400"/>
                                <input
                                    className="text-sm outline-none w-full bg-transparent"
                                    value={editCurso}
                                    onChange={(e) => setEditCurso(e.target.value)}
                                    placeholder="Ej: Matemáticas"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Tipo de Actividad:</label>
                            <div className="flex items-center gap-2 border rounded-lg px-2 py-1.5 bg-gray-50 focus-within:bg-white focus-within:border-emerald-500 transition-all">
                                <Sparkles size={14} className="text-gray-400"/>
                                <select
                                    className="text-sm outline-none w-full bg-transparent cursor-pointer"
                                    value={editTipo}
                                    onChange={(e) => setEditTipo(e.target.value)}
                                >
                                    <option value="EX">Examen</option>
                                    <option value="QU">Quiz</option>
                                    <option value="TA">Taller</option>
                                    <option value="PR">Proyecto</option>
                                    <option value="OT">Otro</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Descripción */}
                    <div className="relative w-full">
                    <textarea
                        maxLength={100}
                        className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-emerald-500 min-h-[80px]"
                        placeholder="Descripción de la tarea..."
                        value={editDescripcion}
                        onChange={(e) => setEditDescripcion(e.target.value)}
                    />
                        <div className={`absolute bottom-2 right-2 text-[10px] font-mono px-1.5 py-0.5 rounded shadow-sm border ${editDescripcion.length >= 90 ? "bg-red-50 text-red-600 border-red-100" : "bg-gray-50 text-gray-400 border-gray-100"}`}>
                            {100 - editDescripcion.length}
                        </div>
                    </div>

                    {/* Fecha y Carga Mental */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex flex-col flex-1">
                            <label className="text-[10px] text-gray-500 font-bold uppercase">Fecha de entrega:</label>
                            <input
                                type="datetime-local"
                                value={editFechaEntrega}
                                onChange={(e) => setEditFechaEntrega(e.target.value)}
                                className="border p-2 rounded-lg text-xs mt-1 outline-none focus:border-emerald-500"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                                <Brain size={14}/> CARGA MENTAL:
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(n => (
                                    <button
                                        key={n}
                                        type="button"
                                        onClick={() => setEditCarga(n)}
                                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${Number(editCarga) === n
                                            ? getMentalLoadConfig(n).color + " ring-2 ring-offset-2 ring-emerald-500 shadow-sm"
                                            : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
                                        }`}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* --- AQUÍ ESTÁ LO QUE FALTABA: GESTIÓN DE SUBTAREAS EN EDICIÓN --- */}
                    <div className="space-y-2 pt-2 border-t border-dashed">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Editar Subtareas:</label>
                        {editSubtareas.map((sub, index) => (
                            <div key={sub.id || index} className="flex gap-2">
                                <input
                                    className="flex-1 px-3 py-1.5 border rounded-lg text-sm bg-gray-50 focus:bg-white outline-none focus:border-emerald-500"
                                    value={sub.nombre}
                                    onChange={(e) => {
                                        const newSubs = [...editSubtareas];
                                        newSubs[index].nombre = e.target.value;
                                        setEditSubtareas(newSubs);
                                    }}
                                />
                                <button
                                    onClick={() => setEditSubtareas(editSubtareas.filter((_, i) => i !== index))}
                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={14}/>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                /* --- VISTA NORMAL */
                <div className="flex items-start gap-3">
                    <button onClick={toggleComplete}
                            className={`mt-1 px-3 py-1 rounded-md text-xs font-bold flex-shrink-0 transition-colors ${tarea.completada ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                        {tarea.completada ? "Completada" : "○ Pendiente"}
                    </button>

                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className={`text-lg font-medium leading-tight ${tarea.completada ? "line-through text-gray-400" : "text-gray-900"}`}>
                                {tarea.nombre}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold uppercase">
                            {{ EX: 'Examen', QU: 'Quiz', TA: 'Taller', PR: 'Proyecto', OT: 'Otro' }[tarea.tipo_tarea] || 'Otro'}
                        </span>
                            {tarea.curso && (
                                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-medium flex items-center gap-1">
                                <BookOpen size={10}/> {tarea.curso}
                            </span>
                            )}
                            {tarea.carga_mental && (
                                <span className={`px-2 py-0.5 rounded-full flex items-center justify-center text-[10px] font-bold border flex-shrink-0 ${getMentalLoadConfig(tarea.carga_mental).color}`}>
                                {getMentalLoadConfig(tarea.carga_mental).label}
                            </span>
                            )}
                        </div>
                        {tarea.descripcion && <p className="text-sm text-gray-500 line-clamp-2">{tarea.descripcion}</p>}
                        <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-medium">
                            <CalendarDays className="w-3 h-3"/>
                            Entrega: {formatearFecha(tarea.fecha_entrega)}
                        </div>
                    </div>

                    <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => setIsEditing(true)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16}/></button>
                        <button onClick={handleDeleteTask} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                        <button onClick={() => setOpen(!open)} className="text-xs font-medium text-gray-400 hover:text-gray-600 px-2 py-1 transition-colors">
                            {open ? "Contraer" : "Detalle"}
                        </button>
                    </div>
                </div>
            )}

            {/* --- SECCIÓN SUBTAREAS (VISTA DETALLE) --- */}
            {open && (
                <div className="space-y-2 ml-6 pt-3 border-t border-gray-50">
                    {subtasks.length > 0 ? subtasks.map(sub => (
                        <div key={sub.id} className="flex items-center gap-2 text-sm bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg">
                            <button onClick={() => toggleSubtask(sub)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-black transition-colors ${sub.completada ? "bg-green-200 text-green-800" : "bg-white text-slate-400 border border-slate-200"}`}>
                                {sub.completada ? "✓" : "○"}
                            </button>
                            <span className={`transition-all ${sub.completada ? "line-through text-gray-400" : "text-gray-700"}`}>
                            {sub.nombre}
                        </span>
                        </div>
                    )) : (
                        <p className="text-xs text-gray-400 italic ml-1">No hay subtareas pendientes.</p>
                    )}

                    <div className="flex gap-2 mt-4">
                        <input
                            value={subtaskInput}
                            onChange={(e) => setSubtaskInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                            placeholder="Añadir subtarea rápida..."
                            className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />
                        <button
                            onClick={handleAddSubtask}
                            disabled={!subtaskInput.trim()}
                            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${!subtaskInput.trim() ? "bg-gray-200 text-gray-400" : "bg-emerald-600 text-white"}`}
                        >
                            +
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}