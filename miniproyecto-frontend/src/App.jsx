import {TodayView} from "./components/TodayView.jsx";
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/hoy' element={<TodayView/>} index/>
                <Route path="/hoy/crear" element={<TodayView />} />
                <Route path="/hoy/editar/:id" element={<TodayView />} />
                <Route path="/hoy/eliminar/:id" element={<TodayView />} />
                <Route path="/hoy/restaurar/:id" element={<TodayView />} />
                <Route path="/hoy/subtarea/:id" element={<TodayView />} />
                <Route path="*" element={<Navigate to="/hoy" />} />
            </Routes>
        </BrowserRouter>
    );
}
