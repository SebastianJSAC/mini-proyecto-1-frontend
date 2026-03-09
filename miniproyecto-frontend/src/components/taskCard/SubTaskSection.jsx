// --- SECCIÓN DE SUBTAREAS ---
export const SubtaskSection = ({ subtareas, subtaskInput, setSubtaskInput, onAdd, onToggle }) => (
    <div className="space-y-2 ml-6 pt-3 border-t border-gray-50">
        {subtareas.length > 0 ? subtareas.map(sub => (
            <div key={sub.id} className="flex items-center gap-2 text-sm bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg">
                <button onClick={() => onToggle(sub)} className={`px-2 py-0.5 rounded text-[10px] font-black ${sub.completada ? "bg-green-200 text-green-800" : "bg-white text-slate-400 border"}`}>
                    {sub.completada ? "✓" : "○"}
                </button>
                <span className={`${sub.completada ? "line-through text-gray-400" : "text-gray-700"}`}>{sub.nombre}</span>
            </div>
        )) : <p className="text-xs text-gray-400 italic">No hay subtareas pendientes.</p>}

        <div className="flex gap-2 mt-4">
            <input value={subtaskInput} onChange={(e) => setSubtaskInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onAdd()} placeholder="Añadir subtarea..." className="flex-1 px-3 py-1.5 border rounded-lg text-sm outline-none focus:border-emerald-500" />
            <button onClick={onAdd} disabled={!subtaskInput.trim()} className={`px-4 py-1.5 rounded-lg text-sm font-bold ${!subtaskInput.trim() ? "bg-gray-200" : "bg-emerald-600 text-white"}`}>+</button>
        </div>
    </div>
);