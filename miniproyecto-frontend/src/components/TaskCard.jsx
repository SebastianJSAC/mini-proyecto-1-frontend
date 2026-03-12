import {useState, useEffect} from "react";
import {SubtaskSection} from "./taskCard/SubTaskSection.jsx";
import {TaskView} from "./taskCard/TaskView.jsx";
import {TaskEditForm} from "./taskCard/TaskEditForm.jsx";
import {useTask} from "../hooks/useTask";
import {getMentalLoadConfig, formatearFecha} from "../helpers/taskHelpers";

export default function TaskCard({tarea, setTasks, API_URL}) {
    const [isEditing, setIsEditing] = useState(false);
    const [open, setOpen] = useState(true);
    const [subtaskInput, setSubtaskInput] = useState("");

    const actions = useTask(tarea, setTasks, API_URL);

    // Estado único para edición
    const [editData, setEditData] = useState(null);

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
    },[tarea, isEditing]);

    const onSave = async () => {
        const success = await actions.handleUpdate(editData);
        if (success) setIsEditing(false);
    };

    return (
        <div
            className={`bg-white border rounded-xl p-5 shadow-sm space-y-4 transition ${isEditing ? "border-emerald-500 ring-2 ring-emerald-50" : "border-gray-200 hover:shadow-md"}`}>
            {isEditing ? (
                <TaskEditForm
                    editData={editData}
                    setEditData={setEditData}
                    onSave={onSave}
                    onCancel={() => setIsEditing(false)}
                    getMentalLoadConfig={getMentalLoadConfig}
                />
            ) : (
                <TaskView
                    tarea={tarea}
                    onEdit={() => setIsEditing(true)}
                    onDelete={actions.handleDelete}
                    onToggleComplete={actions.handleToggleMainTask}
                    onToggleOpen={() => setOpen(!open)}
                    isOpen={open}
                    getMentalLoadConfig={getMentalLoadConfig}
                    formatearFecha={formatearFecha}
                />
            )}

            {open && (
                <SubtaskSection
                    subtareas={tarea.subtareas || []}
                    subtaskInput={subtaskInput}
                    setSubtaskInput={setSubtaskInput}
                    onAdd={() => actions.handleAddSubtask(subtaskInput, setSubtaskInput)}
                    onToggle={actions.handleToggleSubtask}
                />
            )}
        </div>
    );
}