/**
 * El cliente arma rutas como `${base}/tareas/api/...`. Si VITE_API_URL termina en
 * `/tareas`, hay que quitarlo para no obtener `/tareas/tareas/api/...`.
 */
export function normalizeApiBaseUrl(base) {
    if (base == null || base === "") return "";
    let s = String(base).trim().replace(/\/+$/, "");
    return s.replace(/\/tareas$/i, "");
}

export function getApiBaseUrl() {
    return normalizeApiBaseUrl(import.meta.env.VITE_API_URL);
}
