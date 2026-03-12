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