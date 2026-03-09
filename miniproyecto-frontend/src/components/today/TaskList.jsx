import TaskCard from "../TaskCard.jsx";

export default function TaskList({tasks,setTasks,navigate,API_URL}){

    return(
        <div className="space-y-3 mt-6">
            {tasks.length === 0 && (
                <p className="text-gray-400 text-sm">
                    No hay tareas todavía.
                </p>
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