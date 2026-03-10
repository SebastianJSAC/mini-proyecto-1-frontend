import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import PriorityTask from "../today/PriorityTask.jsx";
import TaskList from "../today/TaskList.jsx";
import PomodoroTimer from "../today/PomodoroTimer.jsx";
import {obtenerTareas} from "../../services/taskService.js";

export default function TasksView() {

    const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);

    useEffect(()=>{
        const cargar = async () => {
            const data = await obtenerTareas(API_URL);

            if(Array.isArray(data)){
                setTasks(data);
            }
        };

        cargar();
    },[]);

    const tareasPendientes = tasks.filter(
        t => (t.parent === null || t.parent_id === null) && !t.completada
    );

    const totalMisiones = tareasPendientes.length;

    const tareasPendientesOrdenadas = [...tareasPendientes].sort((a,b)=>{
        if(!a.fecha_entrega) return 1;
        if(!b.fecha_entrega) return -1;
        return new Date(a.fecha_entrega) - new Date(b.fecha_entrega);
    });

    const tareaMasCercana = tareasPendientesOrdenadas[0];

    const hoy = new Date().toLocaleDateString("es-ES",{
        weekday:"long",
        year:"numeric",
        month:"long",
        day:"numeric"
    });

    return (
        <main className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-light text-gray-900 mb-2">
                        Mis tareas ({totalMisiones})
                    </h1>

                    <p className="text-gray-500">{hoy}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {tareaMasCercana && (
                            <PriorityTask tarea={tareaMasCercana}/>
                        )}

                        <TaskList
                            tasks={tasks}
                            setTasks={setTasks}
                            navigate={navigate}
                            API_URL={API_URL}
                        />
                    </div>

                    <PomodoroTimer/>
                </div>
            </div>
        </main>
    );
}