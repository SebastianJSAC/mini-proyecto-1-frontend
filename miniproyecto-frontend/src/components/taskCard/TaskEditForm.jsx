import { BookOpen, Sparkles, Trash2, Check, X, Brain } from "lucide-react";

// --- FORMULARIO DE EDICIÓN ---
export const TaskEditForm = ({ editData, setEditData, onSave, onCancel, getMentalLoadConfig }) => {
    const isInvalid = !editData.nombre.trim() || !editData.fecha_entrega || !editData.carga_mental;

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <input
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                    value={editData.nombre}
                    onChange={(e) => setEditData({...editData, nombre: e.target.value})}
                    placeholder="Nombre de la tarea"
                />
                <button onClick={onSave} disabled={isInvalid} className={`p-2 rounded-lg transition-colors ${isInvalid ? "bg-gray-300 text-gray-500" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>
                    <Check size={18}/>
                </button>
                <button onClick={onCancel} className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors">
                    <X size={18}/>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Curso / Materia:</label>
                    <div className="flex items-center gap-2 border rounded-lg px-2 py-1.5 bg-gray-50 focus-within:bg-white focus-within:border-emerald-500 transition-all">
                        <BookOpen size={14} className="text-gray-400"/>
                        <input className="text-sm outline-none w-full bg-transparent" value={editData.curso} onChange={(e) => setEditData({...editData, curso: e.target.value})} />
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Tipo de Actividad:</label>
                    <div className="flex items-center gap-2 border rounded-lg px-2 py-1.5 bg-gray-50">
                        <Sparkles size={14} className="text-gray-400"/>
                        <select className="text-sm outline-none w-full bg-transparent" value={editData.tipo_tarea} onChange={(e) => setEditData({...editData, tipo_tarea: e.target.value})}>
                            <option value="EX">Examen</option><option value="QU">Quiz</option><option value="TA">Taller</option><option value="PR">Proyecto</option><option value="OT">Otro</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="relative">
                <textarea
                    maxLength={100}
                    className="w-full px-3 py-2 border rounded-lg text-sm outline-none focus:border-emerald-500 min-h-[80px]"
                    value={editData.descripcion}
                    onChange={(e) => setEditData({...editData, descripcion: e.target.value})}
                />
                <div className="absolute bottom-2 right-2 text-[10px] font-mono text-gray-400">{100 - editData.descripcion.length}</div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-col flex-1">
                    <label className="text-[10px] text-gray-500 font-bold uppercase">Fecha de entrega:</label>
                    <input type="datetime-local" value={editData.fecha_entrega} onChange={(e) => setEditData({...editData, fecha_entrega: e.target.value})} className="border p-2 rounded-lg text-xs mt-1 outline-none" />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-gray-500 flex items-center gap-1"><Brain size={14}/> CARGA MENTAL:</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(n => (
                            <button key={n} type="button" onClick={() => setEditData({...editData, carga_mental: n})}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${Number(editData.carga_mental) === n ? getMentalLoadConfig(n).color + " ring-2 ring-emerald-500" : "bg-white text-gray-400"}`}>
                                {n}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-dashed">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Editar Subtareas:</label>
                {editData.subtareas.map((sub, index) => (
                    <div key={sub.id || index} className="flex gap-2">
                        <input className="flex-1 px-3 py-1.5 border rounded-lg text-sm bg-gray-50" value={sub.nombre}
                               onChange={(e) => {
                                   const newSubs = [...editData.subtareas];
                                   newSubs[index].nombre = e.target.value;
                                   setEditData({...editData, subtareas: newSubs});
                               }}
                        />
                        <button onClick={() => setEditData({...editData, subtareas: editData.subtareas.filter((_, i) => i !== index)})} className="text-red-400"><Trash2 size={14}/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};