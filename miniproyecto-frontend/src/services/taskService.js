export const getToken = () => localStorage.getItem("token");

const request = async (url, method = "GET", body = null) => {

    const config = {
        method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        }
    };

    if (body) config.body = JSON.stringify(body);

    const res = await fetch(url, config);

    // Manejo de errores HTTP
    if (!res.ok) {

        // token expirado o no autorizado
        if (res.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
            return;
        }

        // error del servidor
        if (res.status >= 500) {
            window.location.href = "/500";
            return;
        }

        // intentar leer mensaje del backend
        let message = "Error en API";

        try {
            const data = await res.json();
            message = data.message || message;
        } catch {}

        throw new Error(message);
    }

    if (res.status === 204) return null;

    return res.json();
};

export const obtenerTareas = (API_URL) =>
    request(`${API_URL}/tareas/api/tareas/`);

export const actualizarTarea = (API_URL, id, data) =>
    request(`${API_URL}/tareas/api/tareas/${id}/`, "PATCH", data);

export const eliminarTarea = (API_URL, id) =>
    request(`${API_URL}/tareas/api/tareas/${id}/`, "DELETE");

export const crearTarea = (API_URL, data) =>
    request(`${API_URL}/tareas/api/tareas/`, "POST", data);