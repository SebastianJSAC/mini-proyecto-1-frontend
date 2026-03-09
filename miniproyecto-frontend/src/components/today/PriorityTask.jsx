import {CalendarDays, Brain} from "lucide-react";

export default function PriorityTask({tarea}){

    const subts = tarea?.subtareas || [];

    const completadas = subts.filter(st=>st.completada).length;
    const totalSubtareas = subts.length;

    const progreso = totalSubtareas
        ? Math.round((completadas/totalSubtareas)*100)
        : 0;

    return(
        <div className="bg-white border rounded-2xl p-6 shadow-sm">

            <h3 className="text-xl font-semibold mb-2">
                {tarea.nombre}
            </h3>

            <div className="flex items-center gap-3 text-sm text-gray-500">
                <CalendarDays size={16}/>

                {tarea.fecha_entrega
                    ? new Date(tarea.fecha_entrega).toLocaleString()
                    : "Sin fecha"}

                {tarea.carga_mental && (
                    <>
                        <Brain size={16}/>
                        Nivel {tarea.carga_mental}
                    </>
                )}
            </div>

            <div className="mt-4">
                <div className="w-full bg-gray-100 h-2 rounded-full">
                    <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{width:`${progreso}%`}}
                    />
                </div>
            </div>
        </div>
    );
}