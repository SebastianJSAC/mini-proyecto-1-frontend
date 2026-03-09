import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

export default function Login() {
    const [form, setForm] = useState({ username: "", password: "" });
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch(`${API_URL}/tareas/api/login/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem("token", data.access);
            navigate("/hoy");
        } else {
            Swal.fire("Error", "Credenciales incorrectas", "error");
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <form onSubmit={handleSubmit} className="p-10 bg-white rounded-2xl shadow-xl w-96">
                <h2 className="text-2xl font-bold mb-6">FocusFlow Login</h2>
                <input className="w-full mb-4 p-3 border rounded-lg" type="text" placeholder="Usuario"
                       onChange={e => setForm({...form, username: e.target.value})} />
                <input className="w-full mb-6 p-3 border rounded-lg" type="password" placeholder="Contraseña"
                       onChange={e => setForm({...form, password: e.target.value})} />
                <button className="w-full bg-emerald-600 text-white p-3 rounded-lg hover:bg-emerald-700">Entrar</button>
                <Link to="/registro" className="block mt-4 text-center text-sm text-emerald-600">¿No tienes cuenta? Regístrate</Link>
            </form>
        </div>
    );
}