export const getMentalLoadConfig = (level) => {
    const configs = {
        1: { color: "bg-green-100 text-green-700 border-green-200", label: "Muy Baja" },
        2: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", label: "Baja" },
        3: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "Media" },
        4: { color: "bg-orange-100 text-orange-700 border-orange-200", label: "Alta" },
        5: { color: "bg-red-100 text-red-700 border-red-200", label: "Muy Alta" },
    };
    return configs[level] || { color: "bg-gray-100 text-gray-500 border-gray-200", label: "N/A" };
};

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
        warning: "bg-amber-500"
    };

    const toast = document.createElement("div");

    toast.className = `
            fixed top-6 right-6 z-50 flex items-center gap-3
            px-5 py-3.5 rounded-xl text-white text-sm font-medium
            shadow-xl transition-all duration-300
            opacity-0 translate-y-2 ${colores[tipo]}
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