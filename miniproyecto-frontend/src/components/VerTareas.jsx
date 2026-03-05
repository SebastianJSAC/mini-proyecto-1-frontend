import React, { useEffect, useState, useCallback } from "react";
import { TareaRow } from "./TareaRow.jsx";
import Swal from 'sweetalert2'; // Importamos SweetAlert

export default function VerTareas() {
    const [tareas, setTareas] = useState([]);
    const [nombre, setNombre] = useState("");
    const [cargando, setCargando] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

    const obtenerTareas = useCallback(async () => {
        setCargando(true);
        try {
            const response = await fetch(`${API_URL}/tareas/api/tareas/`);
            const data = await response.json();
            setTareas(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setCargando(false);
        }
    }, [API_URL]);

    useEffect(() => { obtenerTareas(); }, [obtenerTareas]);

    const crearTarea = async (e) => {
        e.preventDefault();

        // VALIDACIÓN: Si está vacío muestra alerta bonita
        if (!nombre.trim()) {
            return Swal.fire({
                icon: 'warning',
                title: 'Campo vacío',
                text: 'Por favor, escribe un nombre para la tarea.',
                confirmButtonColor: '#3b82f6'
            });
        }

        try {
            const response = await fetch(`${API_URL}/tareas/api/tareas/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre }),
            });
            const res = await response.json();

            if (response.ok) {
                setTareas((prev) => [...prev, res.data]);
                setNombre("");
                // Mensaje de éxito desde el backend
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: res.mensaje || 'Tarea creada',
                    showConfirmButton: false,
                    timer: 2000
                });
            }
        } catch (error) {
            console.error("Error al crear:", error);
        }
    };

    const eliminarTarea = async (id) => {
        // CONFIRMACIÓN MEJORADA
        const resultado = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción eliminará la tarea y todas sus subtareas.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (resultado.isConfirmed) {
            try {
                const response = await fetch(`${API_URL}/tareas/api/tareas/${id}/`, {
                    method: "DELETE",
                });
                const res = await response.json();
                if (response.ok) {
                    setTareas((prev) => prev.filter((t) => t.id !== id));
                    await obtenerTareas();
                    Swal.fire('Eliminado', res.mensaje, 'success');
                }
            } catch (error) {
                console.error("Error al eliminar:", error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex justify-center items-start p-10 font-sans">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">FocusFlow: Gestión de Tareas</h2>

                {/* Formulario */}
                <form onSubmit={crearTarea} className="flex gap-3 mb-8">
                    <input
                        type="text"
                        placeholder="¿Qué hay que hacer hoy?"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors active:scale-95"
                    >
                        Agregar
                    </button>
                </form>

                {/* Tabla */}
                <div className="overflow-hidden border border-slate-100 rounded-lg">
                    <table className="w-full text-left border-collapse">
                        <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nombre de la Tarea</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Acciones</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {cargando ? (
                            <tr><td colSpan="3" className="p-8 text-center text-slate-400">Cargando tareas...</td></tr>
                        ) : tareas.length > 0 ? (
                            // Filtramos para mostrar solo tareas PADRE en el primer nivel
                            tareas.filter(t => t.parent === null).map((tarea) => (
                                <TareaRow
                                    key={tarea.id}
                                    tarea={tarea}
                                    onEliminar={eliminarTarea}
                                    onActualizar={obtenerTareas}
                                    API_URL={API_URL}
                                />
                            ))
                        ) : (
                            <tr><td colSpan="3" className="p-8 text-center text-slate-400 italic">No hay tareas pendientes.</td></tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}