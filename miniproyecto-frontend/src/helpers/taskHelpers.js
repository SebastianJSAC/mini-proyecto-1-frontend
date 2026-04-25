/** Colores alineados: borde coherente con el relleno del nivel (círculos y chips). */
export const getMentalLoadConfig = (level) => {
    const n = Number(level);
    const configs = {
        1: {
            label: "Muy baja",
            chip: "bg-green-100 text-green-800 border-green-600",
            circle: "bg-green-500 text-white border-green-600",
            idle: "bg-white text-green-700 border-green-300 hover:border-green-500",
            ring: "ring-2 ring-green-500/50 ring-offset-2 ring-offset-white",
        },
        2: {
            label: "Baja",
            chip: "bg-emerald-100 text-emerald-900 border-emerald-600",
            circle: "bg-emerald-500 text-white border-emerald-600",
            idle: "bg-white text-emerald-800 border-emerald-300 hover:border-emerald-500",
            ring: "ring-2 ring-emerald-500/50 ring-offset-2 ring-offset-white",
        },
        3: {
            label: "Media",
            chip: "bg-yellow-100 text-yellow-900 border-yellow-500",
            circle: "bg-yellow-400 text-yellow-950 border-yellow-600",
            idle: "bg-white text-yellow-800 border-yellow-300 hover:border-yellow-500",
            ring: "ring-2 ring-yellow-500/50 ring-offset-2 ring-offset-white",
        },
        4: {
            label: "Alta",
            chip: "bg-orange-100 text-orange-900 border-orange-600",
            circle: "bg-orange-500 text-white border-orange-600",
            idle: "bg-white text-orange-800 border-orange-300 hover:border-orange-500",
            ring: "ring-2 ring-orange-500/50 ring-offset-2 ring-offset-white",
        },
        5: {
            label: "Muy alta",
            chip: "bg-red-100 text-red-900 border-red-600",
            circle: "bg-red-500 text-white border-red-600",
            idle: "bg-white text-red-800 border-red-300 hover:border-red-500",
            ring: "ring-2 ring-red-500/50 ring-offset-2 ring-offset-white",
        },
    };
    const fallback = {
        label: "N/A",
        chip: "bg-gray-100 text-gray-600 border-gray-400",
        circle: "bg-gray-400 text-white border-gray-500",
        idle: "bg-white text-gray-500 border-gray-200 hover:border-gray-400",
        ring: "ring-2 ring-gray-400/50 ring-offset-2 ring-offset-white",
    };
    return configs[n] || fallback;
};

/** Horas introducidas en UI → minutos para la API (entre 15 y 360). */
export function duracionMinutosDesdeHoras(horas) {
    const h = Number(horas);
    if (!Number.isFinite(h) || h <= 0) return 60;
    return Math.min(360, Math.max(15, Math.round(h * 60)));
}

/** Minutos de la API → texto corto en horas para chips / vista. */
export function formatDuracionEstimadaHoras(minutos) {
    if (minutos == null) return "";
    const h = minutos / 60;
    const rounded = Math.round(h * 100) / 100;
    const str = Number.isInteger(rounded)
        ? String(rounded)
        : String(rounded).replace(/\.?0+$/, "");
    return `${str} h`;
}

export const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "Sin fecha";
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString() + " " + fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const getTiempoRestante = (fechaEntrega) => {
    if (!fechaEntrega) return null;
    const entrega = new Date(fechaEntrega);
    const ahora = new Date();
    const difMs = entrega - ahora;

    // Caso: Tarea vencida
    if (difMs < 0) {
        return {
            texto: "Vencida",
            color: "bg-red-50 text-red-600 border-red-200"
        };
    }

    const dias = Math.floor(difMs / (1000 * 60 * 60 * 24));
    const horas = Math.floor((difMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    // Caso: Faltan días (Verde)
    if (dias > 0) {
        return {
            texto: `Faltan ${dias}d ${horas}h`,
            color: "bg-emerald-50 text-emerald-600 border-emerald-200"
        };
    }

    // Caso: Faltan pocas horas - menos de 3h (Rojo / Muy poco tiempo)
    if (horas < 3) {
        return {
            texto: `¡Cierra en ${horas}h!`,
            color: "bg-red-100 text-red-700 border-red-300 animate-pulse"
        };
    }

    // Caso: Faltan horas - más de 3h (Amarillo)
    return {
        texto: `Faltan ${horas} horas`,
        color: "bg-amber-50 text-amber-600 border-amber-200"
    };
};

export function mostrarToast(mensaje, tipo = "success") {

    const colores = {
        success: "bg-emerald-500",
        error: "bg-red-500",
        warning: "bg-amber-500",
        info: "bg-sky-600",
    };

    const toast = document.createElement("div");

    toast.className = `
            fixed top-6 right-6 z-50 flex items-center gap-3
            px-5 py-3.5 rounded-xl text-white text-sm font-medium
            shadow-xl transition-all duration-300
            opacity-0 translate-y-2 ${colores[tipo] || colores.success}
        `;

    // icono
    const icon = document.createElement("span");
    icon.innerHTML = "✓";
    icon.className = "text-lg font-bold";

    const text = document.createElement("span");
    text.textContent = mensaje;

    toast.appendChild(icon);
    toast.appendChild(text);

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.remove("opacity-0", "translate-y-2");
    });

    setTimeout(() => {
        toast.classList.add("opacity-0", "translate-y-2");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}