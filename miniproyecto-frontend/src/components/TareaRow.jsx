import { useState, Fragment } from "react";
import Swal from 'sweetalert2';

export const TareaRow = ({ tarea, nivel = 0, onEliminar, onActualizar, API_URL }) => {
    const [mostrarInput, setMostrarInput] = useState(false);
    const [nuevoNombreSub, setNuevoNombreSub] = useState("");

    const toggleCompletada = async () => {
        try {
            const response = await fetch(`${API_URL}/tareas/api/tareas/${tarea.id}/`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completada: !tarea.completada }),
            });
            if (response.ok) onActualizar();
        } catch (error) {
            console.error("Error al actualizar:", error);
        }
    };

    const anadirSubtarea = async (e) => {
        e.preventDefault();

        // VALIDACIÓN SUBTAREA
        if (!nuevoNombreSub.trim()) {
            return Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'La subtarea no puede estar vacía.',
                confirmButtonColor: '#3b82f6'
            });
        }

        try {
            const response = await fetch(`${API_URL}/tareas/api/tareas/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre: nuevoNombreSub, parent: tarea.id }),
            });
            const res = await response.json();
            if (response.ok) {
                setNuevoNombreSub("");
                setMostrarInput(false);
                onActualizar();
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Subtarea añadida',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        } catch (error) {
            console.error("Error al crear subtarea:", error);
        }
    };

    return (
        <Fragment>
            <tr className={`hover:bg-slate-50 transition-colors ${nivel > 0 ? 'bg-slate-50/50' : ''}`}>
                <td className="p-4 text-slate-500 font-mono text-xs" style={{ paddingLeft: `${nivel * 20 + 16}px` }}>
                    {nivel > 0 && <span className="text-blue-400 mr-2">↳</span>}
                    #{tarea.id}
                </td>
                <td className={`p-4 ${tarea.completada ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                    {tarea.nombre}
                </td>
                <td className="p-4 flex justify-center gap-2">
                    {/* Toggle de Válida/No válida */}
                    <button
                        onClick={toggleCompletada}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${tarea.completada ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}
                    >
                        {tarea.completada ? "Completada" : "○ Pendiente"}
                    </button>

                    {/* Botón para desplegar input de subtarea */}
                    <button
                        onClick={() => setMostrarInput(!mostrarInput)}
                        className="text-blue-500 hover:bg-blue-50 px-2 py-1 rounded text-lg font-bold"
                    >
                        +
                    </button>

                    <button
                        onClick={() => onEliminar(tarea.id)}
                        className="text-red-500 hover:bg-red-50 px-2 py-1 rounded text-xs"
                    >
                        Eliminar
                    </button>
                </td>
            </tr>

            {/* Input desplegable para nueva subtarea */}
            {mostrarInput && (
                <tr>
                    <td colSpan="3" className="p-2 bg-blue-50/30" style={{ paddingLeft: `${(nivel + 1) * 20 + 16}px` }}>
                        <form onSubmit={anadirSubtarea} className="flex gap-2">
                            <input
                                autoFocus
                                value={nuevoNombreSub}
                                onChange={(e) => setNuevoNombreSub(e.target.value)}
                                placeholder="Nueva subtarea..."
                                className="text-sm border rounded px-2 py-1 flex-1"
                            />
                            <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded text-xs">Añadir</button>
                        </form>
                    </td>
                </tr>
            )}

            {/* RECURSIVIDAD: Si la tarea tiene subtareas, se renderizan ellas mismas */}
            {tarea.subtareas && tarea.subtareas.map(sub => (
                <TareaRow
                    key={sub.id}
                    tarea={sub}
                    nivel={nivel + 1}
                    onEliminar={onEliminar}
                    onActualizar={onActualizar}
                    API_URL={API_URL}
                />
            ))}
        </Fragment>
    );
};