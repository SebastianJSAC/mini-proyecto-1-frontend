import { useState, Fragment } from "react";

export default function TaskRow({ tarea, nivel = 0, setTasks, API_URL }) {

  const [mostrarInput, setMostrarInput] = useState(false);
  const [nuevoNombreSub, setNuevoNombreSub] = useState("");

  const actualizarRecursivo = (tareas, id, callback) => {
    return tareas.map(t => {

      if (t.id === id) return callback(t);

      if (t.subtareas) {
        return {
          ...t,
          subtareas: actualizarRecursivo(t.subtareas, id, callback)
        };
      }

      return t;
    });
  };

  const crearSubtarea = async (e) => {

    e.preventDefault();

    if (!nuevoNombreSub.trim()) return;

    try {

      const response = await fetch(`${API_URL}/tareas/api/tareas/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nombre: nuevoNombreSub,
          parent: tarea.id
        })
      });

      const res = await response.json();

      if (response.ok) {

        setTasks(prev =>
          actualizarRecursivo(prev, tarea.id, t => ({
            ...t,
            subtareas: [...(t.subtareas || []), res.data]
          }))
        );

        setNuevoNombreSub("");
        setMostrarInput(false);
      }

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Fragment>

      <div
        className="flex items-center justify-between border rounded-lg p-3 bg-white"
        style={{ marginLeft: `${nivel * 20}px` }}
      >

        <span>{tarea.nombre}</span>

        <div className="flex gap-2">

          <button
            onClick={() => setMostrarInput(!mostrarInput)}
            className="text-blue-500"
          >
            +
          </button>

        </div>

      </div>

      {mostrarInput && (
        <form
          onSubmit={crearSubtarea}
          className="flex gap-2 mt-2"
          style={{ marginLeft: `${(nivel + 1) * 20}px` }}
        >

          <input
            value={nuevoNombreSub}
            onChange={(e) => setNuevoNombreSub(e.target.value)}
            className="border rounded px-2 py-1"
            placeholder="Nueva subtarea"
          />

          <button
            type="submit"
            className="bg-emerald-600 text-white px-3 rounded"
          >
            Crear
          </button>

        </form>
      )}

      {tarea.subtareas &&
        tarea.subtareas.map(sub => (
          <TaskRow
            key={sub.id}
            tarea={sub}
            nivel={nivel + 1}
            setTasks={setTasks}
            API_URL={API_URL}
          />
        ))}

    </Fragment>
  );
}