import {TodayView} from "./components/TodayView.jsx";
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import Login from "./components/Login.jsx";
import Registro from "./components/Registro.jsx";

export default function App() {

    const PrivateRoute = ({ children }) => {
        return localStorage.getItem("token") ? children : <Navigate to="/login" />;
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="*" element={<Navigate to="/login" />} index/>
                <Route path='/hoy' element={<PrivateRoute><TodayView /></PrivateRoute>} />
                <Route path="/hoy/crear" element={<PrivateRoute><TodayView /></PrivateRoute>} />
                <Route path="/hoy/editar/:id" element={<PrivateRoute><TodayView /></PrivateRoute>} />
                <Route path="/hoy/eliminar/:id" element={<PrivateRoute><TodayView /></PrivateRoute>} />
                <Route path="/hoy/restaurar/:id" element={<PrivateRoute><TodayView /></PrivateRoute>} />
                <Route path="/hoy/subtarea/:id" element={<PrivateRoute><TodayView /></PrivateRoute>} />
                <Route path="*" element={<Navigate to="/hoy" />} />
            </Routes>
        </BrowserRouter>
    );
}
