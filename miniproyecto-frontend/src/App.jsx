import {TodayView} from "./components/TodayView.jsx";
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import Login from "./components/Login.jsx";
import Registro from "./components/Registro.jsx";
import Layout from "./components/layout/Layout.jsx"; // Importamos el layout

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
                <Route path="/hoy" element={<PrivateRoute><Layout /></PrivateRoute>}>
                    <Route index element={<TodayView />} />
                    <Route path="crear" element={<TodayView />} />
                    <Route path="editar/:id" element={<TodayView />} />
                    <Route path="eliminar/:id" element={<TodayView />} />
                    <Route path="restaurar/:id" element={<TodayView />} />
                    <Route path="subtarea/:id" element={<TodayView />} />
                </Route>

                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}