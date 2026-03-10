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

    if (!res.ok) throw new Error("Error en API");

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