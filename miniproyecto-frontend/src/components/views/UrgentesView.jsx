import TasksView from "./TasksView.jsx";
import { useOutletContext } from "react-router-dom";

export default function UrgentesView() {

    const { tasks, setTasks, API_URL } = useOutletContext();

    const tareasUrgentes = tasks.filter(t =>
        t.carga_mental >= 3 && !t.completada
    );

    return (
        <TasksView
            tasks={tareasUrgentes}
            setTasks={setTasks}
            API_URL={API_URL}
        />
    );
}