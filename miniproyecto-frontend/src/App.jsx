import { useEffect, useState } from "react";

export default function App() {
  const [tareas, setTareas] = useState([]);
  const [nombre, setNombre] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

  // Obtener tareas al cargar
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    obtenerTareas().then();
  }, []);

  const obtenerTareas = async () => {
    try {
      const response = await fetch(`${API_URL}/api/tareas/`);
      const data = await response.json();
      setTareas(data);
    } catch (error) {
      console.error("Error al obtener tareas:", error);
    }
  };

  // Crear nueva tarea
  const crearTarea = async (e) => {
    e.preventDefault();

    if (!nombre.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/tareas/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre }),
      });

      const data = await response.json();

      // Agregar nueva tarea al estado
      setTareas([...tareas, data]);
      setNombre("");
    } catch (error) {
      console.error("Error al crear tarea:", error);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h2>Lista de Tareas</h2>

      {/* Formulario */}
      <form onSubmit={crearTarea} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Escribe una tarea..."
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={{
            padding: "8px",
            marginRight: "10px",
            width: "250px",
          }}
        />
        <button type="submit" style={{ padding: "8px 15px" }}>
          Agregar
        </button>
      </form>

      {/* Tabla */}
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
          </tr>
        </thead>
        <tbody>
          {tareas.map((tarea) => (
            <tr key={tarea.id}>
              <td>{tarea.id}</td>
              <td>{tarea.nombre}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
