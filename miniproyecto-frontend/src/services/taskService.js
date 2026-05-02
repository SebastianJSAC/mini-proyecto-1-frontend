import { normalizeApiBaseUrl } from "../helpers/apiBase.js";

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

const root = (u) => `${normalizeApiBaseUrl(u)}/tareas/api`;

export const obtenerTareas = (API_URL) => request(`${root(API_URL)}/tareas/`);

export const actualizarTarea = (API_URL, id, data) =>
    request(`${root(API_URL)}/tareas/${id}/`, "PATCH", data);

export const eliminarTarea = (API_URL, id) => request(`${root(API_URL)}/tareas/${id}/`, "DELETE");

export const crearTarea = (API_URL, data) => request(`${root(API_URL)}/tareas/`, "POST", data);

// Posponer una tarea (raíz o subtarea) con una nota opcional
export const posponerTarea = (API_URL, id, nota) =>
    request(`${root(API_URL)}/tareas/${id}/posponer/`, "POST", { nota: nota || "" });

// Quitar el estado pospuesta de la tarea
export const reanudarTarea = (API_URL, id) =>
    request(`${root(API_URL)}/tareas/${id}/reanudar/`, "POST", {});

/** Sprint 3 — carga diaria */
export const obtenerCargaConfig = (API_URL) => request(`${root(API_URL)}/usuario/carga-config/`);

export const actualizarCargaConfig = (API_URL, data) =>
    request(`${root(API_URL)}/usuario/carga-config/`, "PATCH", data);

export const obtenerResumenDia = (API_URL, fechaYMD) =>
    request(`${root(API_URL)}/dias/${fechaYMD}/resumen/`);

export const validarCargaDia = (API_URL, fechaYMD, cambios) =>
    request(`${root(API_URL)}/dias/${fechaYMD}/validar-carga/`, "POST", { cambios });

export const obtenerRecomendacionesDia = (API_URL, fechaYMD, body = {}) =>
    request(`${root(API_URL)}/dias/${fechaYMD}/recomendaciones/`, "POST", body);

// Análisis integral del día (nivel de carga + recomendaciones agrupadas).
export const obtenerAnalisisDia = (API_URL, fechaYMD, ventanaDias = 14) =>
    request(`${root(API_URL)}/dias/${fechaYMD}/analisis/?ventana_dias=${ventanaDias}`);

export const reprogramarTareasDia = (API_URL, fechaYMD, movimientos) =>
    request(`${root(API_URL)}/dias/${fechaYMD}/reprogramar/`, "POST", { movimientos });