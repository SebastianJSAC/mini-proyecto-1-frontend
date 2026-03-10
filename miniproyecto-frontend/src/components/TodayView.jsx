import {useState, useEffect} from "react";
import {useSearchParams, useNavigate} from "react-router-dom";
import QuickTaskForm from "./today/QuickTaskForm.jsx";
import PriorityTask from "./today/PriorityTask.jsx";
import PomodoroTimer from "./today/PomodoroTimer.jsx";
import {obtenerTareas} from "../services/taskService.js";

export function TodayView() {

    const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [tasks, setTasks] = useState([]);

    const obtenerUsers = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            console.error("No hay token de autenticación");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/tareas/api/users/`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            console.log("Usuarios obtenidos:", data);
            // Aquí ya puedes usar los datos, por ejemplo:
            // setUsers(data);  ← si usas React con useState
            return data;

        } catch (err) {
            console.error("Error cargando usuarios:", err);
            // Opcional: mostrar alerta al usuario
        }
    }

    useEffect(() => {
        const cargar = async () => {
            const data = await obtenerTareas(API_URL);

            if (Array.isArray(data)) {
                setTasks(data);
            }
        };

        cargar();
    }, []);

    const tareasPendientes = tasks.filter(
        t => (t.parent === null || t.parent_id === null) && !t.completada
    );

    const totalMisiones = tareasPendientes.length;

    const tareasPendientesOrdenadas = tareasPendientes.sort((a, b) => {
        if (!a.fecha_entrega) return 1;
        if (!b.fecha_entrega) return -1;
        return new Date(a.fecha_entrega) - new Date(b.fecha_entrega);
    });

    const tareaMasCercana = tareasPendientesOrdenadas[0];

    const hoy = new Date().toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    const userName = "María";

    return (
        <main className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto px-8 py-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-light text-gray-900 mb-2">
                        Hola, {userName}.{" "}
                        <span className="font-medium">
                            Tienes {totalMisiones} {totalMisiones === 1 ? "tarea" : "tareas"} actualmente.
                        </span>
                    </h1>

                    <p className="text-base text-gray-500">{hoy}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main area */}
                    <div className="lg:col-span-2 space-y-6">

                        <QuickTaskForm
                            API_URL={API_URL}
                            obtenerTareas={async () => {
                                const data = await obtenerTareas(API_URL);
                                setTasks(data);
                            }}
                            navigate={navigate}
                        />

                        {tareaMasCercana && (
                            <PriorityTask tarea={tareaMasCercana}/>
                        )}

                    </div>

                    {/* Timer */}
                    <PomodoroTimer/>
                </div>
            </div>
        </main>
    );
}