import {Play, Pause, RotateCcw} from "lucide-react";
import {useState, useEffect} from "react";

export default function PomodoroTimer(){

    const [timerRunning,setTimerRunning] = useState(false);
    const [timeRemaining,setTimeRemaining] = useState(25*60);

    useEffect(()=>{
        let interval;

        if(timerRunning && timeRemaining > 0){
            interval = setInterval(()=>{
                setTimeRemaining(t=>t-1);
            },1000);
        }

        if(timeRemaining === 0){
            setTimerRunning(false);
        }

        return ()=>clearInterval(interval);
    },[timerRunning,timeRemaining]);

    const formatTime = (seconds)=>{
        const mins = Math.floor(seconds/60);
        const secs = seconds%60;

        return `${mins.toString().padStart(2,"0")}:${secs.toString().padStart(2,"0")}`;
    };

    const resetTimer = ()=>{
        setTimeRemaining(25*60);
        setTimerRunning(false);
    };

    return(
        <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <div className="text-center mb-6">
                    <div className="text-5xl font-light mb-2">
                        {formatTime(timeRemaining)}
                    </div>

                    <div className="text-sm text-gray-500">
                        {timerRunning ? "En progreso":"Pomodoro"}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={()=>setTimerRunning(!timerRunning)}
                        className="flex-1 py-3 bg-emerald-600 text-white rounded-xl flex items-center justify-center gap-2"
                    >
                        {timerRunning ? <Pause size={20}/> : <Play size={20}/>}
                        {timerRunning ? "Pausar":"Iniciar"}
                    </button>

                    <button
                        onClick={resetTimer}
                        className="px-4 py-3 bg-gray-100 rounded-xl"
                    >
                        <RotateCcw size={20}/>
                    </button>
                </div>
            </div>
        </div>
    );
}