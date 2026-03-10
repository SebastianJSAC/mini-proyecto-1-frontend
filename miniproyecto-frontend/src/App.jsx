import {TodayView} from "./components/views/TodayView.jsx";
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import Login from "./components/Login.jsx";
import Registro from "./components/Registro.jsx";
import Layout from "./components/layout/Layout.jsx";
import TasksView from "./components/views/TasksView.jsx";
import CreateTaskView from "./components/CreateTaskView.jsx";

export default function App() {

    const PrivateRoute = ({ children }) => {
        return localStorage.getItem("token") ? children : <Navigate to="/login" />;
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />

                {/* Rutas con Layout */}

                <Route path="/hoy" element={<PrivateRoute><Layout/></PrivateRoute>}>

                    <Route index element={<TasksView/>}/>

                    <Route path="crear" element={<CreateTaskView/>}/>

                    <Route path="editar/:id" element={<TasksView/>}/>
                    <Route path="eliminar/:id" element={<TasksView/>}/>
                    <Route path="restaurar/:id" element={<TasksView/>}/>
                    <Route path="subtarea/:id" element={<TasksView/>}/>

                </Route>


                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}