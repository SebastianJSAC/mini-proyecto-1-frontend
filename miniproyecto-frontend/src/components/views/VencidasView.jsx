import TasksView from "./TasksView.jsx";
import { useOutletContext } from "react-router-dom";

export default function VencidasView() {

    const { tasks, setTasks, API_URL } = useOutletContext();

    const ahora = new Date();

    const tareasVencidas = tasks.filter(t =>
        t.fecha_entrega &&
        new Date(t.fecha_entrega) < ahora &&
        !t.completada
    );

    return (
        <TasksView
            tasks={tareasVencidas}
            setTasks={setTasks}
            API_URL={API_URL}
        />
    );
}