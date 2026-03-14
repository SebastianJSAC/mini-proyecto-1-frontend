import { Check } from "lucide-react";
import TaskCard from "../TaskCard.jsx";

export default function TaskList({tasks,setTasks,navigate,API_URL}){

    return(
        <div className="space-y-3 mt-6">
            {tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Check size={36} className="text-emerald-500" strokeWidth={3} />
                    </div>
                    <div className="text-center">
                        <p className="text-slate-800 font-semibold text-lg">¡Todo listo!</p>
                        <p className="text-slate-400 text-sm mt-1">No tienes tareas pendientes.</p>
                    </div>
                </div>
            )}

            {tasks
                .filter(t => !t.parent && !t.parent_id)
                .map(tarea =>(

                    <TaskCard
                        key={tarea.id}
                        tarea={tarea}
                        tasks={tasks}
                        setTasks={setTasks}
                        navigate={navigate}
                        API_URL={API_URL}
                    />

                ))}
        </div>
    );
}