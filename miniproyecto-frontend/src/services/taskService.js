export const obtenerTareas = async (API_URL) => {

    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${API_URL}/tareas/api/tareas/`, {
            headers:{
                "Content-Type":"application/json",
                "Authorization":`Bearer ${token}`
            }
        });

        console.log(response);

        if(!response.ok){
            throw new Error("Error obteniendo tareas");
        }

        return await response.json();

    } catch (error) {
        console.error("Error cargando tareas:", error);
        return [];
    }
};