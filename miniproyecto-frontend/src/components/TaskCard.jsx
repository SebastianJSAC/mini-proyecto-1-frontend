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
            duracion_estimada_minutos: tarea.duracion_estimada_minutos ?? 60,
            prioridad: tarea.prioridad || "MEDIA",
            fecha_planificada: tarea.fecha_planificada || "",
            subtareas: tarea.subtareas || [],
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

    const handleKanbanCardClick = (e) => {
        if (!isKanban || isEditing) return;
        if (e.target.closest("button, a, input, textarea, select, [data-no-toggle]")) return;
        setOpen((o) => !o);
    };

    return (
        <div
            role={isKanban && !isEditing ? "button" : undefined}
            tabIndex={isKanban && !isEditing ? 0 : undefined}
            aria-expanded={isKanban && !isEditing ? open : undefined}
            onClick={handleKanbanCardClick}
            onKeyDown={
                isKanban && !isEditing
                    ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setOpen((o) => !o);
                          }
                      }
                    : undefined
            }
            className={`${isKanban ? kanbanShell : defaultShell} ${isKanban && !isEditing ? "cursor-pointer focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2" : ""} ${isEditing ? "border-emerald-500 ring-2 ring-emerald-100 !border-2" : ""}`}
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
                    onEdit={(e) => {
                        e?.stopPropagation?.();
                        setIsEditing(true);
                    }}
                    onDelete={(e) => {
                        e?.stopPropagation?.();
                        actions.handleDelete();
                    }}
                    onToggleComplete={(e) => {
                        e?.stopPropagation?.();
                        actions.handleToggleMainTask();
                    }}
                    onToggleOpen={() => setOpen(!open)}
                    isOpen={open}
                    getMentalLoadConfig={getMentalLoadConfig}
                    formatearFecha={formatearFecha}
                    verticalLayout={verticalLayout}
                    compact={isKanban}
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
                <div data-no-toggle onClick={(e) => e.stopPropagation()} className="space-y-2">
                    <SubtaskSection
                        subtareas={tarea.subtareas || []}
                        subtaskInput={subtaskInput}
                        setSubtaskInput={setSubtaskInput}
                        onAdd={() => actions.handleAddSubtask(subtaskInput, setSubtaskInput)}
                        onToggle={actions.handleToggleSubtask}
                    />
                </div>
            )}
        </div>
    );
}