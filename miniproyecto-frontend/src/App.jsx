import {TodayView} from "./components/TodayView.jsx";
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/hoy' element={<TodayView/>} index/>
            </Routes>
        </BrowserRouter>
    );
}
