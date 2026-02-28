const crearTarea = async () => {
  const response = await fetch(
    ${import.meta.env.VITE_API_URL}/api/tareas/,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nombre: "Estudiar Django"
      })
    }
  );

  const data = await response.json();
  console.log(data);
};

<button onClick={crearTarea}>Crear Tarea</button>