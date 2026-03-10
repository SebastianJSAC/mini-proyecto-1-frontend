import TasksView from "./TasksView.jsx";
import { useOutletContext } from "react-router-dom";

export default function TodasView() {

    const { tasks, setTasks, API_URL } = useOutletContext();

    return (
        <TasksView
            tasks={tasks}
            setTasks={setTasks}
            API_URL={API_URL}
        />
    );
}