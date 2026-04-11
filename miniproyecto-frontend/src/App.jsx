import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login.jsx";
import Registro from "./components/Registro.jsx";
import Layout from "./components/layout/Layout.jsx";
import HoyView from "./components/views/HoyView.jsx";
import ActividadesView from "./components/views/ActividadesView.jsx";
import ProgresoView from "./components/views/ProgresoView.jsx";
import ErrorPage from "./components/errors/ErrorPage.jsx";
import ErrorBoundary from "./components/errors/ErrorBoundary.jsx";
import Error500Page from "./components/errors/Error500Page.jsx";

function PrivateRoute({ children }) {
    return localStorage.getItem("token") ? children : <Navigate to="/login" replace />;
}

export default function App() {
    return (
        <BrowserRouter>
            <ErrorBoundary>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/registro" element={<Registro />} />
                    <Route path="/500" element={<Error500Page />} />

                    <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                        <Route index element={<Navigate to="/hoy" replace />} />
                        <Route path="hoy" element={<HoyView />} />
                        <Route path="actividades" element={<ActividadesView />} />
                        <Route path="progreso" element={<ProgresoView />} />
                        <Route path="formulario" element={<Navigate to="/hoy" replace />} />
                    </Route>

                    <Route path="*" element={<ErrorPage />} />
                </Routes>
            </ErrorBoundary>
        </BrowserRouter>
    );
}
