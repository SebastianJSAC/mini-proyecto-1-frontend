/** Utilidades Sprint 3 — carga diaria (alineado con backend). */

/** Inicio del día local (00:00:00.000). */
export function startOfLocalDay(d = new Date()) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

/** Mismo día calendario en zona local. */
export function isSameLocalDay(a, b) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

export function toYMDLocal(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

/** Fecha de plan efectiva como YYYY-MM-DD (misma lógica que `fecha_efectiva_plan` en Django). */
export function fechaPlanTarea(t) {
    if (t.fecha_planificada) return t.fecha_planificada;
    if (t.fecha_entrega) return t.fecha_entrega.slice(0, 10);
    return null;
}

export function formatMinutos(m) {
    const n = Math.abs(Math.round(m));
    const sign = m < 0 ? "-" : "";
    const h = Math.floor(n / 60);
    const min = n % 60;
    if (h === 0) return `${sign}${min} min`;
    if (min === 0) return `${sign}${h} h`;
    return `${sign}${h} h ${min} min`;
}
