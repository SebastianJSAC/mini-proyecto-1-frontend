import Swal from "sweetalert2";
import {actualizarTarea, eliminarTarea, crearTarea} from "../services/taskService";
import axios from "axios";
import {mostrarToast} from '../helpers/taskHelpers.js'

export const useTask = (tarea, setTasks, API_URL) => {

    const updateLocalTask = (changes) => {
        setTasks(prev => prev.map(t => t.id === tarea.id ? {...t, ...changes} : t));
    };

    const handleAddTask = async (taskData, tempSubtasks) => {
        try {
            // Crear la tarea principal
            const res = await crearTarea(API_URL, {
                nombre: taskData.nombre,
                descripcion: taskData.descripcion || "Descripción de la tarea vacía",
                fecha_entrega: taskData.fecha_entrega,
                carga_mental: taskData.carga_mental || null,
                tipo_tarea: taskData.tipo_tarea,
                curso: taskData.curso || null
            });

            const tareaCreada = res.data || res;

            // Crear las subtareas si existen
            if (tempSubtasks && tempSubtasks.length > 0) {
                const promesas = tempSubtasks.map(subNombre =>
                    crearTarea(API_URL, {
                        nombre: subNombre,
                        parent: tareaCreada.id
                    })
                );
                const resSubtareas = await Promise.all(promesas);

                // Actualizar estado local con subtareas incluidas
                const tareaCompleta = {
                    ...tareaCreada,
                    subtareas: resSubtareas.map(r => r.data || r)
                };
                setTasks(prev => [...prev, tareaCompleta]);
            } else {
                // Si no hay subtareas, solo añadir la principal
                setTasks(prev => [...prev, {...tareaCreada, subtareas: []}]);
            }

            mostrarToast("Tarea agregada correctamente", "success");
            return true; // Para indicar éxito al componente
        } catch (error) {
            console.error("Error creando tarea:", error);
            mostrarToast("Error al crear la tarea", "error");
            return false;
        }
    };

    const handleUpdate = async (editData) => {
        try {
            //Actualizar la tarea principal
            const res = await actualizarTarea(API_URL, tarea.id, {
                nombre: editData.nombre,
                descripcion: editData.descripcion,
                carga_mental: editData.carga_mental,
                fecha_entrega: editData.fecha_entrega ? new Date(editData.fecha_entrega).toISOString() : null,
                tipo_tarea: editData.tipo_tarea,
                curso: editData.curso
            });

            //Actualizar cada subtarea
            await Promise.all(
                editData.subtareas.map(sub =>
                    actualizarTarea(API_URL, sub.id, {
                        nombre: sub.nombre,
                        completada: sub.completada
                    })
                )
            );

            updateLocalTask({
                ...res.data, subtareas:
                editData.subtareas
            });

            mostrarToast('Actualizado', "success")
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    const handleDelete = async () => {
        const confirm = await Swal.fire({
            title: `¿Eliminar la tarea ${tarea.nombre}?`,
            text: "Esta acción no puede deshacerse, se eliminará permanentemente la tarea y todas su subtareas asociadas",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444"
        });

        if (!confirm.isConfirmed) return;

        const backup = {...tarea};
        setTasks(prev => prev.filter(t => t.id !== tarea.id));

        try {
            await eliminarTarea(API_URL, tarea.id);
            const result = await Swal.fire({
                toast: true,
                position: "top-end",
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
            setTasks(prev => [...prev, backup]);
        }
    };

    const handleAddSubtask = async (subTaskInput, setSubTaskInput) => {
        if (!subTaskInput.trim()) return;
        try {
            const res = await crearTarea(API_URL, {nombre: subTaskInput, parent: tarea.id});
            updateLocalTask({subtareas: [...(tarea.subtareas || []), res.data]});
            setSubTaskInput("");
        } catch (e) {
            console.error(e);
        }
    };

    const handleToggleSubtask = async (sub) => {
        const nuevoEstado = !sub.completada;
        try {
            await actualizarTarea(API_URL, sub.id, {completada: nuevoEstado});

            setTasks(prev => prev.map(t => {
                if (t.id === tarea.id) {
                    const newSubs = t.subtareas.map(s => s.id === sub.id ? {...s, completada: nuevoEstado} : s);
                    const todasCompletadas = newSubs.length > 0 && newSubs.every(s => s.completada);

                    // Alerta si acabas de completar la última que faltaba
                    if (todasCompletadas && !tarea.completada) {
                        Swal.fire({
                            title: "¡Excelente!",
                            text: "Has terminado todas las subtareas. La tarea principal se ha completado",
                            icon: "success",
                            showCancelButton: false,
                        }).then((result) => {
                            if (result.isConfirmed) handleToggleMainTask();
                        });
                    }

                    return {...t, subtareas: newSubs, completada: todasCompletadas};
                }
                return t;
            }));

        } catch (e) {
            console.error(e);
        }
    };

    const handleToggleMainTask = async () => {
        const estaCompletada = tarea.completada;
        const nuevoEstado = !estaCompletada;

        // Si la tarea está completada y se intenta reabrir
        if (estaCompletada) {
            const confirmReopen = await Swal.fire({
                title: "¿Reabrir tarea?",
                text: "La tarea y sus subtareas volverán a estar pendientes.",
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#10b981",
                confirmButtonText: "Sí, reabrir",
                cancelButtonText: "Cancelar"
            });

            if (!confirmReopen.isConfirmed) return;
        }

        try {
            await actualizarTarea(API_URL, tarea.id, {completada: nuevoEstado});
            updateLocalTask({
                completada: nuevoEstado,
                subtareas: (tarea.subtareas || []).map(s => ({...s, completada: nuevoEstado}))
            });

            if (nuevoEstado) {
                mostrarToast("Tarea completada","success");
            } else {
                mostrarToast("Tarea reabierta","success");
            }

        } catch (e) {
            console.error(e);
        }
    };

    // Función para completar todas las vencidas
    const handleCompleteAllVencidas = async (vencidas) => {
        if (!vencidas || vencidas.length === 0) return;

        const confirmacion = await Swal.fire({
            title: "¿Completar todas?",
            text: `Se marcarán como terminadas ${vencidas.length} tareas vencidas.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#10b981",
            confirmButtonText: "Sí, completar todo"
        });

        if (!confirmacion.isConfirmed) return;

        try {
            const promesas = vencidas.map(t =>
                axios.patch(`${API_URL}/tareas/api/tareas/${t.id}/`, {completada: true}, {
                    headers: {Authorization: `Bearer ${localStorage.getItem("token")}`}
                })
            );
            await Promise.all(promesas);

            const IDsVencidas = vencidas.map(t => t.id);
            setTasks(prev => prev.map(t =>
                IDsVencidas.includes(t.id) ? {...t, completada: true} : t
            ));

            mostrarToast("Tareas vencidas completadas","success");

        } catch (error) {
            console.error(error);
            Swal.fire("Error", "No se pudieron completar las tareas", "error");
        }
    };

    return {
        handleAddTask,
        handleUpdate,
        handleDelete,
        handleAddSubtask,
        handleToggleSubtask,
        handleToggleMainTask,
        handleCompleteAllVencidas
    };
};