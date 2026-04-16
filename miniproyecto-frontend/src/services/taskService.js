export const getToken = () => localStorage.getItem("token");

export const clearStoredSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("nombreMostrar");
};

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
            clearStoredSession();
            window.location.href = "/login";
            return;
        }

        // error del servidor
        if (res.status >= 500) {
            window.location.href = "/500";
            return;
        }

        // intentar leer mensaje del backend (validaciones DRF, etc.)
        let message = "Error en API";

        try {
            const data = await res.json();
            message = data.mensaje || data.detail || data.message || message;
            if (message === "Error en API" && data.errores) {
                const firstKey = Object.keys(data.errores)[0];
                const val = firstKey ? data.errores[firstKey] : null;
                if (Array.isArray(val) && val.length) message = String(val[0]);
                else if (typeof val === "string") message = val;
            }
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

/** Sprint 3 — carga diaria */
export const obtenerCargaConfig = (API_URL) =>
    request(`${API_URL}/tareas/api/usuario/carga-config/`);

export const actualizarCargaConfig = (API_URL, data) =>
    request(`${API_URL}/tareas/api/usuario/carga-config/`, "PATCH", data);

export const obtenerResumenDia = (API_URL, fechaYMD) =>
    request(`${API_URL}/tareas/api/dias/${fechaYMD}/resumen/`);

export const validarCargaDia = (API_URL, fechaYMD, cambios) =>
    request(`${API_URL}/tareas/api/dias/${fechaYMD}/validar-carga/`, "POST", { cambios });

export const obtenerRecomendacionesDia = (API_URL, fechaYMD, body = {}) =>
    request(`${API_URL}/tareas/api/dias/${fechaYMD}/recomendaciones/`, "POST", body);

export const reprogramarTareasDia = (API_URL, fechaYMD, movimientos) =>
    request(`${API_URL}/tareas/api/dias/${fechaYMD}/reprogramar/`, "POST", { movimientos });