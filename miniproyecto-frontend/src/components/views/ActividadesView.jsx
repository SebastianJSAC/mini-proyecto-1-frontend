import { useOutletContext } from "react-router-dom";

import { AlertCircle, CalendarDays, LayoutGrid, CheckCheck } from "lucide-react";

import TaskCard from "../TaskCard.jsx";

import { useTask } from "../../hooks/useTask.js";



function isRootTask(t) {

    return t.parent == null && t.parent_id == null;

}



function startOfToday() {

    const d = new Date();

    d.setHours(0, 0, 0, 0);

    return d;

}



function isDueToday(fechaEntrega) {

    if (!fechaEntrega) return false;

    const f = new Date(fechaEntrega);

    const h = startOfToday();

    return (

        f.getDate() === h.getDate() &&

        f.getMonth() === h.getMonth() &&

        f.getFullYear() === h.getFullYear()

    );

}



function KanbanColumn({ title, subtitle, icon: Icon, columnClass, count, headerAction, children }) {

    return (

        <div

            className={`flex flex-col rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden min-h-[320px] max-h-[min(82vh,940px)] ${columnClass}`}

        >

            <header className="shrink-0 px-4 py-3.5 bg-white/80 border-b border-slate-200/70 backdrop-blur-sm">

                <div className="flex items-start justify-between gap-3">

                    <div className="flex items-center gap-3 min-w-0">

                        <div className="p-2 rounded-xl bg-white border border-slate-200 text-emerald-600 shadow-sm shrink-0">

                            <Icon size={20} aria-hidden />

                        </div>

                        <div className="min-w-0">

                            <h2 className="text-base font-bold text-slate-900 tracking-tight">{title}</h2>

                            {subtitle && <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{subtitle}</p>}

                        </div>

                    </div>

                    <span

                        className="shrink-0 min-w-[1.75rem] h-7 px-2 flex items-center justify-center rounded-full bg-slate-900/5 text-slate-700 text-xs font-bold tabular-nums border border-slate-200/80"

                        aria-label={`${count} tareas`}

                    >

                        {count}

                    </span>

                </div>

                {headerAction ? <div className="mt-3">{headerAction}</div> : null}

            </header>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-3 min-h-0 custom-scrollbar">{children}</div>

        </div>

    );

}



export default function ActividadesView() {

    const { tasks, setTasks, API_URL } = useOutletContext();

    const actions = useTask(null, setTasks, API_URL);



    const roots = tasks.filter(isRootTask);

    const ahora = new Date();



    const vencidas = roots

        .filter((t) => t.fecha_entrega && new Date(t.fecha_entrega) < ahora && !t.completada)

        .sort((a, b) => new Date(a.fecha_entrega) - new Date(b.fecha_entrega));



    const hoy = roots

        .filter((t) => !t.completada && t.fecha_entrega && isDueToday(t.fecha_entrega))

        .sort((a, b) => (a.carga_mental ?? 999) - (b.carga_mental ?? 999));



    const idsVencHoy = new Set([...vencidas, ...hoy].map((t) => t.id));

    const todas = roots

        .filter((t) => !idsVencHoy.has(t.id))

        .sort((a, b) => {

            if (a.completada !== b.completada) return a.completada ? 1 : -1;

            const fa = a.fecha_entrega ? new Date(a.fecha_entrega) : null;

            const fb = b.fecha_entrega ? new Date(b.fecha_entrega) : null;

            if (!fa && !fb) return 0;

            if (!fa) return 1;

            if (!fb) return -1;

            return fa - fb;

        });



    const renderCards = (lista, cardAccent) => {

        if (lista.length === 0) {

            return (

                <div className="flex flex-1 flex-col items-center justify-center min-h-[140px] mx-0.5 px-4 py-10 rounded-xl border border-dashed border-slate-300/70 bg-white/50">

                    <p className="text-sm text-slate-500 text-center leading-relaxed">Sin tareas en esta columna.</p>

                </div>

            );

        }

        return lista.map((tarea) => (

            <TaskCard

                key={tarea.id}

                tarea={tarea}

                setTasks={setTasks}

                API_URL={API_URL}

                verticalLayout

                variant="kanban"

                cardAccent={cardAccent}

            />

        ));

    };



    return (

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 items-stretch">

            <KanbanColumn

                title="Vencidas"

                subtitle="Fecha pasada, aún pendientes"

                icon={AlertCircle}

                columnClass="bg-gradient-to-b from-rose-50/90 to-slate-50/40 ring-1 ring-rose-100/60"

                count={vencidas.length}

                headerAction={

                    vencidas.length > 0 ? (

                        <button

                            type="button"

                            onClick={() => actions.handleCompleteAllVencidas(vencidas)}

                            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition-all shadow-sm"

                        >

                            <CheckCheck size={14} />

                            Completar todas

                        </button>

                    ) : null

                }

            >

                {renderCards(vencidas, "border-l-rose-500")}

            </KanbanColumn>



            <KanbanColumn

                title="Hoy"

                subtitle="Entregas con fecha de hoy"

                icon={CalendarDays}

                columnClass="bg-gradient-to-b from-amber-50/90 to-slate-50/40 ring-1 ring-amber-100/70"

                count={hoy.length}

                headerAction={

                    hoy.length > 0 ? (

                        <button

                            type="button"

                            onClick={() => actions.handleCompleteAllHoy(hoy)}

                            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 transition-all shadow-sm"

                        >

                            <CheckCheck size={14} />

                            Completar todas

                        </button>

                    ) : null

                }

            >

                {renderCards(hoy, "border-l-amber-500")}

            </KanbanColumn>



            <KanbanColumn

                title="Todas"

                subtitle="Próximas, sin fecha, completadas y el resto"

                icon={LayoutGrid}

                columnClass="bg-gradient-to-b from-sky-50/80 to-slate-50/40 ring-1 ring-sky-100/60"

                count={todas.length}

            >

                {renderCards(todas, "border-l-sky-500")}

            </KanbanColumn>

        </div>

    );

}


