import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import Login from "./components/Login.jsx";
import Registro from "./components/Registro.jsx";
import Layout from "./components/layout/Layout.jsx";
import CompletadasView from "./components/views/CompletadasView.jsx";
import HoyView from "./components/views/HoyView.jsx";
import VencidasView from "./components/views/VencidasView.jsx";
import UrgentesView from "./components/views/UrgentesView.jsx";
import TodasView from "./components/views/TodasView.jsx";

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
                <Route path="/" element={<PrivateRoute><Layout/></PrivateRoute>}>
                    <Route index element={<HoyView />} />
                    <Route path="todas" element={<TodasView />} />
                    <Route path="hoy" element={<HoyView />} />
                    <Route path="completadas" element={<CompletadasView />} />
                    <Route path="vencidas" element={<VencidasView />} />
                    <Route path="urgentes" element={<UrgentesView />} />
                </Route>


                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}