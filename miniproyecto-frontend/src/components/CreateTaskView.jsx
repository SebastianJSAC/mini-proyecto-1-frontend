import QuickTaskForm from "./today/QuickTaskForm.jsx";
import { useNavigate } from "react-router-dom";


export default function CreateTaskView() {

    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

    return (
        <main className="flex-1 overflow-auto">
            <div className="max-w-3xl mx-auto px-8 py-8">

                <h1 className="text-2xl font-semibold mb-6">
                    Crear nueva tarea
                </h1>

                <QuickTaskForm
                    API_URL={API_URL}
                    obtenerTareas={() => {}}
                    navigate={navigate}
                />

            </div>
        </main>
    );
}