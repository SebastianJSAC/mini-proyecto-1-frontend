import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { SubtaskSection } from "./taskCard/SubTaskSection.jsx";
import {TaskView} from "./taskCard/TaskView.jsx";
import {TaskEditForm} from "./taskCard/TaskEditForm.jsx";
import {useTask} from "../hooks/useTask";
import {getMentalLoadConfig, formatearFecha} from "../helpers/taskHelpers";

export default function TaskCard({
    tarea,
    setTasks,
    API_URL,
    verticalLayout = false,
    variant = "default",
    cardAccent = "",
}) {
    const isKanban = variant === "kanban";
    const [isEditing, setIsEditing] = useState(false);
    const [open, setOpen] = useState(!isKanban);
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

    useEffect(() => {
        if (!isKanban || !isEditing) return;
        const onKey = (e) => {
            if (e.key === "Escape") setIsEditing(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isKanban, isEditing]);

    const defaultShell =
        "bg-white border-2 rounded-xl p-5 shadow-sm space-y-4 transition outline-none border-gray-200 hover:border-emerald-200 hover:shadow-md focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/25";
    const kanbanShell = `bg-white rounded-lg border border-slate-200/90 p-4 space-y-3 shadow-sm hover:shadow-md transition outline-none border-l-4 ${cardAccent} focus-within:ring-2 focus-within:ring-emerald-500/20`;

    return (
        <div
            className={`${isKanban ? kanbanShell : defaultShell} ${isEditing ? "border-emerald-500 ring-2 ring-emerald-100 !border-2" : ""}`}
        >
            {isEditing && !isKanban ? (
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
                    verticalLayout={verticalLayout}
                    compact={isKanban}
                    onDetailsClick={
                        isKanban
                            ? () => {
                                  if (!open) setOpen(true);
                              }
                            : undefined
                    }
                />
            )}

            {isKanban &&
                isEditing &&
                editData &&
                createPortal(
                    <div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={`edit-task-${tarea.id}`}
                        onClick={() => setIsEditing(false)}
                    >
                        <div
                            className="w-full max-w-2xl max-h-[min(90vh,760px)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 id={`edit-task-${tarea.id}`} className="mb-4 text-lg font-bold text-slate-900">
                                Editar tarea
                            </h2>
                            <TaskEditForm
                                editData={editData}
                                setEditData={setEditData}
                                onSave={onSave}
                                onCancel={() => setIsEditing(false)}
                                getMentalLoadConfig={getMentalLoadConfig}
                            />
                        </div>
                    </div>,
                    document.body
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